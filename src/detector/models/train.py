from __future__ import annotations

from pathlib import Path
from typing import Dict, Iterable, Tuple

import joblib
import numpy as np
import pandas as pd
from sklearn.calibration import CalibratedClassifierCV
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report
from sklearn.model_selection import GroupKFold

from .featureset import FeatureIndex, FeatureSet


def build_feature_matrix(feature_sets: Iterable[FeatureSet], index: FeatureIndex) -> np.ndarray:
    vectors = [index.transform(feature_set) for feature_set in feature_sets]
    return np.asarray(vectors, dtype=float)


def train_models(
    X: np.ndarray,
    y: np.ndarray,
    groups: np.ndarray,
) -> Dict[str, CalibratedClassifierCV]:
    """Train calibrated logistic regression and random forest baselines."""
    cv = GroupKFold(n_splits=min(5, len(np.unique(groups))))
    lr = CalibratedClassifierCV(
        base_estimator=LogisticRegression(
            max_iter=2000,
            class_weight="balanced",
            solver="liblinear",
        ),
        method="isotonic",
        cv=cv,
    )
    rf = CalibratedClassifierCV(
        base_estimator=RandomForestClassifier(
            n_estimators=300,
            max_depth=20,
            class_weight="balanced",
            n_jobs=-1,
        ),
        method="isotonic",
        cv=cv,
    )
    lr.fit(X, y)
    rf.fit(X, y)
    return {"lr_v1": lr, "rf_v1": rf}


def save_model(model, feature_index: FeatureIndex, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump({"model": model, "feature_index": feature_index.keys}, path)


def evaluate_model(model, X: np.ndarray, y: np.ndarray) -> Dict[str, float]:
    preds = model.predict(X)
    report = classification_report(y, preds, output_dict=True)
    return {
        "macro_f1": float(report["macro avg"]["f1-score"]),
        "accuracy": float(report["accuracy"]),
    }
