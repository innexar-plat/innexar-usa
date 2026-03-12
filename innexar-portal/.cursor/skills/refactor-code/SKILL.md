---
name: refactor-code
description: Refactors code to improve readability and maintainability. Identifies duplication, splits large functions, improves naming, and applies clean architecture. Use when the user asks to refactor, clean up, or improve code structure without changing behavior.
---

# Refactor Code

## Steps

1. **Identify duplicated logic**
   - Repeated blocks, similar functions
   - Extract to shared functions, hooks, or utilities

2. **Break large functions into smaller ones**
   - Single responsibility; max ~40 lines per function (per project rules)
   - Name functions by what they do

3. **Improve variable naming**
   - Descriptive names (camelCase for variables/functions, SCREAMING_SNAKE for constants)
   - No obscure abbreviations

4. **Apply clean architecture**
   - Controllers: validate, call service, return response
   - Services: business logic, call repositories
   - Repositories: data access only

## Rules

- Do not change business logic; behavior must remain the same.
- Maintain functionality; add or update tests if needed to lock behavior.
