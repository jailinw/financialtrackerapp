# Quarterly MVP

Quarterly is an MVP SaaS for side hustlers to estimate taxes from Stripe activity, categorize transactions, and export reports.

## Stack
- Frontend: React + Vite + TypeScript + Tailwind
- Backend: Node.js + Express (ESM) + TypeScript
- DB: PostgreSQL (`pg` Pool)
- Auth: Email/password + bcrypt + JWT
- Billing: Stripe Billing + Customer Portal
- Stripe Connect OAuth for user account linking

## Project Structure
- `backend/` API server, migrations, seed scripts
- `frontend/` React app

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy env files:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```
3. Create database `quarterly` in PostgreSQL and update `DATABASE_URL`.
4. Run migrations:
   ```bash
   npm run migrate --workspace backend
   ```
5. Start backend:
   ```bash
   npm run dev --workspace backend
   ```
6. Start frontend (new terminal):
   ```bash
   npm run dev --workspace frontend
   ```

## Demo mode seed data
After creating an account, seed fake transactions when Stripe is not connected:
```bash
SEED_EMAIL=demo@quarterly.app npm run seed --workspace backend
```

## API Highlights
- Auth: `/api/auth/signup`, `/api/auth/login`
- Me: `/api/me`
- Stripe Connect: `/api/stripe/connect-url`, `/api/stripe/oauth/callback`
- Sync: `/api/sync/stripe`
- Metrics: `/api/metrics?range=mtd|qtd|ytd`
- Transactions: `GET /api/transactions`, `PATCH /api/transactions/:id`
- Reports: `/api/reports/expenses.csv`, `/api/reports/quarterly.pdf`
- Billing: `/api/billing/checkout`, `/api/billing/portal`
- Stripe webhook: `/api/webhooks/stripe`

## Security notes
- JWT auth middleware on protected routes
- Rate limiting on auth endpoints
- AES-256-GCM encryption for Stripe OAuth tokens at rest
- Stripe webhook signature verification
- Parameterized SQL queries
- Stripe tokens never exposed in API responses
