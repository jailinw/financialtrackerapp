import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import authRoutes from './routes/auth.js';
import stripeConnectRoutes from './routes/stripeConnect.js';
import syncRoutes from './routes/sync.js';
import metricsRoutes from './routes/metrics.js';
import transactionsRoutes from './routes/transactions.js';
import reportsRoutes from './routes/reports.js';
import billingRoutes from './routes/billing.js';
import webhookRoutes from './routes/webhooks.js';
import meRoutes from './routes/me.js';

const app = express();

app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }), webhookRoutes);
app.use(cors({ origin: env.frontendUrl }));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/stripe', stripeConnectRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/me', meRoutes);

app.listen(env.port, () => {
  console.log(`Backend listening on http://localhost:${env.port}`);
});
