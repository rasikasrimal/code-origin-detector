# Data Privacy Policy

## Purpose

This policy outlines how Code Origin Detector handles data processed through the toolkit and related services.

## Data Collection

- The CLI processes source code locally; no data is transmitted by default.
- Optional telemetry (disabled by default) may capture anonymised feature distributions.
- When using the future REST API, project metadata (file paths, hashes) may be stored for auditing.

## Data Usage

- Data is used solely to provide verdicts, explanations, and aggregated statistics.
- No data is sold or shared with third parties without explicit consent.

## Data Retention

- Local runs retain outputs on the operator’s machine.
- Hosted services retain scan metadata for 180 days unless otherwise specified in customer agreements.

## User Controls

- Users can delete generated reports and datasets at any time.
- API clients can request deletion via support within 30 days.

## Security Measures

- Encrypted transport (HTTPS) for all hosted endpoints.
- Access controls enforced through scoped API tokens.
- Regular dependency security scans and vulnerability response per `SECURITY.md`.

## Contact

For privacy questions, email `privacy@code-origin-detector.org`.
