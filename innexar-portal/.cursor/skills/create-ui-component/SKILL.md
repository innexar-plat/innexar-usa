---
name: create-ui-component
description: Creates a reusable UI component following the project design system and Tailwind CSS. Use when adding a new React/Next component, UI element, or when the user asks to create a component.
---

# Create UI Component

## Steps

1. **Analyze existing UI components**
   - Location (e.g. `components/`, `components/ui/`)
   - Structure (props, composition, hooks)
   - How design tokens and Tailwind are used

2. **Follow design system**
   - Colors, spacing, typography from existing components or theme
   - Use design tokens / Tailwind config; avoid magic values

3. **Use Tailwind CSS**
   - Utility classes over custom CSS when possible
   - No inline styles unless necessary (e.g. dynamic values)

4. **Keep component small and reusable**
   - Single responsibility; composable
   - Prefer props over hardcoded behavior

5. **Separate logic from UI**
   - Hooks for state and side effects
   - Presentational component + hook when it simplifies reuse

## Rules

- Maximum component size: 200 lines; split if larger.
- Avoid inline styles; use Tailwind or CSS classes.
