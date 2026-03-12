---
name: generate-tests
description: Generates unit tests for business logic. Identifies core logic, creates test cases, covers edge cases and error scenarios. Use when adding tests for new or existing code, or when the user asks for tests.
---

# Generate Tests

## Steps

1. **Identify core logic**
   - Services, pure functions, critical branches
   - Avoid testing trivial glue code only

2. **Create test cases**
   - Happy path
   - Boundary values and invalid inputs

3. **Test edge cases**
   - Empty inputs, nulls, limits
   - Concurrency or ordering if relevant

4. **Test error scenarios**
   - Validation failures, not-found, permission denied
   - Expected exceptions and error payloads

## Rules

- Tests must be isolated (no shared mutable state, mocks for external deps).
- Follow project test framework (e.g. pytest, Jest/React Testing Library).
- Bug fix: add a failing test first, then fix.
