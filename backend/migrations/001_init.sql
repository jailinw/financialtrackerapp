CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stripe_connections (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  stripe_account_id TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  connected_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_id TEXT UNIQUE,
  type TEXT CHECK (type IN ('charge','refund','fee','payout','adjustment')),
  amount_cents BIGINT NOT NULL,
  fee_cents BIGINT DEFAULT 0,
  net_cents BIGINT NOT NULL,
  currency TEXT DEFAULT 'usd',
  description TEXT,
  occurred_at TIMESTAMPTZ NOT NULL,
  category TEXT DEFAULT 'uncategorized',
  tags JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS tax_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  filing_status TEXT DEFAULT 'single',
  state TEXT DEFAULT 'AL',
  federal_rate NUMERIC DEFAULT 0.22,
  state_rate NUMERIC DEFAULT 0.05,
  self_employment_rate NUMERIC DEFAULT 0.153,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS subscriptions (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT DEFAULT 'inactive',
  current_period_end TIMESTAMPTZ
);
