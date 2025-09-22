from __future__ import annotations

from detector.featurizers.python_ast import PythonAstFeaturizer
from detector.featurizers.stylometry import StylometryFeaturizer
from detector.utils.lang_detect import Language


SAMPLE_CODE = """
def hello(name):
    return f"Hello {name}"
"""


def test_python_ast_featurizer_emits_core_metrics():
    featurizer = PythonAstFeaturizer()
    features = featurizer.featurize(SAMPLE_CODE, language=Language.PYTHON)
    assert features["parse_success"] == 1.0
    assert "node.FunctionDef" in features
    assert features["function.count"] == 1.0


def test_stylometry_line_counts():
    featurizer = StylometryFeaturizer()
    features = featurizer.featurize(SAMPLE_CODE, language=Language.PYTHON)
    assert features["line_count"] >= 2
    assert 0 <= features["comment_line_ratio"] <= 1
