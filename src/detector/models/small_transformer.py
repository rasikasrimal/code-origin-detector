"""Experimental transformer-based classifier placeholder."""

from __future__ import annotations


class SmallTransformer:  # pragma: no cover - placeholder until implemented
    def __init__(self, model_name: str = "distilroberta-base") -> None:
        self.model_name = model_name
        raise NotImplementedError(
            "Transformer baseline not yet implemented. Provide a fine-tuned model and update this class."
        )
