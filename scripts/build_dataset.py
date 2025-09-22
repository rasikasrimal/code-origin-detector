"""Build end-to-end dataset manifests and feature caches."""

from __future__ import annotations

import argparse
from pathlib import Path

from detector.utils.hashing import sha256_file


def build_dataset(raw_dir: Path, output_path: Path) -> None:
    """Walk *raw_dir* and emit a manifest with hashes for deduplication."""
    entries: list[str] = []
    for file_path in raw_dir.rglob("*"):
        if not file_path.is_file():
            continue
        digest = sha256_file(file_path)
        entries.append(f"{file_path},{digest},unknown")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text("path,hash,label\n" + "\n".join(entries), encoding="utf-8")


def main() -> None:  # pragma: no cover - CLI utility
    parser = argparse.ArgumentParser(description="Build dataset manifest from raw samples.")
    parser.add_argument("raw_dir", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    build_dataset(args.raw_dir, args.output)


if __name__ == "__main__":
    main()
