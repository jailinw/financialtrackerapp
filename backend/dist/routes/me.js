import { Router } from 'express';
import { pool } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';
const router = Router();
router.get('/', requireAuth, async (req, res) => {
    const userId = req.user.id;
    const [userRes, connRes, subRes] = await Promise.all([
        pool.query('SELECT id, email, created_at FROM users WHERE id = $1', [userId]),
        pool.query('SELECT stripe_account_id, connected_at FROM stripe_connections WHERE user_id = $1', [userId]),
        pool.query('SELECT status, current_period_end FROM subscriptions WHERE user_id = $1', [userId])
    ]);
    return res.json({
        ...userRes.rows[0],
        stripeConnected: connRes.rowCount > 0,
        stripeAccountId: connRes.rows[0]?.stripe_account_id ?? null,
        subscriptionStatus: subRes.rows[0]?.status ?? 'inactive'
    });
});
export default router;
