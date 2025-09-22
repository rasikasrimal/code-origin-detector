from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, Sequence

import joblib
import numpy as np

from ..heuristics import HeuristicSignal
from .featureset import FeatureIndex, FeatureSet


@dataclass
class PredictionOutput:
    probability_ai: float
    contributing_features: dict[str, float]


class BaseDetectorModel:
    def predict_proba(
        self,
        feature_vector: FeatureSet,
        signals: Sequence[HeuristicSignal],
    ) -> PredictionOutput:  # pragma: no cover - interface
        raise NotImplementedError


class HeuristicModel(BaseDetectorModel):
    """Simple ensemble over heuristic signals."""

    def predict_proba(
        self,
        feature_vector: FeatureSet,
        signals: Sequence[HeuristicSignal],
    ) -> PredictionOutput:
        positive = [signal.weight * signal.score for signal in signals if signal.triggered]
        total_weight = sum(signal.weight for signal in signals if signal.triggered) or 1.0
        confidence = min(0.99, sum(positive) / (total_weight * 1.2))
        explanations = {signal.id: signal.score for signal in signals if signal.triggered}
        return PredictionOutput(probability_ai=float(confidence), contributing_features=explanations)


class SklearnModel(BaseDetectorModel):
    """Wrapper for calibrated sklearn estimators saved with joblib."""

    def __init__(self, estimator, feature_index: FeatureIndex):
        self.estimator = estimator
        self.feature_index = feature_index

    def predict_proba(
        self,
        feature_vector: FeatureSet,
        signals: Sequence[HeuristicSignal],
    ) -> PredictionOutput:
        vector = np.array([self.feature_index.transform(feature_vector)])
        probability = float(self.estimator.predict_proba(vector)[0, 1])
        contributions = {signal.id: signal.score for signal in signals if signal.triggered}
        return PredictionOutput(probability_ai=probability, contributing_features=contributions)


def load_sklearn_model(model_path: Path) -> SklearnModel:
    payload = joblib.load(model_path)
    estimator = payload["model"]
    index = FeatureIndex(keys=payload["feature_index"])
    return SklearnModel(estimator=estimator, feature_index=index)
