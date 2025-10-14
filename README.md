# Code Origin Detector

A research-grade toolkit for estimating whether a source file was written by a human developer or produced by an AI assistant. The system combines language-aware heuristics, handcrafted features, and statistical models to output probabilistic verdicts with supporting rationale.

> Status: early prototype. Ships with a heuristic baseline, stylometry/program-analysis feature scaffolding, a Typer CLI, and a redesigned React dashboard for demonstrations.

## Table of Contents

- [Screenshots](#screenshots)
- [Key Capabilities](#key-capabilities)
- [Getting Started](#getting-started)
  - [Backend CLI](#backend-cli)
  - [Frontend Dashboard](#frontend-dashboard)
  - [Frontend Experience Highlights](#frontend-experience-highlights)
- [Testing and Quality](#testing-and-quality)
- [Data Roadmap](#data-roadmap)
- [Responsible Use](#responsible-use)
- [Citations and References](#citations-and-references)

## Screenshots

The Code Origin Detector provides an intuitive web interface for analyzing code authorship with real-time feedback and detailed explanations.

<div style="display: flex; justify-content: center; gap: 20px; align-items: center;">
  <img alt="Code Origin Detector Dashboard - Main Analysis Interface" src="https://github.com/user-attachments/assets/be3ecf77-06eb-473b-9838-a4ef2a838532" />
  
  <img width="500" alt="Code Analysis Settings and Configuration Panel" src="https://github.com/user-attachments/assets/4f72cfb6-7395-4848-bb17-4fa901ca09eb" />
  <img width="500" height="755" alt="Analysis Results with Heuristic Explanations" src="https://github.com/user-attachments/assets/37586a6b-c4ba-4dbb-9b17-31696ecdd860" />
</div>





## Key Capabilities

- AST and stylometry feature extraction for Python and JavaScript with a pluggable pipeline for additional languages.
- Interpretable heuristic signals (naming entropy, whitespace density, comment coverage, idiom usage) that double as model features and explanations.
- Statistical model hooks (logistic regression, random forest) with calibrated probabilities and optional stacking.
- Command-line interface for single files, directories, and benchmark manifests with JSON or pretty outputs.
- Dataset utilities for reproducible collection, hashing-based deduplication, and manifest-driven experiments.

```
README.md
pyproject.toml               # Python package metadata
requirements.txt             # Runtime dependencies for the CLI
.github/workflows/           # Continuous integration workflows
docs/                        # Design notes, prompt catalog, and reports
examples/                    # Sample walkthrough inputs and outputs
frontend/                    # React + Vite dashboard implementation
  public/                    # Static assets served by Vite
  src/                       # UI components, hooks, and utilities
  package.json               # Frontend tooling and scripts
notebooks/                   # Exploration and modelling notebooks
scripts/                     # Data collection and preprocessing jobs
src/                         # Python package (CLI, heuristics, features, models)
  detector/                  # CLI entrypoint and core detection logic
tests/                       # Python unit and integration suites
```

## Getting Started

### Backend CLI

```bash
python -m pip install -r requirements.txt
python -m pip install -e .
code-origin-detector predict ./path/to/project --include "*.py,*.js" --output-format pretty
```

The default `heuristic_v1` model relies on interpretable rules. To use trained scikit-learn baselines, save a calibrated estimator with helpers in `src/detector/models/train.py` and point the CLI at the exported Joblib artifact (for example `--model artifacts/rf_v1.joblib`).

### Frontend Dashboard

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL (default `http://localhost:5173`) to explore the detector flow, revised copy, and accessibility patterns. The UI runs client-side heuristics only; wire it to APIs as they become available.

### Frontend Experience Highlights

- AnalyzerPanel includes filename editing, drag-and-drop uploads with validation, curated example tiles, model profile selection, and heuristic overlay toggles.
- ResultPanel surfaces verdict badges, a confidence meter, heuristics (expandable), limitations callouts, copy/download actions, and a selectable history timeline.
- Tailwind design tokens in `tailwind.config.js` extend brand/neutral palettes, card shadows, container widths, and motion-safe focus styles for consistency.
- Analysis settings (model, heuristics, explanation density) and runtime metadata are persisted per prediction for clearer provenance.

## Testing and Quality

- **Python:** `pytest`, `pytest --cov`, `ruff check`, and `mypy` (install via `pip install -e .[ci]`).
- **Frontend:** `npm run lint`, `npm test`, `npm run build`, and `npm run format`.

## Data Roadmap

1. **Human corpus:** Sample pre-2020 commits from vetted OSS repositories (license and language filters). Remove generated or minified artifacts, cap per-repo contributions, and tag as human-authored.
2. **AI corpus:** Generate program variants via scripted prompts in `docs/prompts.md`, recording task descriptions, temperatures, and rewrite strategies for reproducibility.
3. **Splits and dedup:** Apply SHA-256 hashing plus 20-token shingles to remove duplicates. Split train/validation/test by repository and maintain a temporal hold-out (post-2024 code).

Metadata schemas live in `data/metadata/schema.json` for consistent ingestion across tooling.

## Responsible Use

The detector produces advisory signals, not definitive judgments. False positives can occur for human-written code (especially boilerplate or generated scaffolding), and AI-generated code can resemble expert human work. Treat probabilities as guidance to focus manual review, not as an automated gate or policy decision.

## Citations and References

### Core Technologies

#### Backend
- **Python** (≥3.10) - [https://www.python.org/](https://www.python.org/)
- **Typer** (≥0.9) - Command-line interface framework - [https://typer.tiangolo.com/](https://typer.tiangolo.com/)
- **Rich** (≥13) - Terminal output formatting - [https://rich.readthedocs.io/](https://rich.readthedocs.io/)
- **scikit-learn** (≥1.3) - Machine learning library - [https://scikit-learn.org/](https://scikit-learn.org/)
  - Pedregosa et al., "Scikit-learn: Machine Learning in Python", *JMLR* 12, pp. 2825-2830, 2011
- **NumPy** (≥1.23) - Numerical computing - [https://numpy.org/](https://numpy.org/)
- **pandas** (≥2.0) - Data analysis and manipulation - [https://pandas.pydata.org/](https://pandas.pydata.org/)
- **SHAP** (≥0.44) - Model interpretability - [https://shap.readthedocs.io/](https://shap.readthedocs.io/)
  - Lundberg & Lee, "A Unified Approach to Interpreting Model Predictions", *NeurIPS* 2017
- **tree-sitter** (≥0.20) - Parser generator for syntax trees - [https://tree-sitter.github.io/](https://tree-sitter.github.io/)
- **Radon** (≥6.0) - Code complexity metrics - [https://radon.readthedocs.io/](https://radon.readthedocs.io/)

#### Frontend
- **React** (^19.1.1) - UI framework - [https://react.dev/](https://react.dev/)
- **Vite** (^7.1.7) - Build tool and development server - [https://vite.dev/](https://vite.dev/)
- **TypeScript** (~5.8.3) - Type-safe JavaScript - [https://www.typescriptlang.org/](https://www.typescriptlang.org/)
- **Tailwind CSS** (^3.4.17) - Utility-first CSS framework - [https://tailwindcss.com/](https://tailwindcss.com/)

### Related Research

For research on code authorship attribution and AI-generated code detection, refer to:

- Burrows et al., "Stylometry and Code Authorship Attribution", *Digital Investigations* 2016
- Caliskan et al., "De-anonymizing Programmers via Code Stylometry", *USENIX Security* 2015
- Solaiman et al., "Release Strategies and the Social Impacts of Language Models", *arXiv* 2019

### Citation

If you use Code Origin Detector in your research, please cite:

```bibtex
@software{code_origin_detector,
  title = {Code Origin Detector},
  author = {Code Origin Detector Team},
  year = {2025},
  version = {0.1.0},
  url = {https://github.com/rasikasrimal/code-origin-detector}
}
```

For the full citation metadata, see [CITATION.cff](CITATION.cff).
