from __future__ import annotations

import hashlib
from pathlib import Path


BUFFER_SIZE = 131_072


def sha256_text(text: str) -> str:
    """Return the SHA-256 digest for *text*."""
    return hashlib.sha256(text.encode("utf-8", errors="ignore")).hexdigest()


def sha256_file(path: Path) -> str:
    """Return the SHA-256 digest for the bytes stored at *path*."""
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        while chunk := handle.read(BUFFER_SIZE):
            digest.update(chunk)
    return digest.hexdigest()
