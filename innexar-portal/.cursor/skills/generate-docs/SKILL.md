---
name: generate-docs
description: Generates documentation for code: functions, APIs, parameters, return types, and usage examples. Use when the user asks for documentation, API docs, or code comments for public behavior.
---

# Generate Documentation

## Steps

1. **Explain functions**
   - Purpose and behavior
   - When to use (and when not to)

2. **Document APIs**
   - Endpoint path, method, purpose
   - Request/response shape and status codes
   - Auth and errors

3. **Document parameters and return types**
   - Types and constraints
   - Defaults and optional vs required
   - Return structure and possible values

4. **Provide usage examples**
   - Minimal working examples
   - Edge cases or common mistakes if relevant

## Output format

- Markdown.
- Prefer clear structure (headings, lists, code blocks).
- Do not document implementation details that are obvious from the code; focus on contract and usage.
