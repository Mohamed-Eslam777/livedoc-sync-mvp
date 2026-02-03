# 🤖 LiveDoc Sync

AI-powered GitHub documentation sync tool. Automatically analyze pull requests and keep your documentation in sync with code changes.

## ✨ Features

- 📝 **AI-Powered Analysis**: Automatically analyze PRs for documentation impact
- 🔍 **Smart Detection**: Identifies what docs need updates based on code changes
- 💡 **Intelligent Suggestions**: Generates suggested documentation patches
- 🔒 **Secure**: GitHub App integration with webhook verification and secret redaction
- ⚡ **Real-Time**: Async processing with BullMQ and Redis
- 🎯 **Auto-Registration**: Repositories are automatically registered on first webhook

## 🏗️ Architecture

**Monorepo Structure** (pnpm workspaces):

- `apps/api` - Fastify API server (webhooks, auth)
- `apps/worker` - BullMQ worker (PR analysis, LLM integration)
- `apps/web` - Next.js frontend (dashboard, GitHub OAuth)
- `packages/shared` - Shared types, schemas, Prisma client
- `infra/` - Docker Compose configuration

**Tech Stack**:

- **Backend**: Node.js + TypeScript + Fastify
- **Database**: PostgreSQL + Prisma ORM
- **Queue**: BullMQ + Redis
- **Frontend**: Next.js + NextAuth
- **LLM**: Pluggable (OpenAI-compatible by default)

## 🚀 Quick Start

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 8.0.0
- Docker (for local PostgreSQL + Redis)
- GitHub App (see setup below)
- LLM API key (OpenAI or compatible)

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd livedoc-sync
pnpm install
```

### 2. Start Infrastructure

```bash
cd infra
docker-compose up -d
```

This starts PostgreSQL (port 5432) and Redis (port 6379).

### 3. Configure Environment

Copy `.env.example` to `.env` and fill in all required values:

```bash
cp .env.example .env
```

**Required variables**:

- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_HOST`, `REDIS_PORT` - Redis connection
- `GITHUB_APP_ID`, `GITHUB_APP_PRIVATE_KEY`, `GITHUB_WEBHOOK_SECRET` - GitHub App credentials
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` - GitHub OAuth credentials
- `NEXTAUTH_URL`, `NEXTAUTH_SECRET` - NextAuth configuration
- `LLM_API_KEY`, `LLM_MODEL` - LLM provider credentials

Also create `apps/web/.env.local`:

```bash
cp apps/web/.env.local.example apps/web/.env.local
```

### 4. Run Database Migrations

```bash
pnpm db:generate
pnpm db:migrate
```

### 5. Start Development Servers

```bash
pnpm dev
```

This starts:

- API server on `http://localhost:3001`
- Worker (background processing)
- Web UI on `http://localhost:3000`

## 🔐 GitHub App Setup

### Create a GitHub App

1. Go to **Settings → Developer settings → GitHub Apps → New GitHub App**
2. Fill in:
   - **Name**: `LiveDoc Sync` (or your preferred name)
   - **Homepage URL**: `http://localhost:3000` (or your production URL)
   - **Webhook URL**: `http://localhost:3001/api/webhooks/github` (use ngrok for local dev)
   - **Webhook secret**: Generate a random secret (save for `.env`)

3. **Permissions** (Repository permissions):
   - **Contents**: Read-only (to fetch PR diffs)
   - **Pull requests**: Read & Write (to read PRs and post comments)
   - **Metadata**: Read-only (required)

4. **Subscribe to events**:
   - `pull_request` (opened, reopened, synchronize, ready_for_review)
   - `installation` (optional, for installation tracking)

5. After creation:
   - Note the **App ID** (for `GITHUB_APP_ID`)
   - Generate and download **Private Key** (for `GITHUB_APP_PRIVATE_KEY`)
   - Copy **Webhook Secret** (for `GITHUB_WEBHOOK_SECRET`)

### Create GitHub OAuth App

1. Go to **Settings → Developer settings → OAuth Apps → New OAuth App**
2. Fill in:
   - **Application name**: `LiveDoc Sync Web`
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`

3. After creation:
   - Note the **Client ID** (for `GITHUB_CLIENT_ID`)
   - Generate a **Client Secret** (for `GITHUB_CLIENT_SECRET`)

## 🧪 Testing Webhooks Locally

Use [ngrok](https://ngrok.com/) to expose your local API:

```bash
ngrok http 3001
```

Update your GitHub App webhook URL to: `https://<your-ngrok-id>.ngrok.io/api/webhooks/github`

Then:

1. Install the GitHub App on a test repository
2. Create or update a pull request
3. Check logs in API and Worker terminals

## 📁 Project Structure

```
livedoc-sync/
├── apps/
│   ├── api/          # Fastify API (webhooks, job enqueuing)
│   ├── worker/       # BullMQ worker (PR analysis, LLM)
│   └── web/          # Next.js frontend (dashboard)
├── packages/
│   └── shared/       # Shared code (Prisma, types, schemas)
├── infra/
│   └── docker-compose.yml
├── .env.example
├── package.json
├── pnpm-workspace.yaml
└── PROJECT_RULES.md
```

## 🔧 Available Scripts

```bash
pnpm dev           # Run all apps in dev mode
pnpm build         # Build all apps
pnpm lint          # Lint all apps
pnpm format        # Format code with Prettier
pnpm db:generate   # Generate Prisma client
pnpm db:migrate    # Run database migrations
pnpm db:studio     # Open Prisma Studio
```

## 🔒 Security

See [`SECURITY.md`](./SECURITY.md) for comprehensive security policy and vulnerability reporting.

See [`PROJECT_RULES.md`](./PROJECT_RULES.md) for development and security guidelines.

**Key points**:

- Never commit secrets (use `.env` files)
- All webhooks are verified using HMAC SHA256
- Secrets are automatically redacted from diffs
- GitHub App tokens are short-lived (1 hour)
- Rate limiting is enabled on all API endpoints

## 🎯 How It Works

1. User installs GitHub App on repositories
2. When a PR is opened/updated, GitHub sends a webhook
3. API verifies signature, validates payload, upserts Installation/Repo
4. API enqueues a job to BullMQ with dedupe key (idempotency)
5. Worker picks up job:
   - Generates GitHub App installation token
   - Fetches PR details and diff
   - Truncates diff (max 50KB) and redacts secrets
   - Sends to LLM for analysis
   - Posts AI-generated comment on PR
   - Stores Run record in database
6. User views runs and analysis in web dashboard

## 🐛 Troubleshooting

**Issue**: Database connection failed

- Ensure Docker Compose is running: `cd infra && docker-compose ps`
- Check `DATABASE_URL` in `.env`

**Issue**: Worker not processing jobs

- Check Redis is running: `cd infra && docker-compose logs redis`
- Verify `REDIS_HOST` and `REDIS_PORT` in `.env`

**Issue**: GitHub webhook not received

- For local dev, ensure ngrok is running and URL is updated in GitHub App settings
- Check webhook delivery history in GitHub App settings

**Issue**: LLM analysis failed

- Verify `LLM_API_KEY` is correct
- Check worker logs for detailed error messages

## 📝 License

MIT

## 🤝 Contributing

1. Follow the rules in `PROJECT_RULES.md`
2. Never commit secrets
3. Write clear commit messages
4. Test thoroughly before submitting PRs
