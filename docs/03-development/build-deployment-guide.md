# Build & Deployment Guide

## Backend (CLI)

```bash
python -m venv .venv
.venv\Scripts\activate
python -m pip install -r requirements.txt
python -m pip install -e .
pytest
```

- Bundle distributable wheel with `python -m build`.
- Publish to TestPyPI using `twine upload --repository testpypi dist/*`.

## Frontend (Dashboard)

```bash
cd frontend
npm install
npm run lint
npm run test
npm run build
```

- Production assets located in `frontend/dist/`.
- Deploy to static hosting (Netlify, Vercel) or attach to backend server.

## Continuous Integration

- GitHub Actions pipeline (`.github/workflows/ci-cd.yml`) runs lint, tests, and build checks on PRs.
- Cache dependencies for faster builds.

## Continuous Deployment (Roadmap)

- Automate PyPI and npm (if published) releases on tagged commits.
- Sync built frontend assets with CDN.
- Publish Docker image that bundles CLI and API when API is introduced.

## Environment Promotion

- **Dev:** Local machines; feature testing.
- **Staging:** Mirror production settings; run nightly benchmarks.
- **Production:** Tag-protected; requires release manager approval.
