import { pool } from '../config/db.js';

const userEmail = process.env.SEED_EMAIL || 'demo@quarterly.app';

async function run() {
  const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [userEmail]);
  if (!userResult.rowCount) throw new Error(`User ${userEmail} not found. Sign up first.`);

  const userId = userResult.rows[0].id;
  await pool.query('DELETE FROM transactions WHERE user_id = $1', [userId]);

  const now = Date.now();
  const rows = Array.from({ length: 30 }).map((_, i) => {
    const amount = 2000 + Math.floor(Math.random() * 9000);
    const fee = Math.floor(amount * 0.03);
    const expense = i % 5 === 0;
    return {
      stripeId: `seed_${i}`,
      type: expense ? 'fee' : 'charge',
      amount: expense ? -Math.floor(amount * 0.4) : amount,
      fee: expense ? 0 : fee,
      net: expense ? -Math.floor(amount * 0.4) : amount - fee,
      description: expense ? 'Software expense' : `Client invoice #${i + 1}`,
      category: expense ? 'expense' : 'income',
      occurredAt: new Date(now - i * 86400000).toISOString()
    };
  });

  for (const row of rows) {
    await pool.query(
      `INSERT INTO transactions (user_id, stripe_id, type, amount_cents, fee_cents, net_cents, description, occurred_at, category, tags)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb)
       ON CONFLICT (stripe_id) DO NOTHING`,
      [userId, row.stripeId, row.type, row.amount, row.fee, row.net, row.description, row.occurredAt, row.category, JSON.stringify(['seed'])]
    );
  }

  console.log(`Seeded ${rows.length} transactions for ${userEmail}`);
  await pool.end();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
