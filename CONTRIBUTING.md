# Contributing to Code Origin Detector

We welcome community contributions. This guide explains how to propose ideas, report bugs, and submit code safely.

## Before You Start

- Review the project architecture in `README.md` and `docs/00-overview/project-charter.md`.
- Ensure you agree to the [Code of Conduct](CODE_OF_CONDUCT.md).
- Check existing issues and pull requests before opening a new one.

## Development Environment

```bash
python -m venv .venv
.venv\Scripts\activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python -m pip install -e .
cd frontend
npm install
```

Run backend tests with `pytest` and `ruff check`, and frontend tests with `npm test`. Lint before submitting `npm run lint`.

## Branching Strategy

1. Fork the repository and create a feature branch from `main`.
2. Use descriptive branch names (for example `feature/heuristic-rule` or `fix/frontend-upload`).
3. Keep your branch up to date by rebasing with `main` before opening a pull request.

## Making Changes

- Include unit tests or integration tests whenever possible.
- Document new features in the appropriate doc section (`docs/` and `CHANGELOG.md`).
- Update TypeScript types and Python typings when introducing new data structures.

## Commit and PR Guidelines

- Keep commits scoped and write descriptive messages.
- Reference related issues using GitHub keywords (for example `Fixes #123`).
- Fill out the pull request template, highlighting testing evidence and screenshots if the UI changes.

## Review Process

- Maintainers review PRs for correctness, tests, documentation, and maintainability.
- Address review comments promptly or explain why changes are not required.
- After approval, a maintainer will merge the pull request using squash or rebase merges for a clean history.

## Reporting Issues

- Use the issue templates in `.github/ISSUE_TEMPLATE`.
- Include reproduction steps, expected vs actual behaviour, and environment details.
- For security-sensitive disclosures, follow `SECURITY.md`.

Thank you for helping build a trustworthy code-authorship detector!
