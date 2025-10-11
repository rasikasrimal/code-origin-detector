# API Specifications

The REST API is planned for a future release and will mirror the CLI capabilities. This document outlines the intended contract.

## Base URL

`https://api.code-origin-detector.org/v1`

## Authentication

- Token-based (Bearer tokens).
- API keys scoped per project.

## Endpoints

### POST `/scans`

Submit a new detection job.

**Request Body**

```json
{
  "project": "string",
  "paths": ["string"],
  "include": ["*.py", "*.js"],
  "exclude": ["tests/**"],
  "threshold": 0.7,
  "model": "heuristic_v1"
}
```

**Response**

```json
{
  "scan_id": "uuid",
  "status": "queued"
}
```

### GET `/scans/{scan_id}`

Retrieve job status and aggregated verdicts.

**Response**

```json
{
  "scan_id": "uuid",
  "status": "completed",
  "started_at": "2025-09-20T12:34:56Z",
  "finished_at": "2025-09-20T12:35:42Z",
  "model": "heuristic_v1",
  "summary": {
    "files": 123,
    "ai_flagged": 17
  }
}
```

### GET `/scans/{scan_id}/files/{file_id}`

Return file-level details including heuristic breakdowns.

### POST `/explain`

Ad-hoc explanation for a single file payload.

## Error Handling

- Use standard HTTP status codes (400, 401, 404, 500).
- Error payload:

```json
{
  "error": {
    "code": "invalid-include-pattern",
    "message": "Include glob \"**/*.py\" is invalid."
  }
}
```

## Rate Limiting

- Default: 60 requests per minute per API key.
- Burst handling through token bucket strategy.

## Versioning

- Prefix routes with `/v{number}`.
- Deprecate endpoints with 6-month notice and provide migration guides in `docs/05-operations/release-notes.md`.
