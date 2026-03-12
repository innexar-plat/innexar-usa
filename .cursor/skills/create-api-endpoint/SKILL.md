---
name: create-api-endpoint
description: Creates a new API endpoint following project architecture. Covers schemas, controller, service, repository, error handling, and response standards. Use when adding a new API route, REST endpoint, or when the user asks to create an endpoint.
---

# Create API Endpoint

## Steps

1. **Analyze existing API patterns**
   - How routes are registered (router prefix, tags)
   - Request/response schema location and naming
   - Error handling (HTTPException, payload format)
   - Response wrapper (e.g. `{ success, data, error }`)

2. **Create validation schema**
   - Pydantic models for request body/query/path
   - Response schema if needed
   - Reuse existing schemas when applicable

3. **Create controller (router)**
   - Validate input via dependency or body
   - Call service only; no business logic
   - Return standardized response

4. **Create service layer**
   - All business logic in service
   - Call repository; no raw SQL or HTTP in controller

5. **Connect to repository or database**
   - Use existing repository or add methods
   - No direct DB access from controller or from service (use repository)

6. **Add error handling**
   - Use project’s HTTPException and error payload
   - Do not expose stack traces or internal errors to client

7. **Follow response standard**
   - Same structure as other endpoints (e.g. success, data, error)
   - Correct HTTP status codes

## Rules

- Never put business logic in controllers; only validation, service call, response.
- Always validate inputs (Pydantic, type hints).
- Follow RESTful naming (resources, HTTP methods, status codes).
