# Test Plan

## Objectives

- Validate that heuristic and model pipelines produce consistent verdicts.
- Ensure CLI and frontend features operate correctly across supported environments.
- Detect regressions quickly through automated suites.

## Test Levels

- **Unit Tests:** Validate individual functions and heuristics (`pytest`, `React Testing Library`).
- **Integration Tests:** Exercise CLI commands against sample repositories.
- **End-to-End Tests (Roadmap):** Simulate user flows in the dashboard using Playwright.

## Test Environment

- Python 3.10 and 3.11 on Windows, macOS, Linux.
- Node.js 18 LTS.
- Sample datasets stored in `data/` and `docs/examples/`.

## Entry Criteria

- Requirements baselined in `docs/01-requirements`.
- Test data prepared and documented.
- Development complete for the feature under test.

## Exit Criteria

- All critical defects resolved or accepted with mitigation plan.
- Test coverage thresholds met (backend 80%, frontend 70%).
- Regression suite passing in CI.

## Deliverables

- Test execution logs.
- Defect reports filed via GitHub issue templates.
- Summary in `docs/04-testing/qa-report.md`.
