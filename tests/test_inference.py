from __future__ import annotations

from pathlib import Path

from detector.inference import Predictor

SAMPLE_PY = """
# Simple example

def add(a, b):
    return a + b
"""


def test_predictor_runs_on_python_file(tmp_path: Path):
    file_path = tmp_path / "example.py"
    file_path.write_text(SAMPLE_PY, encoding="utf-8")
    predictor = Predictor(model_name="heuristic_v1")
    result = predictor.predict_file(file_path)
    assert result.path == file_path
    assert result.label in {"ai", "human"}
    assert 0.0 <= result.probability_ai <= 1.0
