import { Router } from 'express';
import Stripe from 'stripe';
import { pool } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';
import { decrypt } from '../utils/crypto.js';
const router = Router();
router.post('/stripe', requireAuth, async (req, res) => {
    const userId = req.user.id;
    const conn = await pool.query('SELECT stripe_account_id, access_token FROM stripe_connections WHERE user_id = $1', [userId]);
    if (!conn.rowCount)
        return res.status(400).json({ error: 'Stripe not connected' });
    const accessToken = decrypt(conn.rows[0].access_token);
    const stripe = new Stripe(accessToken, { apiVersion: '2024-06-20' });
    const since = Math.floor((Date.now() - 90 * 24 * 3600 * 1000) / 1000);
    const charges = await stripe.charges.list({ created: { gte: since }, limit: 100 });
    const balanceTx = await stripe.balanceTransactions.list({ created: { gte: since }, limit: 100 });
    for (const charge of charges.data) {
        const fee = charge.balance_transaction && typeof charge.balance_transaction !== 'string'
            ? charge.balance_transaction.fee
            : 0;
        await pool.query(`INSERT INTO transactions (user_id, stripe_id, type, amount_cents, fee_cents, net_cents, currency, description, occurred_at, metadata)
       VALUES ($1,$2,'charge',$3,$4,$5,$6,$7,to_timestamp($8),$9)
       ON CONFLICT (stripe_id)
       DO UPDATE SET description=EXCLUDED.description, metadata=EXCLUDED.metadata`, [userId, charge.id, charge.amount, fee, charge.amount - fee, charge.currency, charge.description, charge.created, JSON.stringify(charge)]);
    }
    for (const tx of balanceTx.data) {
        await pool.query(`INSERT INTO transactions (user_id, stripe_id, type, amount_cents, fee_cents, net_cents, currency, description, occurred_at, metadata)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,to_timestamp($9),$10)
       ON CONFLICT (stripe_id) DO NOTHING`, [
            userId,
            tx.id,
            tx.type === 'charge' ? 'charge' : tx.type === 'refund' ? 'refund' : tx.type === 'payout' ? 'payout' : tx.type === 'adjustment' ? 'adjustment' : 'fee',
            tx.amount,
            tx.fee,
            tx.net,
            tx.currency,
            tx.description,
            tx.created,
            JSON.stringify(tx)
        ]);
    }
    res.json({ chargesImported: charges.data.length, balanceTransactionsImported: balanceTx.data.length });
});
export default router;
