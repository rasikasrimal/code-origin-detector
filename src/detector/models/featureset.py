from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, Iterable, List, Sequence


@dataclass
class FeatureSet:
    """Container for a single example's features."""

    dense: Dict[str, float]

    def select(self, keys: Sequence[str]) -> List[float]:
        return [float(self.dense.get(key, 0.0)) for key in keys]


@dataclass
class FeatureIndex:
    """Mapping between feature names and column indices."""

    keys: List[str] = field(default_factory=list)

    def ensure(self, features: Iterable[str]) -> None:
        for key in features:
            if key not in self.keys:
                self.keys.append(key)

    def transform(self, feature_set: FeatureSet) -> List[float]:
        return feature_set.select(self.keys)
