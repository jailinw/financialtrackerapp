import { Router } from 'express';
import { pool } from '../config/db.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { monthsRemainingInQuarter, weeksRemainingInQuarter } from '../services/tax.js';

const router = Router();

function getRange(range: string) {
  const now = new Date();
  if (range === 'ytd') return new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
  if (range === 'qtd') return new Date(Date.UTC(now.getUTCFullYear(), Math.floor(now.getUTCMonth() / 3) * 3, 1));
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

router.get('/', requireAuth, async (req: AuthRequest, res) => {
  const range = typeof req.query.range === 'string' ? req.query.range : 'mtd';
  const start = getRange(range);
  const userId = req.user!.id;

  const txResult = await pool.query(
    `SELECT
      COALESCE(SUM(CASE WHEN amount_cents > 0 AND type = 'charge' THEN amount_cents ELSE 0 END), 0) as revenue,
      COALESCE(SUM(fee_cents), 0) as fees,
      COALESCE(SUM(CASE WHEN category IN ('expense','software','travel','office','meals') THEN ABS(amount_cents) ELSE 0 END), 0) as expenses
     FROM transactions
     WHERE user_id = $1 AND occurred_at >= $2`,
    [userId, start]
  );

  const profileResult = await pool.query(
    'SELECT federal_rate, state_rate, self_employment_rate FROM tax_profiles WHERE user_id = $1',
    [userId]
  );

  const revenue = Number(txResult.rows[0].revenue);
  const fees = Number(txResult.rows[0].fees);
  const expenses = Number(txResult.rows[0].expenses);
  const profit = revenue - fees - expenses;

  const rate = profileResult.rowCount
    ? Number(profileResult.rows[0].federal_rate) + Number(profileResult.rows[0].state_rate) + Number(profileResult.rows[0].self_employment_rate)
    : 0.423;

  const estimatedTaxesOwed = Math.max(0, profit * rate);

  res.json({
    revenue,
    fees,
    expenses,
    netProfit: profit,
    estimatedTaxesOwed,
    suggestedWeeklySavings: estimatedTaxesOwed / weeksRemainingInQuarter(),
    suggestedMonthlySavings: estimatedTaxesOwed / monthsRemainingInQuarter()
  });
});

export default router;
