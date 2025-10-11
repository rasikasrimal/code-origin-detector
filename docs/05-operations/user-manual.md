# User Manual

## Installation

### CLI

```bash
python -m pip install code-origin-detector
```

Or install from source following `README.md`.

### Dashboard

- Clone repository.
- Run `npm install` in `frontend/`.
- Start dev server with `npm run dev`.

## Quick Start

```bash
code-origin-detector predict ./path/to/project --include "*.py,*.js"
```

- Review console output for verdicts and explanations.
- Optional: `--report report.json` to persist results.

## Interpreting Results

- **Confidence Meter:** Indicates probability that code is AI-generated.
- **Heuristic Breakdown:** Shows top contributing signals (positive/negative).
- **Limitations Callout:** Highlights potential false positives/negatives.

## Frontend Workflow

1. Launch dashboard.
2. Upload file or choose sample.
3. Adjust settings (model, heuristics).
4. Review results, download report.

## Troubleshooting

- Ensure dependencies match versions in `requirements.txt` and `package.json`.
- If CLI cannot find files, verify glob patterns.
- For frontend CORS errors, set `VITE_API_BASE_URL` correctly when API is available.
