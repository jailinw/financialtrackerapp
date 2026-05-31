import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { stripe } from '../config/stripe.js';
import { pool } from '../config/db.js';
import { env } from '../config/env.js';
const router = Router();
const MONTHLY_PRICE_ID = process.env.STRIPE_PRICE_ID_MONTHLY || 'price_123';
router.post('/checkout', requireAuth, async (req, res) => {
    const userId = req.user.id;
    const email = req.user.email;
    let sub = await pool.query('SELECT stripe_customer_id FROM subscriptions WHERE user_id = $1', [userId]);
    let customerId = sub.rows[0]?.stripe_customer_id;
    if (!customerId) {
        const customer = await stripe.customers.create({ email, metadata: { userId } });
        customerId = customer.id;
        await pool.query(`INSERT INTO subscriptions (user_id, stripe_customer_id, status)
       VALUES ($1, $2, 'inactive')
       ON CONFLICT (user_id) DO UPDATE SET stripe_customer_id = EXCLUDED.stripe_customer_id`, [userId, customerId]);
    }
    const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        customer: customerId,
        line_items: [{ price: MONTHLY_PRICE_ID, quantity: 1 }],
        success_url: `${env.frontendUrl}/billing?success=1`,
        cancel_url: `${env.frontendUrl}/billing?canceled=1`
    });
    res.json({ url: session.url });
});
router.post('/portal', requireAuth, async (req, res) => {
    const result = await pool.query('SELECT stripe_customer_id FROM subscriptions WHERE user_id = $1', [req.user.id]);
    if (!result.rows[0]?.stripe_customer_id)
        return res.status(400).json({ error: 'No customer found' });
    const portal = await stripe.billingPortal.sessions.create({
        customer: result.rows[0].stripe_customer_id,
        return_url: `${env.frontendUrl}/billing`
    });
    res.json({ url: portal.url });
});
export default router;
