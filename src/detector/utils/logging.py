from __future__ import annotations

import logging
from typing import Optional


def configure_logging(level: int = logging.INFO) -> None:
    """Configure the library logger if it has not been configured yet."""
    logger = logging.getLogger("detector")
    if logger.handlers:
        return
    handler = logging.StreamHandler()
    formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(level)


def get_logger(name: Optional[str] = None) -> logging.Logger:
    configure_logging()
    return logging.getLogger("detector" if name is None else f"detector.{name}")
