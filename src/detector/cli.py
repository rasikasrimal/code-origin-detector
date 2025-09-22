from __future__ import annotations

from pathlib import Path
from typing import Optional

import typer

from .inference import BenchmarkRequest, Predictor

app = typer.Typer(help="Detect whether code files are likely AI- or human-authored.")


@app.command()
def predict(
    path: Path = typer.Argument(..., help="File or directory to analyse."),
    include: str = typer.Option("*.py,*.js", help="Comma-separated glob patterns to include."),
    exclude: str = typer.Option("", help="Comma-separated glob patterns to exclude."),
    model: str = typer.Option("heuristic_v1", help="Model identifier to use for scoring."),
    threshold: float = typer.Option(0.7, min=0.0, max=1.0, help="Alert threshold for reporting."),
    report: Optional[Path] = typer.Option(None, help="Optional path to write a JSON report."),
    output_format: str = typer.Option("pretty", help="Output format: pretty or json."),
) -> None:
    """Run the detector over a file or directory."""
    predictor = Predictor(model_name=model)
    results = predictor.predict_path(path=path, include=include, exclude=exclude, threshold=threshold)
    predictor.render(results=results, output_format=output_format, report_path=report)


@app.command()
def explain(
    path: Path = typer.Argument(..., help="File to analyse for detailed explanations."),
    model: str = typer.Option("heuristic_v1", help="Model identifier to use for scoring."),
    top_k: int = typer.Option(5, help="Number of explanation items to display."),
    output_format: str = typer.Option("pretty", help="Output format: pretty or json."),
) -> None:
    """Generate an explanation-focused report for a single file."""
    predictor = Predictor(model_name=model)
    result = predictor.predict_file(path=path)
    predictor.render(results=[result], output_format=output_format, max_reasons=top_k)


@app.command()
def eval(
    manifest: Path = typer.Argument(..., help="CSV manifest with columns: path,label."),
    model: str = typer.Option("heuristic_v1", help="Model identifier to use for scoring."),
    groups: Optional[Path] = typer.Option(
        None,
        help="Optional CSV mapping path to repository/group for grouped metrics.",
    ),
) -> None:
    """Evaluate the detector on a labelled dataset manifest."""
    predictor = Predictor(model_name=model)
    benchmark = BenchmarkRequest(manifest_path=manifest, group_path=groups)
    predictor.evaluate(benchmark)


if __name__ == "__main__":  # pragma: no cover
    app()
