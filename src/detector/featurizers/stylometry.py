from __future__ import annotations

import statistics
from dataclasses import dataclass

from ..utils.lang_detect import Language
from .base import FeatureDict, FeatureExtractor


_COMMENT_PREFIXES = {
    Language.PYTHON: ("#",),
    Language.JAVASCRIPT: ("//", "/*"),
}


@dataclass
class StylometryFeaturizer(FeatureExtractor):
    """Basic stylistic signals shared across languages."""

    name: str = "stylometry"
    languages: tuple[Language | None, ...] = (None,)

    def featurize(self, text: str, *, language: Language) -> FeatureDict:
        lines = text.splitlines()
        total_lines = len(lines) if lines else 1
        stripped_lines = [line.rstrip("\n") for line in lines]
        lengths = [len(line) for line in stripped_lines]
        mean_line_length = statistics.fmean(lengths) if lengths else 0.0
        max_line_length = max(lengths, default=0)
        blank_lines = sum(1 for line in stripped_lines if not line.strip())
        whitespace_chars = sum(line.count(" ") for line in stripped_lines)
        tab_chars = sum(line.count("\t") for line in stripped_lines)
        total_chars = sum(len(line) for line in stripped_lines) or 1
        comment_prefixes = _COMMENT_PREFIXES.get(language, ("#", "//"))
        comment_lines = sum(
            1
            for line in stripped_lines
            if line.strip().startswith(comment_prefixes)
        )
        indentation_levels = [len(line) - len(line.lstrip(" \t")) for line in stripped_lines if line.strip()]
        avg_indent = statistics.fmean(indentation_levels) if indentation_levels else 0.0
        max_indent = max(indentation_levels, default=0)

        return {
            "line_count": float(total_lines),
            "blank_line_ratio": blank_lines / total_lines,
            "mean_line_length": mean_line_length,
            "max_line_length": float(max_line_length),
            "comment_line_ratio": comment_lines / total_lines,
            "whitespace_ratio": whitespace_chars / total_chars,
            "tab_ratio": tab_chars / total_chars,
            "avg_indentation": avg_indent,
            "max_indentation": float(max_indent),
        }
