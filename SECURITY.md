# Security Policy

## Overview

LiveDoc Sync takes security seriously. This document outlines our security practices and how to report vulnerabilities.

## Security Measures

### 1. Webhook Verification

All GitHub webhooks are verified using **HMAC SHA256** with a webhook secret. Unverified requests are rejected immediately.

**Implementation**: `apps/api/src/utils/webhookVerifier.ts`

### 2. Secret Management

- **Never commit secrets** to version control
- All secrets are loaded from environment variables
- `.gitignore` excludes `.env`, `.pem`, and other sensitive files
- GitHub App private keys are stored as PEM strings in env vars

### 3. GitHub App Authentication

- Installation tokens are **short-lived** (1 hour)
- Tokens are generated per-job, never persisted
- App private key is kept secure in `GITHUB_APP_PRIVATE_KEY`

### 4. Input Validation

- All external inputs are validated with **Zod** schemas
- Webhook payloads are strictly typed and validated
- API requests are sanitized before database queries

### 5. Secret Redaction

Diffs are automatically scanned and redacted for:

- GitHub tokens (`ghp_`, `ghs_`, `gho_`, `github_pat_`)
- AWS keys (`AKIA`)
- OpenAI keys (`sk-`)
- Google API keys (`AIza`)
- Generic long tokens (32+ characters)

**Implementation**: `apps/worker/src/utils/diffProcessor.ts`

### 6. Rate Limiting

- API endpoints are rate-limited (100 requests/minute)
- Webhook endpoints have stricter limits (200 requests/minute)
- Implemented using `@fastify/rate-limit` with Redis

### 7. Diff Size Limits

- Diffs are capped at **50KB** to prevent DoS attacks
- Truncated diffs are clearly marked in the output

### 8. Logging

- Structured logging with Fastify's built-in logger
- Sensitive headers (`Authorization`, `X-Hub-Signature-256`) are redacted
- Never log secrets, tokens, or private keys

### 9. Database Security

- Prisma ORM prevents SQL injection
- All queries are parameterized
- Database credentials are environment variables only

### 10. HTTPS/TLS

- Production deployments **must** use HTTPS
- GitHub App webhooks should use HTTPS URLs only
- Use tools like ngrok for local HTTPS tunneling

## Reporting Vulnerabilities

If you discover a security vulnerability, please:

1. **Do NOT** create a public GitHub issue
2. Email security details to: [your-security-email@example.com]
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We will respond within **48 hours** and work on a fix as quickly as possible.

## Security Checklist for Deployment

Before deploying to production:

- [ ] All secrets are in environment variables (not hardcoded)
- [ ] GitHub App webhook URL uses HTTPS
- [ ] `NEXTAUTH_SECRET` is a strong random string (min 32 chars)
- [ ] `GITHUB_WEBHOOK_SECRET` is a strong random string
- [ ] Database is behind a firewall (not publicly accessible)
- [ ] Redis is not publicly accessible
- [ ] Rate limiting is enabled
- [ ] CORS is configured for your production domain only
- [ ] Logging excludes sensitive data
- [ ] GitHub App permissions are minimal (principle of least privilege)

## Dependencies

- Regularly update dependencies: `pnpm update`
- Monitor for security advisories with `pnpm audit`
- Use Dependabot or Renovate for automated updates

## Best Practices

1. **Rotate secrets regularly** (GitHub tokens, webhook secrets, etc.)
2. **Monitor logs** for suspicious activity
3. **Backup database** regularly
4. **Review GitHub App installation** permissions periodically
5. **Use environment-specific secrets** (dev vs. prod)

## License

This security policy is part of the LiveDoc Sync project and follows the same MIT License.
