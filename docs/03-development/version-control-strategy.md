# Version Control Strategy

## Branch Model

- `main`: always releasable, protected with required checks.
- `develop` (optional): staging branch for coordinated releases.
- Feature branches using the pattern `type/short-description` (for example `feat/ensemble-model`).

## Workflow

1. Branch from `main`.
2. Commit changes with descriptive messages (present tense, 72-char subject).
3. Rebase interactively before opening a pull request to maintain a clean history.
4. Submit PR referencing related issues; ensure CI is green.

## Tags and Releases

- Use semantic versioning (`vMAJOR.MINOR.PATCH`).
- Create release branches for stabilisation when shipping major/minor versions.
- Tag releases after approval; update `CHANGELOG.md` and `docs/05-operations/release-notes.md`.

## Code Review

- Minimum two approvals for significant changes.
- Mandatory review from domain owners as defined in `CODEOWNERS`.
- Enforce linting and test checks via GitHub Actions.

## Tooling

- GitHub Actions for CI/CD.
- Pre-commit hooks (planned) for linting and formatting.
- GitHub Projects to track feature progress and merge readiness.
