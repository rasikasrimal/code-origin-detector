from __future__ import annotations

import fnmatch
import json
from pathlib import Path
from typing import Iterable, Iterator, Sequence


def read_text(path: Path) -> str:
    """Return file contents as UTF-8 text, ignoring undecodable bytes."""
    return path.read_text(encoding="utf-8", errors="ignore")


def write_json(path: Path, payload: object) -> None:
    """Serialize *payload* to JSON with UTF-8 encoding."""
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")


def iter_source_files(
    root: Path,
    include: Sequence[str],
    exclude: Sequence[str],
) -> Iterator[Path]:
    """Yield files under *root* matching any include glob and no exclude glob."""
    if root.is_file():
        if _matches(root, include) and not _matches(root, exclude):
            yield root
        return

    for path in root.rglob("*"):
        if not path.is_file():
            continue
        if include and not _matches(path, include):
            continue
        if exclude and _matches(path, exclude):
            continue
        yield path


def _matches(path: Path, patterns: Sequence[str]) -> bool:
    if not patterns:
        return True
    return any(fnmatch.fnmatch(path.name, pattern) or fnmatch.fnmatch(str(path), pattern) for pattern in patterns)
