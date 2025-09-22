from __future__ import annotations

import re
from dataclasses import dataclass

from ..utils.lang_detect import Language
from .base import FeatureDict, FeatureExtractor

_FUNC_DECL = re.compile(r"function\s+([a-zA-Z0-9_$]+)?", re.MULTILINE)
_ARROW_DECL = re.compile(r"=>")
_LOOP_TOKENS = re.compile(r"\b(for|while)\b")
_IMPORT_TOKEN = re.compile(r"\bimport\b")
_EXPORT_TOKEN = re.compile(r"\bexport\b")
_GENERIC_IDENTIFIERS = {
    "data",
    "temp",
    "value",
    "result",
    "item",
    "list",
    "array",
    "obj",
    "object",
}
_IDENTIFIER = re.compile(r"[a-zA-Z_$][a-zA-Z0-9_$]*")
_CAMEL = re.compile(r"^[a-z]+(?:[A-Z][a-z0-9]+)+$")
_SNAKE = re.compile(r"^[a-z_][a-z0-9_]*$")


@dataclass
class JavaScriptHeuristicFeaturizer(FeatureExtractor):
    name: str = "js_syntax"
    languages: tuple[Language | None, ...] = (Language.JAVASCRIPT,)

    def featurize(self, text: str, *, language: Language) -> FeatureDict:
        identifiers = _IDENTIFIER.findall(text)
        total = len(identifiers) or 1
        camel = sum(1 for name in identifiers if _CAMEL.match(name))
        snake = sum(1 for name in identifiers if _SNAKE.match(name))
        generic = sum(1 for name in identifiers if name.lower() in _GENERIC_IDENTIFIERS)
        return {
            "function_decl_count": float(len(_FUNC_DECL.findall(text))),
            "arrow_function_count": float(len(_ARROW_DECL.findall(text))),
            "loop_token_count": float(len(_LOOP_TOKENS.findall(text))),
            "import_token_count": float(len(_IMPORT_TOKEN.findall(text))),
            "export_token_count": float(len(_EXPORT_TOKEN.findall(text))),
            "identifier.count": float(len(identifiers)),
            "identifier.camel_ratio": camel / total,
            "identifier.snake_ratio": snake / total,
            "identifier.generic_ratio": generic / total,
        }
