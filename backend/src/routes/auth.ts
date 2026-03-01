import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { pool } from '../config/db.js';
import { env } from '../config/env.js';

const router = Router();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, standardHeaders: true });
const schema = z.object({ email: z.string().email(), password: z.string().min(8) });

router.post('/signup', authLimiter, async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid payload' });

  const { email, password } = parsed.data;
  const hash = await bcrypt.hash(password, 10);

  try {
    const result = await pool.query(
      `INSERT INTO users (email, password_hash)
       VALUES ($1, $2)
       RETURNING id, email`,
      [email.toLowerCase(), hash]
    );

    const user = result.rows[0];
    await pool.query(`INSERT INTO tax_profiles (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING`, [user.id]);
    await pool.query(`INSERT INTO subscriptions (user_id, status) VALUES ($1, 'inactive') ON CONFLICT (user_id) DO NOTHING`, [user.id]);
    return res.status(201).json({ id: user.id, email: user.email });
  } catch {
    return res.status(409).json({ error: 'User already exists' });
  }
});

router.post('/login', authLimiter, async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid payload' });

  const { email, password } = parsed.data;
  const result = await pool.query(`SELECT id, email, password_hash FROM users WHERE email = $1`, [email.toLowerCase()]);
  const user = result.rows[0];
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ id: user.id, email: user.email }, env.jwtSecret, { expiresIn: '7d' });
  return res.json({ token });
});

export default router;
