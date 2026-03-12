---
name: create-module
description: Creates a full feature module: database model, API endpoints, service layer, UI pages, and CRUD operations following project architecture. Use when adding a new feature or domain (e.g. SaaS module) or when the user asks to create a complete module.
---

# Create Module

Use for full features (e.g. a new SaaS capability). Ensures consistency across layers.

## Steps

1. **Create database model**
   - Apply create-database-model skill: naming, indexes, relationships, migration

2. **Create API endpoints**
   - Apply create-api-endpoint skill: schemas, controller, service, repository, errors, response standard
   - CRUD: list, get by id, create, update, delete (as needed)

3. **Create service layer**
   - One service per domain/aggregate
   - Business rules; call repositories only
   - Tenant/user context where applicable

4. **Create UI pages**
   - List and detail views; forms for create/edit
   - Apply create-ui-component skill for reusable parts
   - Loading, empty, and error states

5. **Wire CRUD operations**
   - UI calls API; API uses service/repository
   - Validation and error handling end-to-end

## Rules

- Follow project architecture (clean layers, no business logic in controllers or UI data layer).
- Keep code modular: one cohesive feature per module; avoid monoliths.
