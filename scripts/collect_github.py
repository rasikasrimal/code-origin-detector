"""Utilities for sampling human-authored repositories via the GitHub API."""

from __future__ import annotations

import csv
import dataclasses
import os
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

import requests


@dataclass
class RepoSpec:
    owner: str
    name: str
    default_branch: str


@dataclass
class FileRecord:
    path: str
    sha: str
    language: str
    license: str
    label: str = "human"


class GitHubClient:
    def __init__(self, token: str | None = None) -> None:
        self.session = requests.Session()
        if token is None:
            token = os.environ.get("GITHUB_TOKEN")
        if token:
            self.session.headers["Authorization"] = f"token {token}"
        self.session.headers["Accept"] = "application/vnd.github.v3+json"

    def list_files(self, repo: RepoSpec) -> Iterable[FileRecord]:  # pragma: no cover - network
        url = f"https://api.github.com/repos/{repo.owner}/{repo.name}/git/trees/{repo.default_branch}?recursive=1"
        response = self.session.get(url, timeout=30)
        response.raise_for_status()
        data = response.json()
        for entry in data.get("tree", []):
            if entry.get("type") != "blob":
                continue
            yield FileRecord(path=entry["path"], sha=entry["sha"], language="")


def save_manifest(records: Iterable[FileRecord], path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=["path", "sha", "language", "label"])
        writer.writeheader()
        for record in records:
            writer.writerow(dataclasses.asdict(record))


if __name__ == "__main__":  # pragma: no cover - CLI stub
    raise SystemExit("Invoke the helper functions from notebooks or bespoke scripts.")
