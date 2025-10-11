# Risk Management Plan

## Risk Register

| ID | Description | Likelihood | Impact | Mitigation |
|----|-------------|------------|--------|------------|
| R1 | Dataset imbalance leading to biased results | Medium | High | Maintain balanced corpora, monitor metrics per cohort. |
| R2 | Frontend/API divergence | Medium | Medium | Share typed contracts and generate interfaces from schema. |
| R3 | Model drift as AI-generated code evolves | High | High | Schedule quarterly recalibration and benchmark refreshes. |
| R4 | Misuse of detector for automated enforcement | Low | High | Emphasise advisory nature in documentation and UI. |
| R5 | Security vulnerability in dependency | Medium | High | Enable Dependabot and monitor `SECURITY.md` channel. |

## Monitoring

- Weekly review of open issues tagged `risk`.
- Automated CI checks for dependency updates.
- Regression dashboard comparing model scores across releases.

## Contingency Plans

- Freeze releases if benchmark regressions exceed 5% relative drop.
- Provide hotfix patches for critical vulnerabilities within 72 hours.
- Publish public statements when misuse or limitations are identified.
