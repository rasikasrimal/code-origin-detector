# Database Design

The current prototype operates in a stateless mode without a persistent database. This document captures the envisioned schema for future server deployments.

## Storage Goals

- Retain scan results for auditing.
- Track model versions and calibration metadata.
- Store anonymised heuristics for research analytics.

## Proposed Entities

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `projects` | Represents analysed repositories or file collections. | `id`, `name`, `description`, `created_at` |
| `scans` | Individual detection runs. | `id`, `project_id`, `initiated_by`, `model_version`, `threshold`, `created_at` |
| `files` | File-level metadata. | `id`, `scan_id`, `path`, `language`, `sha256` |
| `verdicts` | Prediction output per file. | `file_id`, `human_score`, `ai_score`, `label`, `explanation` |
| `heuristic_signals` | Detailed feature contributions. | `verdict_id`, `signal_name`, `weight`, `value` |

## Relationships

- A project has many scans.
- A scan has many files.
- Each file has one verdict.
- Each verdict can reference many heuristic signals.

## Indexing Strategy

- Index `files.sha256` for deduplication.
- Index `scans.model_version` to support regression analysis.
- Composite index on `heuristic_signals(signal_name, verdict_id)` for efficient lookups.

## Data Retention

- Default retention: 180 days, extendable for research cohorts.
- Personal data is not stored; only source file metadata and derived metrics.

## Future Considerations

- Evaluate columnar storage for large-scale heuristics analytics.
- Consider encryption at rest when handling proprietary code.
- Support export/import of scan metadata via JSON manifests.
