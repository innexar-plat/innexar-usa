---
name: security-review
description: Reviews code for security vulnerabilities including SQL injection, XSS, unsafe file uploads, exposed secrets, and insecure authentication. Use when reviewing PRs, before release, or when the user asks for a security review.
---

# Security Review

## Check for

- **SQL injection**
  - Parameterized queries / ORM only; no concatenation of user input into SQL

- **XSS**
  - Output escaping; safe templating; CSP where applicable

- **Unsafe file uploads**
  - Validate type, size, content; store outside web root; do not use user-provided paths

- **Exposed secrets**
  - No API keys, tokens, or credentials in code, frontend, or logs; use env or secrets store

- **Insecure authentication**
  - Strong hashing for passwords; short-lived tokens; HTTPS; secure cookie flags

- **Path traversal**
  - User input not used as file paths; pathlib + directory checks

- **SSRF**
  - User input not used to define request URLs; block internal IPs if applicable

## Rules

- Suggest concrete fixes, not only list issues.
- Never suggest exposing sensitive data or disabling security controls without documented justification.
