# Admin Guide

## Roles and Responsibilities

- **Site Reliability Engineer:** Oversees deployment environment, monitors health.
- **Security Lead:** Handles vulnerability disclosures and patch releases.
- **Data Steward:** Manages datasets, access control, and retention policies.

## Provisioning

- Backend services (future REST API) should run on hardened hosts with least-privilege IAM roles.
- Store secrets (API keys, signing tokens) in a secure vault.
- Enable logging and monitoring via centralised stack (e.g., ELK, Datadog).

## Operational Tasks

- Review CI/CD pipelines weekly for failing jobs.
- Rotate API keys and service credentials every 90 days.
- Run benchmark suite before promoting releases to production.
- Monitor sponsor funding channels for resource planning.

## Incident Response

1. Triage incidents reported via `security@code-origin-detector.org`.
2. Assess severity and impact; involve stakeholders as needed.
3. Document findings in incident log and follow up with remediation steps.
4. Communicate status updates to affected users.

## Backup and Recovery

- Schedule nightly backups for persistent data stores (when introduced).
- Test restore procedures quarterly using staging environments.
- Maintain retention schedule aligned with `docs/01-requirements/risk-management-plan.md`.
