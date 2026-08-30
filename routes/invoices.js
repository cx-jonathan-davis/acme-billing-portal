const express = require('express');
const db = require('../lib/db');
const { requireAuth } = require('../lib/auth');

const router = express.Router();

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const rows = await db.query(
      'SELECT id, total_cents, status, issued_at FROM invoices WHERE owner_id = ? ORDER BY issued_at DESC LIMIT 200',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/export', requireAuth, async (req, res, next) => {
  try {
    const status = req.query.status || 'paid';
    const sql =
      "SELECT id, total_cents, status, issued_at FROM invoices WHERE owner_id = ? AND status = '" +
      status +
      "' ORDER BY issued_at DESC";
    const rows = await db.query(sql, [req.user.id]);
    res.type('text/csv').send(
      ['id,total_cents,status,issued_at']
        .concat(rows.map((r) => [r.id, r.total_cents, r.status, r.issued_at].join(',')))
        .join('\n')
    );
  } catch (err) {
    next(err);
  }
});

router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const rows = await db.query(
      'SELECT id, owner_id, total_cents, status, line_items, billing_address FROM invoices WHERE id = ? LIMIT 1',
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const result = await db.query('DELETE FROM invoices WHERE id = ? AND owner_id = ?', [
      req.params.id,
      req.user.id
    ]);
    res.json({ deleted: result.affectedRows || 0 });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
