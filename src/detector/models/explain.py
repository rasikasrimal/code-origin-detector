from __future__ import annotations

from typing import Iterable, Sequence

from ..heuristics import HeuristicSignal


def merge_explanations(
    heuristics: Sequence[HeuristicSignal],
    shap_contrib: dict[str, float] | None = None,
    top_k: int = 5,
) -> list[str]:
    """Combine heuristic messages and optional SHAP contributions."""
    reasons: list[str] = []
    for signal in heuristics:
        if not signal.triggered:
            continue
        evidence = ", ".join(signal.evidence) if signal.evidence else ""
        suffix = f" ({evidence})" if evidence else ""
        reasons.append(f"{signal.message}{suffix} [+{signal.score:.2f}]")
    if shap_contrib:
        sorted_items = sorted(shap_contrib.items(), key=lambda kv: abs(kv[1]), reverse=True)
        for feature, value in sorted_items[:top_k]:
            sign = "+" if value >= 0 else "-"
            reasons.append(f"Feature {feature} {sign}{abs(value):.2f}")
    return reasons[:top_k]
