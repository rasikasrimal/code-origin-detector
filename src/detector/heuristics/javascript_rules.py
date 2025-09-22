from __future__ import annotations

from ..heuristics import HeuristicSignal, HeuristicRule


ARRAY_METHOD_TOKENS = [".map", ".filter", ".reduce", ".forEach"]


def rule_generic_identifiers(features: dict[str, float | int | str], text: str) -> HeuristicSignal:
    ratio = float(features.get("js_syntax.identifier.generic_ratio", 0.0))
    triggered = ratio >= 0.15 and float(features.get("js_syntax.identifier.count", 0.0)) >= 30
    score = min(1.0, (ratio - 0.15) / 0.25 + 0.1) if triggered else 0.0
    evidence = [f"generic_ratio={ratio:.2f}"] if triggered else []
    return HeuristicSignal(
        id="javascript.naming.generic_identifiers",
        triggered=triggered,
        score=score,
        message="Many generic identifiers such as data/temp/value.",
        evidence=evidence,
        weight=1.0,
    )


def rule_comment_density(features: dict[str, float | int | str], text: str) -> HeuristicSignal:
    comment_ratio = float(features.get("stylometry.comment_line_ratio", 0.0))
    line_count = float(features.get("stylometry.line_count", 0.0))
    triggered = line_count >= 80 and comment_ratio < 0.01
    score = 0.4 + min(0.6, line_count / 400.0) if triggered else 0.0
    evidence = [f"line_count={line_count:.0f}", f"comment_ratio={comment_ratio:.2f}"] if triggered else []
    return HeuristicSignal(
        id="javascript.comments.sparse",
        triggered=triggered,
        score=score,
        message="Long file with extremely sparse comments.",
        evidence=evidence,
        weight=0.8,
    )


def rule_loop_bias(features: dict[str, float | int | str], text: str) -> HeuristicSignal:
    loop_tokens = float(features.get("js_syntax.loop_token_count", 0.0))
    array_methods = sum(token in text for token in ARRAY_METHOD_TOKENS)
    triggered = loop_tokens >= 4 and array_methods == 0
    score = min(1.0, loop_tokens / 10.0) if triggered else 0.0
    evidence = [f"loop_tokens={loop_tokens:.0f}", "no_array_methods"] if triggered else []
    return HeuristicSignal(
        id="javascript.idioms.loop_bias",
        triggered=triggered,
        score=score,
        message="Frequent manual loops with no higher-order array usage.",
        evidence=evidence,
        weight=0.9,
    )


def rule_header_comment(text_features: dict[str, float | int | str], text: str) -> HeuristicSignal:
    header = text.strip().splitlines()[:3]
    triggered = any(
        line.lower().startswith("this script will") or "step 1" in line.lower()
        for line in header
    )
    score = 0.7 if triggered else 0.0
    evidence = header if triggered else []
    return HeuristicSignal(
        id="javascript.comments.explanatory_header",
        triggered=triggered,
        score=score,
        message="Explanatory header closely matching common LLM preambles.",
        evidence=evidence,
        weight=1.1,
    )


JAVASCRIPT_RULES: list[HeuristicRule] = [
    rule_generic_identifiers,
    rule_comment_density,
    rule_loop_bias,
    rule_header_comment,
]
