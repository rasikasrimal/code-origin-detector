from __future__ import annotations

import ast
import statistics
from collections import Counter
from dataclasses import dataclass
import re

from ..utils.lang_detect import Language
from .base import FeatureDict, FeatureExtractor

_GENERIC_IDENTIFIERS = {
    "data",
    "temp",
    "value",
    "result",
    "item",
    "list",
    "dict",
    "foo",
    "bar",
    "input",
    "output",
}
_CAMEL_CASE = re.compile(r"^[a-z]+(?:[A-Z][a-z0-9]+)+$")
_SNAKE_CASE = re.compile(r"^[a-z_][a-z0-9_]*$")


@dataclass
class PythonAstFeaturizer(FeatureExtractor):
    name: str = "python_ast"
    languages: tuple[Language | None, ...] = (Language.PYTHON,)

    def featurize(self, text: str, *, language: Language) -> FeatureDict:  # noqa: D401
        try:
            tree = ast.parse(text)
        except SyntaxError:
            return {"parse_success": 0.0}

        node_types = Counter(type(node).__name__ for node in ast.walk(tree))
        features: FeatureDict = {
            "parse_success": 1.0,
            "ast_node_count": float(sum(node_types.values())),
            "ast_unique_types": float(len(node_types)),
            "ast_max_depth": float(_max_depth(tree)),
        }

        for node_name, count in node_types.items():
            features[f"node.{node_name}"] = float(count)

        identifier_stats = _identifier_features(tree)
        features.update(identifier_stats)
        func_stats = _function_metrics(tree, text)
        features.update(func_stats)
        comprehension_count = sum(isinstance(node, ast.comprehension) for node in ast.walk(tree))
        features["comprehension_count"] = float(comprehension_count)
        lambda_count = sum(isinstance(node, ast.Lambda) for node in ast.walk(tree))
        features["lambda_count"] = float(lambda_count)
        exception_handlers = sum(isinstance(node, ast.ExceptHandler) for node in ast.walk(tree))
        features["except_handler_count"] = float(exception_handlers)
        return features


def _max_depth(node: ast.AST) -> int:
    children = list(ast.iter_child_nodes(node))
    if not children:
        return 1
    return 1 + max(_max_depth(child) for child in children)


def _identifier_features(tree: ast.AST) -> FeatureDict:
    names: list[str] = []
    for node in ast.walk(tree):
        if isinstance(node, ast.Name):
            names.append(node.id)
        elif isinstance(node, ast.arg):
            names.append(node.arg)
    total = len(names) or 1
    snake = sum(1 for name in names if _SNAKE_CASE.match(name))
    camel = sum(1 for name in names if _CAMEL_CASE.match(name))
    generic = sum(1 for name in names if name.lower() in _GENERIC_IDENTIFIERS)
    return {
        "identifier.count": float(len(names)),
        "identifier.snake_ratio": snake / total,
        "identifier.camel_ratio": camel / total,
        "identifier.generic_ratio": generic / total,
    }


def _function_metrics(tree: ast.AST, text: str) -> FeatureDict:
    function_lengths: list[int] = []
    arg_counts: list[int] = []
    decorator_counts: list[int] = []
    async_count = 0
    for node in ast.walk(tree):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            async_count += int(isinstance(node, ast.AsyncFunctionDef))
            start = getattr(node, "lineno", None)
            end = getattr(node, "end_lineno", None)
            if start is not None and end is not None:
                function_lengths.append(max(1, end - start + 1))
            arg_counts.append(len(getattr(node.args, "args", [])))
            decorator_counts.append(len(getattr(node, "decorator_list", [])))
    metrics: FeatureDict = {
        "function.count": float(len(function_lengths)),
        "function.async_ratio": async_count / (len(function_lengths) or 1),
    }
    if function_lengths:
        metrics["function.length_mean"] = float(statistics.fmean(function_lengths))
        metrics["function.length_p95"] = float(_percentile(function_lengths, 0.95))
        metrics["function.length_max"] = float(max(function_lengths))
    else:
        metrics["function.length_mean"] = 0.0
        metrics["function.length_p95"] = 0.0
        metrics["function.length_max"] = 0.0
    metrics["function.arg_mean"] = float(statistics.fmean(arg_counts)) if arg_counts else 0.0
    metrics["function.decorator_mean"] = (
        float(statistics.fmean(decorator_counts)) if decorator_counts else 0.0
    )
    return metrics


def _percentile(values: list[int], pct: float) -> float:
    if not values:
        return 0.0
    ordered = sorted(values)
    rank = int(pct * (len(ordered) - 1))
    return float(ordered[rank])
