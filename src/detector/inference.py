from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Sequence

import pandas as pd
from rich.console import Console
from rich.table import Table
from sklearn.metrics import (
    accuracy_score,
    balanced_accuracy_score,
    classification_report,
    confusion_matrix,
    roc_auc_score,
)

from .featurizers.base import FeaturePipeline
from .featurizers.js_ast import JavaScriptHeuristicFeaturizer
from .featurizers.python_ast import PythonAstFeaturizer
from .featurizers.stylometry import StylometryFeaturizer
from .heuristics import HeuristicSignal, apply_rules, select_rules
from .models.baselines import BaseDetectorModel, HeuristicModel, PredictionOutput, load_sklearn_model
from .models.explain import merge_explanations
from .models.featureset import FeatureIndex, FeatureSet
from .utils.io import iter_source_files, read_text, write_json
from .utils.lang_detect import Language, detect_language
from .utils.logging import get_logger


logger = get_logger(__name__)
console = Console()


@dataclass
class PredictionResult:
    path: Path
    label: str
    confidence: float
    probability_ai: float
    language: Language
    explanations: list[str]
    heuristics: list[HeuristicSignal]
    features: dict[str, float | int | str]


@dataclass
class BenchmarkRequest:
    manifest_path: Path
    group_path: Path | None = None


class Predictor:
    def __init__(self, model_name: str = "heuristic_v1") -> None:
        self.model_name = model_name
        self.pipeline = FeaturePipeline(
            (
                StylometryFeaturizer(),
                PythonAstFeaturizer(),
                JavaScriptHeuristicFeaturizer(),
            )
        )
        self.feature_index = FeatureIndex()
        self.model = self._load_model()

    def _load_model(self) -> BaseDetectorModel:
        if self.model_name == "heuristic_v1":
            return HeuristicModel()
        model_path = Path(self.model_name)
        if not model_path.exists():
            default_path = Path("artifacts") / f"{self.model_name}.joblib"
            if default_path.exists():
                model_path = default_path
            else:
                logger.warning(
                    "Model '%s' not found. Falling back to heuristic_v1.",
                    self.model_name,
                )
                self.model_name = "heuristic_v1"
                return HeuristicModel()
        loaded = load_sklearn_model(model_path)
        self.feature_index.keys = list(loaded.feature_index.keys)
        return loaded

    def predict_file(self, path: Path) -> PredictionResult:
        text = read_text(path)
        language = detect_language(path, text)
        features = self.pipeline.run(text, language=language)
        numeric_features = {
            key: float(value) if isinstance(value, (int, float)) else 0.0
            for key, value in features.items()
        }
        self.feature_index.ensure(numeric_features.keys())
        feature_set = FeatureSet(dense=numeric_features)
        rules = select_rules(language)
        signals = apply_rules(rules, features, text)
        output = self.model.predict_proba(feature_set, signals)
        probability_ai = output.probability_ai
        label = "ai" if probability_ai >= 0.5 else "human"
        confidence = probability_ai if label == "ai" else 1.0 - probability_ai
        explanations = merge_explanations(signals, output.contributing_features)
        return PredictionResult(
            path=path,
            label=label,
            confidence=float(confidence),
            probability_ai=probability_ai,
            language=language,
            explanations=explanations,
            heuristics=signals,
            features=features,
        )

    def predict_path(
        self,
        path: Path,
        include: str,
        exclude: str,
        threshold: float,
    ) -> list[PredictionResult]:
        include_globs = [pattern.strip() for pattern in include.split(",") if pattern.strip()]
        exclude_globs = [pattern.strip() for pattern in exclude.split(",") if pattern.strip()]
        predictions: list[PredictionResult] = []
        for file_path in iter_source_files(path, include_globs, exclude_globs):
            result = self.predict_file(file_path)
            predictions.append(result)
        predictions.sort(key=lambda item: item.probability_ai, reverse=True)
        return predictions

    def render(
        self,
        results: Sequence[PredictionResult],
        output_format: str = "pretty",
        report_path: Path | None = None,
        max_reasons: int = 3,
    ) -> None:
        records = [
            {
                "path": str(result.path),
                "label": result.label,
                "confidence": result.confidence,
                "probability_ai": result.probability_ai,
                "language": result.language.value,
                "explanations": result.explanations[:max_reasons],
            }
            for result in results
        ]

        if report_path is not None:
            write_json(report_path, records)

        if output_format == "json":
            console.print_json(json.dumps(records))
            return

        table = Table(title=f"Code Origin Detection ({self.model_name})", show_lines=True)
        table.add_column("Path", overflow="fold")
        table.add_column("Label")
        table.add_column("Confidence", justify="right")
        table.add_column("Probability (AI)", justify="right")
        table.add_column("Language")
        table.add_column("Reasons", overflow="fold")
        for result in results:
            reasons = "\n".join(result.explanations[:max_reasons]) if result.explanations else "—"
            table.add_row(
                str(result.path),
                result.label,
                f"{result.confidence:.2f}",
                f"{result.probability_ai:.2f}",
                result.language.value,
                reasons,
            )
        console.print(table)

    def evaluate(self, request: BenchmarkRequest) -> None:
        df = pd.read_csv(request.manifest_path)
        if "path" not in df.columns or "label" not in df.columns:
            raise ValueError("Manifest must contain 'path' and 'label' columns.")
        preds: list[PredictionResult] = []
        y_true: list[int] = []
        for _, row in df.iterrows():
            prediction = self.predict_file(Path(row["path"]))
            preds.append(prediction)
            y_true.append(1 if row["label"].lower() == "ai" else 0)
        y_scores = [pred.probability_ai for pred in preds]
        y_pred = [1 if score >= 0.5 else 0 for score in y_scores]

        metrics = {
            "macro_f1": float(classification_report(y_true, y_pred, output_dict=True)["macro avg"]["f1-score"]),
            "balanced_accuracy": float(balanced_accuracy_score(y_true, y_pred)),
            "accuracy": float(accuracy_score(y_true, y_pred)),
        }
        try:
            metrics["auroc"] = float(roc_auc_score(y_true, y_scores))
        except ValueError:
            metrics["auroc"] = float("nan")
        cm = confusion_matrix(y_true, y_pred)

        console.print("Metrics:")
        for key, value in metrics.items():
            console.print(f"  {key}: {value:.3f}")
        console.print("Confusion matrix (rows=true, cols=pred):")
        console.print(cm)


