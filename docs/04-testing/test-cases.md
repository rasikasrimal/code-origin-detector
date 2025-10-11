# Test Cases

| ID | Title | Preconditions | Steps | Expected Result |
|----|-------|---------------|-------|-----------------|
| TC-CLI-001 | Run predict on sample repo | Requirements installed, sample project available | `code-origin-detector predict ./samples` | CLI outputs verdict table with probability per file |
| TC-CLI-002 | Export JSON report | Requirements installed | `code-origin-detector predict ./samples --report report.json` | JSON file created with run metadata and per-file scores |
| TC-FE-001 | Upload sample file | Frontend running `npm run dev` | Drag sample file into Analyzer panel | UI displays verdict and heuristics card |
| TC-FE-002 | Switch model profile | Frontend running | Select alt model from dropdown | Confidence meter updates and annotation shows model name |
| TC-BACK-001 | Heuristic explanations | Backend environment ready | `code-origin-detector explain ./sample.py` | CLI returns top explanations with weights |
| TC-API-001 | Queue scan (future) | REST API deployed | POST `/scans` with manifest | Returns scan ID with `queued` status |
