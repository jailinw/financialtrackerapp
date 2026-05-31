import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';
const router = Router();
const patchSchema = z.object({ category: z.string().optional(), tags: z.array(z.string()).optional() });
router.get('/', requireAuth, async (req, res) => {
    const { start, end, category } = req.query;
    const params = [req.user.id];
    let where = 'WHERE user_id = $1';
    if (typeof start === 'string') {
        params.push(start);
        where += ` AND occurred_at >= $${params.length}::date`;
    }
    if (typeof end === 'string') {
        params.push(end);
        where += ` AND occurred_at < ($${params.length}::date + INTERVAL '1 day')`;
    }
    if (typeof category === 'string') {
        params.push(category);
        where += ` AND category = $${params.length}`;
    }
    const result = await pool.query(`SELECT id, stripe_id, type, amount_cents, fee_cents, net_cents, currency, description, occurred_at, category, tags
     FROM transactions ${where}
     ORDER BY occurred_at DESC LIMIT 500`, params);
    res.json(result.rows);
});
router.patch('/:id', requireAuth, async (req, res) => {
    const parsed = patchSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: 'Invalid payload' });
    const { id } = req.params;
    const current = await pool.query('SELECT category, tags FROM transactions WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (!current.rowCount)
        return res.status(404).json({ error: 'Not found' });
    const nextCategory = parsed.data.category ?? current.rows[0].category;
    const nextTags = parsed.data.tags ?? current.rows[0].tags;
    const updated = await pool.query(`UPDATE transactions SET category = $1, tags = $2::jsonb WHERE id = $3 AND user_id = $4 RETURNING *`, [nextCategory, JSON.stringify(nextTags), id, req.user.id]);
    res.json(updated.rows[0]);
});
export default router;
