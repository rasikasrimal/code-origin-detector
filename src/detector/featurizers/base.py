from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, MutableMapping

from ..utils.lang_detect import Language

FeatureValue = float | int | str
FeatureDict = Dict[str, FeatureValue]


@dataclass
class FeatureExtractor:
    """Base class for all feature extractors."""

    name: str
    languages: tuple[Language | None, ...] = (None,)

    def applies_to(self, language: Language) -> bool:
        return None in self.languages or language in self.languages

    def featurize(self, text: str, *, language: Language) -> FeatureDict:  # pragma: no cover - abstract
        raise NotImplementedError


@dataclass
class FeaturePipeline:
    """Run multiple feature extractors and combine their outputs."""

    extractors: tuple[FeatureExtractor, ...]

    def run(self, text: str, *, language: Language) -> FeatureDict:
        features: MutableMapping[str, FeatureValue] = {}
        for extractor in self.extractors:
            if not extractor.applies_to(language):
                continue
            scoped = extractor.featurize(text, language=language)
            for key, value in scoped.items():
                namespaced = f"{extractor.name}.{key}" if not key.startswith(f"{extractor.name}.") else key
                features[namespaced] = value
        return dict(features)
