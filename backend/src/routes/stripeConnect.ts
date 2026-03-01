import { Router } from 'express';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { env } from '../config/env.js';
import { encrypt } from '../utils/crypto.js';
import { pool } from '../config/db.js';

const router = Router();

router.get('/connect-url', requireAuth, async (req: AuthRequest, res) => {
  const state = Buffer.from(JSON.stringify({ userId: req.user!.id })).toString('base64url');
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: env.stripeConnectClientId,
    scope: 'read_only',
    redirect_uri: env.stripeConnectRedirectUri,
    state
  });
  res.json({ url: `https://connect.stripe.com/oauth/authorize?${params.toString()}` });
});

router.get('/oauth/callback', async (req, res) => {
  const { code, state } = req.query;
  if (!code || !state || typeof code !== 'string' || typeof state !== 'string') {
    return res.status(400).send('Invalid callback');
  }

  const decoded = JSON.parse(Buffer.from(state, 'base64url').toString('utf8')) as { userId: string };

  const tokenRes = await fetch('https://connect.stripe.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_secret: env.stripeConnectClientSecret
    })
  });

  if (!tokenRes.ok) return res.status(400).send('Token exchange failed');
  const token = await tokenRes.json() as {
    stripe_user_id: string;
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
  };

  const expiresAt = token.expires_in ? new Date(Date.now() + token.expires_in * 1000) : null;

  await pool.query(
    `INSERT INTO stripe_connections (user_id, stripe_account_id, access_token, refresh_token, token_expires_at)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (user_id)
     DO UPDATE SET stripe_account_id = EXCLUDED.stripe_account_id,
                   access_token = EXCLUDED.access_token,
                   refresh_token = EXCLUDED.refresh_token,
                   token_expires_at = EXCLUDED.token_expires_at,
                   connected_at = now()`,
    [
      decoded.userId,
      token.stripe_user_id,
      encrypt(token.access_token),
      token.refresh_token ? encrypt(token.refresh_token) : null,
      expiresAt
    ]
  );

  return res.redirect(`${env.frontendUrl}/settings`);
});

export default router;
