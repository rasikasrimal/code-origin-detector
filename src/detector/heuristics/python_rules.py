from __future__ import annotations

from ..heuristics import HeuristicSignal, HeuristicRule


def rule_generic_identifiers(features: dict[str, float | int | str], text: str) -> HeuristicSignal:
    ratio = float(features.get("python_ast.identifier.generic_ratio", 0.0))
    triggered = ratio >= 0.12
    score = min(1.0, (ratio - 0.12) / 0.2 + 0.1) if triggered else 0.0
    evidence = [f"generic_name_ratio={ratio:.2f}"] if triggered else []
    return HeuristicSignal(
        id="python.naming.generic_identifiers",
        triggered=triggered,
        score=score,
        message="Unusually high proportion of generic identifiers.",
        evidence=evidence,
        weight=1.2,
    )


def rule_comment_complexity_gap(features: dict[str, float | int | str], text: str) -> HeuristicSignal:
    comment_ratio = float(features.get("stylometry.comment_line_ratio", 0.0))
    func_count = float(features.get("python_ast.function.count", 0.0))
    func_p95 = float(features.get("python_ast.function.length_p95", 0.0))
    triggered = func_count >= 3 and func_p95 >= 60 and comment_ratio < 0.02
    score = 0.5 + min(0.5, (func_p95 / 100.0)) if triggered else 0.0
    evidence = [
        f"functions={func_count:.0f}",
        f"p95_len={func_p95:.0f}",
        f"comment_ratio={comment_ratio:.2f}",
    ] if triggered else []
    return HeuristicSignal(
        id="python.comments.complexity_gap",
        triggered=triggered,
        score=score,
        message="Complex functions with very sparse comments.",
        evidence=evidence,
        weight=1.1,
    )


def rule_loop_over_comprehension(features: dict[str, float | int | str], text: str) -> HeuristicSignal:
    comp_count = float(features.get("python_ast.comprehension_count", 0.0))
    for_count = float(features.get("python_ast.node.For", 0.0))
    triggered = for_count >= 5 and comp_count == 0
    score = min(1.0, for_count / 12.0) if triggered else 0.0
    evidence = [f"for_loops={for_count:.0f}", "no_comprehensions"] if triggered else []
    return HeuristicSignal(
        id="python.idioms.loop_over_comprehension",
        triggered=triggered,
        score=score,
        message="Many loops but no comprehensions, suggesting low idiom usage.",
        evidence=evidence,
        weight=0.9,
    )


def rule_exception_broad(features: dict[str, float | int | str], text: str) -> HeuristicSignal:
    except_handlers = int(float(features.get("python_ast.except_handler_count", 0.0)))
    triggered = "except Exception" in text or "except:" in text
    score = 0.3 + 0.1 * except_handlers if triggered else 0.0
    evidence = [f"except_handlers={except_handlers}"] if triggered else []
    return HeuristicSignal(
        id="python.quality.broad_except",
        triggered=triggered,
        score=score,
        message="Broad exception handlers without logging.",
        evidence=evidence,
        weight=0.6,
    )


PYTHON_RULES: list[HeuristicRule] = [
    rule_generic_identifiers,
    rule_comment_complexity_gap,
    rule_loop_over_comprehension,
    rule_exception_broad,
]
