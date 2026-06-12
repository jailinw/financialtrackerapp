import { Router } from 'express';
import PDFDocument from 'pdfkit';
import { stringify } from 'csv-stringify/sync';
import { pool } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';
const router = Router();
router.get('/expenses.csv', requireAuth, async (req, res) => {
    const { start, end } = req.query;
    const result = await pool.query(`SELECT occurred_at, description, amount_cents, fee_cents, net_cents, category, tags
     FROM transactions
     WHERE user_id = $1
       AND category IN ('expense','software','travel','office','meals')
       AND occurred_at >= $2::date
       AND occurred_at < ($3::date + interval '1 day')
     ORDER BY occurred_at`, [req.user.id, start, end]);
    const csv = stringify(result.rows, { header: true });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="expenses.csv"');
    res.send(csv);
});
router.get('/quarterly.pdf', requireAuth, async (req, res) => {
    const year = Number(req.query.year);
    const quarter = Number(req.query.quarter);
    const startMonth = (quarter - 1) * 3;
    const start = new Date(Date.UTC(year, startMonth, 1));
    const end = new Date(Date.UTC(year, startMonth + 3, 0, 23, 59, 59));
    const result = await pool.query(`SELECT
      COALESCE(SUM(CASE WHEN type = 'charge' THEN amount_cents ELSE 0 END), 0) as revenue,
      COALESCE(SUM(fee_cents), 0) as fees,
      COALESCE(SUM(CASE WHEN category IN ('expense','software','travel','office','meals') THEN ABS(amount_cents) ELSE 0 END), 0) as expenses
     FROM transactions
     WHERE user_id = $1 AND occurred_at BETWEEN $2 AND $3`, [req.user.id, start, end]);
    const revenue = Number(result.rows[0].revenue);
    const fees = Number(result.rows[0].fees);
    const expenses = Number(result.rows[0].expenses);
    const profit = revenue - fees - expenses;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="quarterly-${year}-Q${quarter}.pdf"`);
    const doc = new PDFDocument();
    doc.pipe(res);
    doc.fontSize(20).text(`Quarterly Summary - ${year} Q${quarter}`);
    doc.moveDown();
    doc.fontSize(12).text(`Revenue: $${(revenue / 100).toFixed(2)}`);
    doc.text(`Fees: $${(fees / 100).toFixed(2)}`);
    doc.text(`Expenses: $${(expenses / 100).toFixed(2)}`);
    doc.text(`Net Profit: $${(profit / 100).toFixed(2)}`);
    doc.end();
});
export default router;
