---
name: analyze-codebase
description: Analyzes the entire project before generating code. Identifies architecture, frameworks, folder structure, and existing patterns. Use before writing new code, adding features, or when the user asks to analyze the project or understand the codebase.
---

# Analyze Codebase

Run this **before** generating any code. Prevents breaking project architecture.

## Steps

1. **Identify project architecture**
   - Controllers/routers, services, repositories, models
   - Layering and dependencies between layers

2. **Detect frameworks and libraries**
   - Backend (e.g. FastAPI, Flask)
   - Frontend (e.g. React, Next.js)
   - DB/ORM, auth, validation libs

3. **Understand folder structure**
   - Where routers, services, components, styles live
   - Naming conventions (kebab-case, etc.)

4. **Follow existing patterns**
   - How endpoints are defined (schemas, error handling)
   - How components are structured (hooks, props)
   - How tests are organized

5. **Avoid creating new patterns**
   - Reuse existing abstractions and utilities
   - Do not introduce new folders or conventions without necessity

## Rules

- **Never generate code before analyzing the project.**
- Follow existing architecture (clean architecture, layer separation).
- Reuse existing components, services, and utilities whenever possible.

## Quick checklist

Before implementing a change:

- [ ] Architecture and layers identified
- [ ] Relevant existing code (endpoints, components, models) located
- [ ] Patterns and naming conventions noted
- [ ] Reuse candidates identified
