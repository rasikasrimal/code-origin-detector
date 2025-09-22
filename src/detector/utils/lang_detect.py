from __future__ import annotations

from enum import Enum
from pathlib import Path


class Language(str, Enum):
    PYTHON = "python"
    JAVASCRIPT = "javascript"
    UNKNOWN = "unknown"


PY_EXTENSIONS = {".py", ".pyw"}
JS_EXTENSIONS = {".js", ".cjs", ".mjs", ".jsx"}


def detect_language(path: Path, text: str | None = None) -> Language:
    """Guess the language based on filename and simple textual cues."""
    suffix = path.suffix.lower()
    if suffix in PY_EXTENSIONS:
        return Language.PYTHON
    if suffix in JS_EXTENSIONS:
        return Language.JAVASCRIPT
    if text is None:
        return Language.UNKNOWN

    stripped = text.lstrip()
    if stripped.startswith("#!/"):
        if "python" in stripped:
            return Language.PYTHON
        if "node" in stripped or "javascript" in stripped:
            return Language.JAVASCRIPT
    if "def " in text and "import" in text:
        return Language.PYTHON
    if "function" in text and "const" in text:
        return Language.JAVASCRIPT
    return Language.UNKNOWN
