---
name: create-database-model
description: Creates a new database model following project conventions. Covers naming, indexes, relationships, and migrations. Use when adding a new entity, table, or when the user asks to create a model or schema.
---

# Create Database Model

## Steps

1. **Analyze existing models**
   - File location (e.g. `models/`, `repositories/`)
   - Naming (tables, columns, foreign keys)
   - Base classes, mixins (e.g. timestamps, tenant_id)

2. **Follow naming conventions**
   - Table names (singular/plural as in project)
   - Column names (snake_case typical)
   - Consistent with existing models

3. **Add indexes when necessary**
   - Columns used in filters, joins, ordering
   - Unique constraints where required
   - Avoid N+1; consider composite indexes for common queries

4. **Create relationships**
   - Foreign keys and relationship definitions (ORM style used in project)
   - Cascade/on delete behavior consistent with project

5. **Generate migrations if required**
   - Use project migration tool (e.g. Alembic)
   - One logical change per migration
   - Reversible (downgrade) when possible

## Rules

- Never change schema without a migration; no direct production schema edits.
- Use consistent naming with the rest of the codebase.
