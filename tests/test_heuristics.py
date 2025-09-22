from __future__ import annotations

from detector.heuristics.python_rules import rule_generic_identifiers as py_generic
from detector.heuristics.javascript_rules import rule_generic_identifiers as js_generic


def test_python_generic_identifier_rule_triggers():
    features = {"python_ast.identifier.generic_ratio": 0.2}
    signal = py_generic(features, "")
    assert signal.triggered
    assert signal.score > 0


def test_js_generic_identifier_rule_triggers():
    features = {
        "js_syntax.identifier.generic_ratio": 0.3,
        "js_syntax.identifier.count": 40,
    }
    signal = js_generic(features, "")
    assert signal.triggered
    assert signal.score > 0
