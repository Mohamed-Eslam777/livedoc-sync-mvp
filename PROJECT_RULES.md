# PROJECT RULES - LiveDoc Sync

## CRITICAL SECURITY RULES

### 1. NEVER COMMIT SECRETS

- **NO** API keys, tokens, private keys, or credentials in code
- **NO** `.env` files in git (only `.env.example`)
- All secrets MUST be loaded from environment variables
- Use `.gitignore` to exclude sensitive files

### 2. GitHub App Security

- Store `PRIVATE_KEY` as PEM in environment variable (never in repo)
- Verify ALL webhook requests using `X-Hub-Signature-256` and `WEBHOOK_SECRET`
- Generate installation tokens per-job (short-lived, never persist)
- Never store GitHub access tokens in database

### 3. Input Validation

- Validate ALL external inputs with Zod schemas
- Sanitize user input before database queries
- Validate webhook payloads before processing
- Cap diff sizes to prevent DoS (max 50KB processed)

### 4. Secret Redaction

- Redact patterns like:
  - `ghp_`, `ghs_`, `gho_` (GitHub tokens)
  - `AKIA` (AWS keys)
  - `sk-` (OpenAI keys)
  - Common API key patterns
- Never log secrets in application logs
- Truncate sensitive headers in logs

### 5. Rate Limiting

- Apply rate limits to webhook endpoints
- Apply rate limits to auth endpoints
- Implement backoff for external API calls
- Respect GitHub API rate limits

## RELIABILITY RULES

### 6. Error Handling

- Wrap all async operations in try-catch
- Log errors with structured logging (never log secrets)
- Return user-friendly error messages
- Store error details in Run records

### 7. Retries & Idempotency

- Retry transient failures (5xx, network errors, rate limits)
- Use exponential backoff (base: 1s, max: 30s)
- Implement job deduplication using `installationId:repoId:prNumber:prHeadSha`
- Handle duplicate webhook deliveries gracefully

### 8. Data Integrity

- Use database transactions for related operations
- Auto-register repos on first webhook (default `enabled=true`)
- Upsert Installation and Repo atomically
- Never process webhooks for `enabled=false` repos

## DEVELOPMENT RULES

### 9. Code Organization

- Monorepo structure: `apps/` and `packages/`
- Shared types in `packages/shared`
- TypeScript strict mode enabled
- Use ESLint + Prettier for consistency

### 10. Environment Variables

- Document ALL env vars in `.env.example`
- Use descriptive names (e.g., `GITHUB_APP_PRIVATE_KEY`)
- Fail fast if required env vars are missing
- Never use default secrets in production

### 11. Database Migrations

- Always use Prisma migrations (never manual SQL)
- Test migrations in local environment first
- Never delete migration files
- Schema changes require new migration

### 12. LLM Integration

- Make LLM provider pluggable (interface-based)
- Implement OpenAI-compatible client by default
- Use env vars: `LLM_BASE_URL`, `LLM_API_KEY`, `LLM_MODEL`
- Validate LLM output schema (Zod)
- Implement fallback for parsing failures

### 13. Testing Strategy (Future)

- Write unit tests for critical utilities (diff redaction, validation)
- Test webhook signature verification
- Mock external APIs in tests
- Test retry/backoff logic

## GIT WORKFLOW

### 14. Commits

- Write clear, descriptive commit messages
- Commit frequently with logical units of work
- Never commit generated files (node_modules, dist, .env)

### 15. .gitignore Patterns

```gitignore
node_modules/
dist/
.env
.env.local
*.log
.DS_Store
.pnpm-store/
*.pem
```

## DOCUMENTATION RULES

### 16. Code Comments

- Comment complex logic and security-critical code
- Explain WHY, not WHAT (code shows what)
- Document all API endpoints and handlers

### 17. README Requirements

- Local setup instructions (step-by-step)
- GitHub App configuration guide
- All env vars documented
- Webhook testing instructions
- Troubleshooting section

## LOGGING RULES

### 18. Structured Logging

- Use JSON format for structured logs
- Include: timestamp, level, message, context
- **NEVER** log: secrets, tokens, private keys, passwords
- Redact sensitive headers (Authorization, X-Hub-Signature)
- Log webhook processing start/success/failure

## AI SAFETY RULES

### 19. LLM Output Handling

- Label all AI-generated content clearly
- Set user expectations (accuracy, hallucinations)
- Provide confidence scores
- Never auto-merge generated patches (MVP)
- Instruct LLM to never output secrets

### 20. Prompt Engineering

- Provide clear context (PR title, diff, files changed)
- Instruct model to cite evidence from diff
- Set confidence="low" if uncertain
- Never claim changes not in diff context

---

**ENFORCEMENT**: All contributors MUST follow these rules. Violations will be flagged in code review.
