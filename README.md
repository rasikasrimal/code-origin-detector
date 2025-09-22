# code-origin-detector

A research-grade toolkit for estimating whether a given source file was written by a human developer or produced by an AI assistant. The system combines language-specific heuristics, handcrafted features, and statistical models to produce per-file classifications with supporting explanations.

> Status: early prototype. The repository ships with a heuristic baseline, stylometry/program-analysis feature scaffolding, a command-line interface, and a lightweight React dashboard for demonstrations.

## Key capabilities

- Python + JavaScript feature extraction via AST and stylometry modules with a pluggable pipeline for additional languages.
- Rule-based heuristics that surface interpretable signals (generic naming, low idiom usage, sparse comments vs. complexity, explanatory headers, etc.).
- Statistical model hooks (logistic regression and random forest) with calibrated probabilities and optional stacking/ensembling.
- CLI for file/directory scanning, explanations, and benchmark evaluation.
- Dataset tooling for reproducible collection, hashing-based deduplication, and manifest-driven experiments.
- Web dashboard (rontend/) built with React + Vite for interactive demos and explanation browsing.

## Getting started

### Backend CLI

`ash
python -m pip install -r requirements.txt
python -m pip install -e .
code-origin-detector predict ./path/to/project --include "*.py,*.js" --output-format pretty
`

The default CLI model (heuristic_v1) relies on interpretable rules. To use trained sklearn baselines, save a calibrated estimator with the helpers in src/detector/models/train.py and point the CLI to the joblib artifact (for example --model artifacts/rf_v1.joblib).

### Frontend dashboard (React + Vite)

`ash
cd frontend
npm install
npm run dev
`

Open the URL printed by Vite (default http://localhost:5173). The UI simulates the detector flow so you can iterate on copy and presentation while the backend evolves.

## Repository layout

`
code-origin-detector/
+-- src/detector/            # Python library (CLI, pipeline, heuristics, models, utils)
+-- frontend/                # React 18 + Vite dashboard with Tailwind, Jest
+-- data/                    # Data scaffolding (raw/processed ignored)
+-- notebooks/               # EDA + modeling notebooks
+-- scripts/                 # Data collection and preprocessing scripts
+-- docs/                    # Examples, report markdown, prompt catalog
+-- tests/                   # Unit and integration tests for the Python package
+-- .github/workflows/       # CI definition for advisory scans
`

## Data roadmap

Detailed collection scripts live in scripts/. High-level plan:

1. **Human corpus**: sample pre-2020 commits from established OSS repos via the GitHub API (filter by license, stars, language). Apply heuristics to drop generated/minified artifacts, cap per-repo contributions, and label as human.
2. **AI corpus**: generate program variants via scripted prompts in docs/prompts.md, capturing task descriptions, temperatures, and rewrite strategies. Record completions, metadata, and label as i.
3. **Splits & dedup**: use SHA-256 hashing and 20-token shingles to remove duplicates. Split train/val/test by repository and optionally provide a temporal hold-out with post-2024 code.

See data/metadata/schema.json for the manifest schema used across tooling.

## Modelling overview

- **Features**: stylistic signals (line statistics, indentation), AST metrics (depth, node histograms, comprehension usage), naming entropy, and language idiom indicators.
- **Heuristics**: rule outputs include ID, weight, score, and evidence strings. They feed the heuristic_v1 model and serve as explanations for tree/linear models.
- **Training**: src/detector/models/train.py provides helpers for logistic regression and random forest baselines with isotonic calibration and group-aware cross-validation.
- **Explainability**: SHAP integration hooks in models/explain.py combine feature attributions with triggered heuristics.

## Frontend highlights

The new dashboard is built with:

- React 18 + TypeScript
- Vite 5 tooling
- Tailwind CSS 3 for styling
- Jest + Testing Library for component tests
- ESLint (flat config) + Prettier for linting/formatting

Run 
pm run lint, 
pm test, or 
pm run format inside rontend/ as needed.

## Responsible use

The detector produces advisory signals, not definitive judgments. False positives can occur for human-written code (especially highly formatted or boilerplate-heavy files), and AI-generated code may look indistinguishable from expert human work. Use results as metadata to guide manual review, not as an automated gate.
