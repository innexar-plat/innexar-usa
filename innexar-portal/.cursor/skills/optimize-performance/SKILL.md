---
name: optimize-performance
description: Analyzes code performance. Identifies slow operations, unnecessary loops, suggests caching and database query optimizations. Use when the user reports slowness or asks for performance optimization.
---

# Optimize Performance

## Steps

1. **Identify slow operations**
   - Heavy I/O, large loops, expensive computations
   - Use profiling or logs if available; avoid guessing

2. **Detect unnecessary loops**
   - Redundant iterations, N+1 queries
   - Batch or join where appropriate

3. **Suggest caching strategies**
   - Where to cache (e.g. per request, Redis, in-memory)
   - TTL and invalidation
   - Do not cache sensitive data in unsafe places

4. **Optimize database queries**
   - Indexes for filters and joins
   - Avoid N+1; use eager load or batch queries
   - Limit result sets; pagination where needed

## Rules

- Base suggestions on evidence (profiling, query logs) when possible.
- Do not sacrifice correctness or security for speed.
