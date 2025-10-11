# UI & UX Design

## Principles

- **Clarity:** Communicate verdicts and uncertainty with clear visual cues.
- **Transparency:** Present heuristic contributions prominently to emphasise interpretability.
- **Accessibility:** Support keyboard navigation, screen readers, and high-contrast themes.

## Layout Overview

1. **Header:** Project branding, model selector, documentation links.
2. **Analyzer Panel:** File input (upload, drag-and-drop, sample tiles), analysis settings, action buttons.
3. **Results Panel:** Verdict badges, confidence meter, heuristic breakdown, and export options.
4. **History Timeline:** List of previous analyses with quick-compare ability.

## Interaction Patterns

- Inline validation on file uploads (size limit, unsupported language).
- Toast notifications for success/failure states.
- Collapsible sections for verbose explanations, defaulting to summary view.

## Visual Language

- Tailwind theme tokens defined in `frontend/tailwind.config.js`.
- Palette: teal for human confidence, purple for AI confidence, neutral greys for undecided.
- Icons sourced from Lucide; ensure accessible labels.

## Responsive Behaviour

- Mobile: Results stack vertically, condensed heuristic table.
- Desktop: Two-column layout with sticky summary card.
- Large screens: Expandable history timeline with side-by-side comparison.

## Future Enhancements

- Integrate REST API to fetch live results instead of sandboxed heuristics.
- Add diff visualiser to compare suspect files with known-good examples.
- Provide guided walkthrough for first-time users.
