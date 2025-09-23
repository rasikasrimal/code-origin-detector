# Code Origin Detector UI

A lightweight dashboard built with React 18 + TypeScript, Vite 5, Tailwind CSS 3, and Jest + Testing Library.

## Getting started

`ash
npm install
npm run dev
`

Visit http://localhost:5173 to interact with the interface. The page simulates the detector pipeline with heuristic placeholders.

## Available scripts

- 
pm run dev – start the Vite dev server
- 
pm run build – type-check and compile production assets
- 
pm run preview – preview the production build
- 
pm run lint – run ESLint across the project
- 
pm test – execute Jest + Testing Library tests

## Project structure

`
frontend/
+-- src/
¦   +-- components/          # UI building blocks
¦   +-- data/                # Example snippets used in the demo
¦   +-- types.ts             # Shared TypeScript definitions
¦   +-- App.tsx              # Root page layout
¦   +-- setupTests.ts        # Jest DOM polyfills
+-- tailwind.config.js       # Tailwind configuration
+-- jest.config.js           # Jest + ts-jest configuration
+-- eslint.config.js         # ESLint flat config with Prettier integration
`

The UI works independently of the Python CLI, making it easy to iterate on user experience while the backend evolves.
