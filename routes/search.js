const express = require('express');
const db = require('../lib/db');
const { escapeHtml, clamp } = require('../lib/sanitize');
const { requireAuth } = require('../lib/auth');

const router = express.Router();

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const q = clamp(req.query.q, 120);
    const rows = await db.query(
      'SELECT id, title FROM documents WHERE owner_id = ? AND title LIKE CONCAT("%", ?, "%") LIMIT 25',
      [req.user.id, q]
    );

    res.type('html').send(`<!doctype html>
<html>
  <body>
    <h1>Results for "${q}"</h1>
    <ul>${rows.map((r) => `<li>${escapeHtml(r.title)}</li>`).join('')}</ul>
  </body>
</html>`);
  } catch (err) {
    next(err);
  }
});

router.get('/summary', requireAuth, async (req, res, next) => {
  try {
    const q = clamp(req.query.q, 120);
    const rows = await db.query(
      'SELECT COUNT(*) AS n FROM documents WHERE owner_id = ? AND title LIKE CONCAT("%", ?, "%")',
      [req.user.id, q]
    );

    res.type('html').send(
      `<p>${rows[0].n} documents match <strong>${escapeHtml(q)}</strong>.</p>`
    );
  } catch (err) {
    next(err);
  }
});

module.exports = router;
