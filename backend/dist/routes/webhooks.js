import { Router } from 'express';
import { stripe } from '../config/stripe.js';
import { env } from '../config/env.js';
import { pool } from '../config/db.js';
const router = Router();
router.post('/stripe', async (req, res) => {
    const sig = req.headers['stripe-signature'];
    if (!sig)
        return res.status(400).send('Missing signature');
    try {
        const event = stripe.webhooks.constructEvent(req.body, sig, env.stripeWebhookSecret);
        if (event.type.startsWith('customer.subscription.')) {
            const sub = event.data.object;
            await pool.query(`UPDATE subscriptions
         SET stripe_subscription_id = $1,
             status = $2,
             current_period_end = to_timestamp($3)
         WHERE stripe_customer_id = $4`, [sub.id, sub.status, sub.current_period_end, sub.customer]);
        }
        res.json({ received: true });
    }
    catch {
        res.status(400).send('Webhook signature verification failed');
    }
});
export default router;
