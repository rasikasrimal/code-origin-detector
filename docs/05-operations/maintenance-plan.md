# Maintenance Plan

## Scheduled Tasks

- **Monthly:** Review open issues, prune stale branches, calibrate heuristic thresholds.
- **Quarterly:** Refresh AI-generated datasets, retrain models, update benchmarks.
- **Biannual:** Audit documentation, ensure compliance with latest policies.

## Preventive Maintenance

- Keep dependencies current using Dependabot and manual review.
- Run `pytest --cov` and `npm run test` on a schedule to detect latent issues.
- Validate that telemetry logs remain compatible with analytics pipelines.

## Corrective Maintenance

- Log defects in GitHub issues with root-cause analysis.
- Prioritise fixes based on severity and impact outlined in `risk-management-plan.md`.
- Update tests to prevent regressions before closing the issue.

## Metrics

- Mean Time To Detect (MTTD) for critical bugs.
- Mean Time To Repair (MTTR) from issue creation to fix deployment.
- Percentage of automated test coverage across backend and frontend.

## Documentation Updates

- Reflect maintenance actions in `CHANGELOG.md` when user-facing.
- Capture standard operating procedures in `docs/05-operations/admin-guide.md`.
