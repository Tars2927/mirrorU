# Mirror of Truth

A deployable Express web app with a polished static frontend and an Anthropic-powered quote API.

## Run Locally

```bash
npm install
cp .env.example .env
npm run dev
```

Set `ANTHROPIC_API_KEY` in `.env`, then open `http://localhost:3000`.

## Deploy

Use any Node host that supports Express apps.

```bash
npm ci
npm start
```

Required environment variable:

```bash
ANTHROPIC_API_KEY=...
```

Useful optional variables:

```bash
PORT=3000
NODE_ENV=production
ANTHROPIC_MODEL=claude-sonnet-4-20250514
ALLOWED_ORIGINS=https://your-domain.com
RATE_LIMIT_MAX=40
RATE_LIMIT_WINDOW_MS=900000
```

The frontend is served from `public/`. The API endpoints are `GET /health` and `POST /api/quote`.
