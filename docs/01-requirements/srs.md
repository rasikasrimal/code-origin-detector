# Software Requirements Specification (SRS)

## 1. Introduction

### 1.1 Purpose
Define functional and non-functional requirements for the Code Origin Detector toolkit.

### 1.2 Scope
The system provides CLI and dashboard interfaces to assess whether source files were authored by humans or AI.

### 1.3 Definitions
- **Heuristic** – Rule-based signal that highlights stylistic differences.
- **Verdict** – Probability score indicating predicted authorship.
- **Manifest** – CSV file listing evaluation targets and ground-truth labels.

## 2. Overall Description

### 2.1 Product Perspective
The toolkit consumes source files, extracts features, applies heuristics/models, and presents results via CLI or UI.

### 2.2 Product Functions
- Scan directory structures and apply include/exclude globs.
- Extract AST and stylometry features for supported languages.
- Produce probability estimates and associated explanations.
- Export results to JSON or human-readable formats.

### 2.3 User Classes
- **Security Analysts:** Evaluate suspicious code changes.
- **Researchers:** Experiment with detection strategies.
- **Developers:** Integrate detection into build pipelines.

### 2.4 Operating Environment
- Python 3.10+ supported on Windows, macOS, and Linux.
- Node.js 18+ for the frontend dashboard.

## 3. Functional Requirements

- FR1: The system SHALL accept a file path or directory and process supported languages (`.py`, `.js`).
- FR2: The system SHALL return a probability score between 0 and 1.
- FR3: The system SHALL provide a CLI command `code-origin-detector predict`.
- FR4: The system SHALL allow exporting results to a JSON report when `--report` is supplied.
- FR5: The system SHALL provide an explanation view with top contributing heuristics.
- FR6: The frontend SHALL render verdict summaries, confidence meters, and heuristic breakdowns.

## 4. Non-Functional Requirements

- NFR1: CLI operations SHOULD finish within 60 seconds for a 200-file project on a modern laptop.
- NFR2: Feature extraction MUST log intermediate metrics for reproducibility.
- NFR3: UI SHOULD meet WCAG AA accessibility guidelines.
- NFR4: Models MUST be versioned and traceable in `CHANGELOG.md`.
- NFR5: Sensitive data (proprietary code) MUST NOT be transmitted to third-party services by default.

## 5. External Interface Requirements

- Command-line interface documented in `README.md`.
- Planned REST API (future) to mirror CLI inputs/outputs.
- Data manifest CSV structure documented in `docs/03-development/configuration-management.md`.

## 6. Other Requirements

- Configurable thresholds per environment (`--threshold` flag).
- Plugin architecture for new heuristics and model agents.
