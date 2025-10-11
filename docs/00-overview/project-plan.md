# Project Plan

## Timeline

| Phase | Duration | Goals |
|-------|----------|-------|
| Discovery | Weeks 1-2 | Confirm requirements, gather baseline datasets, define success metrics. |
| Prototype | Weeks 3-6 | Implement heuristic pipeline, initial CLI, and minimal frontend. |
| Beta | Weeks 7-12 | Add model stacking, expand dataset tooling, harden UI, ship beta release. |
| Release | Weeks 13-16 | Stabilise APIs, document operations, prepare v1.0.0 launch. |

## Workstreams

- **Detection Pipeline:** Feature extraction, heuristics, model training, calibration.
- **Product Experience:** CLI improvements, dashboard polish, accessibility checks.
- **Data Operations:** Corpus acquisition, deduplication, metadata management.
- **Quality & Compliance:** Testing, observability, responsible use guidelines.

## Milestones

1. `M1` – End-to-end heuristic verdict on sample projects (Week 4).
2. `M2` – Model ensemble with calibrated probabilities (Week 8).
3. `M3` – Public beta with documentation set (Week 12).
4. `M4` – Stable v1.0.0 release with changelog, support policy, and citation (Week 16).

## Dependencies

- Access to labelled code datasets.
- Availability of GPU resources for model experimentation (optional but recommended).
- Frontend build tooling (Node.js 18+).
- Python 3.10+ runtime for backend features.

## Risk Mitigation

- Keep heuristics deterministic to guarantee baseline coverage even if ML models regress.
- Maintain reproducible data pipelines with hashed manifests.
- Schedule regular design reviews with stakeholders to avoid scope creep.
