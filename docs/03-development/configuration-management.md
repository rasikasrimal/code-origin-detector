# Configuration Management

## Source Control

- Repository hosted on GitHub under `code-origin-detector/code-origin-detector`.
- Protected branches: `main`, release branches.
- Required checks: backend tests, frontend tests, linting.

## Configuration Artefacts

- **CLI Flags:** Defined in `src/detector/cli.py`.
  - `--include` / `--exclude`
  - `--model`
  - `--threshold`
  - `--report`
- **Environment Variables:**
  - `COD_THRESHOLD` (override default threshold).
  - `COD_MODEL_PATH` (custom model location).
  - `COD_TELEMETRY_ENABLED` (enable additional logging).
- **Frontend Env:** `frontend/.env.example` (to be added) for API base URLs.

## Change Control Process

1. Open an issue describing the configuration change.
2. Update relevant documentation in this file and `README.md`.
3. Modify configuration defaults in code with clear comments.
4. Add tests verifying the new configuration behaviour.
5. Gain approval from the maintainer owning the affected domain.

## Versioning

- Track configuration changes in `CHANGELOG.md`.
- Document breaking configuration updates in `docs/05-operations/release-notes.md`.

## Backup & Recovery

- Store production configuration in a secure secrets manager (AWS Secrets Manager, Vault, etc.).
- Maintain encrypted backups with rotation every 30 days.
- Document restoration procedures in `docs/05-operations/admin-guide.md`.
