# Coding Guidelines

## General Principles

- Prefer readability and explicitness over clever constructs.
- Maintain type hints in Python and TypeScript.
- Keep functions focused; extract helpers for complex logic.

## Python

- Follow PEP 8 with project-specific exceptions documented here.
- Use `ruff` for linting and `black`-compatible formatting (line length 100).
- Document public functions with docstrings summarising parameters and return values.
- Handle file I/O with context managers; avoid global state.

## TypeScript/React

- Use functional components with hooks.
- Keep state local; lift only when necessary.
- Co-locate styles with components via CSS Modules or Tailwind utilities.
- Validate props with TypeScript interfaces defined in `frontend/src/types.ts`.

## Testing

- Add unit tests for new logic (`pytest` for backend, `React Testing Library` for frontend).
- Include regression tests when fixing bugs.
- Keep tests deterministic and avoid network or filesystem side effects.

## Documentation

- Update relevant documents within `docs/` when behaviour changes.
- Provide inline comments only when logic is non-obvious.

## Review Checklist

- All lint and test suites pass locally.
- No TODOs left in production code.
- Changelog entry added when user-facing behaviour changes.
