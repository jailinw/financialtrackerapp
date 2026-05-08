import dotenv from 'dotenv';

dotenv.config();

const required = [
  'DATABASE_URL',
  'JWT_SECRET',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_CONNECT_CLIENT_ID',
  'STRIPE_CONNECT_CLIENT_SECRET',
  'STRIPE_CONNECT_REDIRECT_URI',
  'APP_BASE_URL',
  'FRONTEND_URL',
  'TOKEN_ENCRYPTION_KEY'
] as const;

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing env var: ${key}`);
  }
}

export const env = {
  port: Number(process.env.PORT || 4000),
  databaseUrl: process.env.DATABASE_URL!,
  jwtSecret: process.env.JWT_SECRET!,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY!,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
  stripeConnectClientId: process.env.STRIPE_CONNECT_CLIENT_ID!,
  stripeConnectClientSecret: process.env.STRIPE_CONNECT_CLIENT_SECRET!,
  stripeConnectRedirectUri: process.env.STRIPE_CONNECT_REDIRECT_URI!,
  appBaseUrl: process.env.APP_BASE_URL!,
  frontendUrl: process.env.FRONTEND_URL!,
  tokenEncryptionKey: process.env.TOKEN_ENCRYPTION_KEY!
};
