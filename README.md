# Code Origin Detector

A research-grade toolkit for estimating whether a source file was written by a human developer or produced by an AI assistant. The system combines language-aware heuristics, handcrafted features, and statistical models to output probabilistic verdicts with supporting rationale.

> Status: early prototype. Ships with a heuristic baseline, stylometry/program-analysis feature scaffolding, a Typer CLI, and a redesigned React dashboard for demonstrations.

## Key capabilities

- AST and stylometry feature extraction for Python and JavaScript with a pluggable pipeline for additional languages.
- Interpretable heuristic signals (naming entropy, whitespace density, comment coverage, idiom usage) that double as model features and explanations.
- Statistical model hooks (logistic regression, random forest) with calibrated probabilities and optional stacking.
- Command-line interface for single files, directories, and benchmark manifests with JSON or pretty outputs.
- Dataset utilities for reproducible collection, hashing-based deduplication, and manifest-driven experiments.
- Responsive web dashboard (frontend/) that mirrors the CLI flow for copy, UX, and explainability iteration.

## Tech stack

- **Backend:** Python 3.10+, Typer, Rich, NumPy, Pandas, scikit-learn, SHAP, tree-sitter, Radon, wordfreq, orjson.
- **Frontend:** React 19, TypeScript 5, Vite 7, Tailwind CSS 3, Jest plus Testing Library, ESLint (flat) plus Prettier.
- **Tooling:** Ruff, mypy, pytest (Python); npm scripts for lint, test, build, and format on the frontend.

## Repository layout

```
code-origin-detector/
|-- README.md
|-- pyproject.toml             # Python package metadata
|-- requirements.txt           # CLI/runtime dependencies
|-- package.json               # Root JS helpers (linting hooks)
|-- data/                      # Dataset manifests and artifacts (gitignored where needed)
|-- docs/                      # Design notes, prompt catalog, reports
|-- notebooks/                 # Exploratory analysis and modelling notebooks
|-- scripts/                   # Data collection and preprocessing jobs
|-- src/
|   |-- detector/              # CLI entrypoint, inference logic, heuristics, featurizers, models, utils
|   |-- data/                  # Sample assets used by the library/tests
|-- tests/                     # Python unit and integration suites
|-- frontend/                  # React app (Vite project)
|   |-- src/components/        # AnalyzerPanel, ResultPanel, Header, shared UI pieces
|   |-- src/data/              # Curated example snippets for the demo
|   |-- src/types.ts           # Frontend domain types
|   |-- tailwind.config.js     # Design token extensions
|-- .github/workflows/         # CI definitions
```

## Getting started

### Backend CLI

```bash
python -m pip install -r requirements.txt
python -m pip install -e .
code-origin-detector predict ./path/to/project --include "*.py,*.js" --output-format pretty
```

The default `heuristic_v1` model relies on interpretable rules. To use trained scikit-learn baselines, save a calibrated estimator with helpers in `src/detector/models/train.py` and point the CLI at the exported Joblib artifact (for example `--model artifacts/rf_v1.joblib`).

### Frontend dashboard

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL (default `http://localhost:5173`) to explore the detector flow, revised copy, and accessibility patterns. The UI runs client-side heuristics only; wire it to APIs as they become available.

## Testing and quality

- **Python:** `pytest`, `pytest --cov`, `ruff check`, and `mypy` (install via `pip install -e .[ci]`).
- **Frontend:** `npm run lint`, `npm test`, `npm run build`, and `npm run format`.

## Data roadmap

1. **Human corpus:** Sample pre-2020 commits from vetted OSS repositories (license and language filters). Remove generated or minified artifacts, cap per-repo contributions, and tag as human-authored.
2. **AI corpus:** Generate program variants via scripted prompts in `docs/prompts.md`, recording task descriptions, temperatures, and rewrite strategies for reproducibility.
3. **Splits and dedup:** Apply SHA-256 hashing plus 20-token shingles to remove duplicates. Split train/validation/test by repository and maintain a temporal hold-out (post-2024 code).

Metadata schemas live in `data/metadata/schema.json` for consistent ingestion across tooling.

## Frontend highlights

- Responsive layout with AnalyzerPanel inputs (paste, upload, curated examples) and ResultPanel verdicts.
- Focus management, ARIA annotations, drag-and-drop with keyboard parity, and motion-reduced fallbacks.
- Result cards surface probabilistic verdicts, confidence bands, heuristics, limitations, and export actions.

## Responsible use

The detector produces advisory signals, not definitive judgments. False positives can occur for human-written code (especially boilerplate or generated scaffolding), and AI-generated code can resemble expert human work. Treat probabilities as guidance to focus manual review, not as an automated gate or policy decision.
