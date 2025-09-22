from __future__ import annotations

from dataclasses import dataclass
from typing import Callable, Iterable, List, Protocol

from ..utils.lang_detect import Language


@dataclass
class HeuristicSignal:
    id: str
    triggered: bool
    score: float
    message: str
    evidence: List[str]
    weight: float = 1.0


class HeuristicRule(Protocol):
    def __call__(self, features: dict[str, float | int | str], text: str) -> HeuristicSignal:  # pragma: no cover - protocol
        ...


def apply_rules(
    rules: Iterable[HeuristicRule],
    features: dict[str, float | int | str],
    text: str,
) -> list[HeuristicSignal]:
    return [rule(features, text) for rule in rules]


def select_rules(language: Language) -> list[HeuristicRule]:
    from .javascript_rules import JAVASCRIPT_RULES
    from .python_rules import PYTHON_RULES

    if language == Language.PYTHON:
        return PYTHON_RULES
    if language == Language.JAVASCRIPT:
        return JAVASCRIPT_RULES
    return []
