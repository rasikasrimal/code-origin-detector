# Code Origin Detector – Frontend Dashboard

Interactive web dashboard built with Next.js 15 (App Router), Tailwind CSS, shadcn/ui primitives, Zustand, and Lucide icons.

## Getting started

```bash
cd frontend
npm install
npm run dev
```

The dev server runs at http://localhost:3000 by default.

## Features

- Dual-pane workspace with code input (paste or upload) and live prediction results.
- Example snippets to demo the pipeline without backend provisioning.
- Persisted session history (in-memory) to compare recent predictions.
- Mock API route (`/api/predict`) that emulates heuristic scoring while backend integration is under construction.

## Project layout

```
frontend/
+-- src/app/               # App Router pages & API routes
¦   +-- api/predict/       # Mock inference endpoint
¦   +-- layout.tsx         # Root layout with shared fonts/styles
¦   +-- page.tsx           # Main dashboard
+-- src/components/        # UI building blocks (shadcn-style primitives + analyzer panels)
+-- src/hooks/             # Reusable React hooks
+-- src/lib/               # Utilities & example snippets
+-- src/stores/            # Zustand stores
+-- src/types/             # Shared TypeScript contracts
+-- tailwind.config.ts     # Design tokens & theme extensions
```

## Next steps

- Replace the mock predictor API with calls into the Python inference service.
- Wire up streaming updates from long-running analyses.
- Add authentication and workspace scoping if the tool is deployed broadly.
- Expand the explanations view with SHAP charts once model artefacts are available.
