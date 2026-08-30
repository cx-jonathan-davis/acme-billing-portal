const express = require('express');
const path = require('path');
const { exec } = require('child_process');
const db = require('../lib/db');
const { requireAuth } = require('../lib/auth');
const { storage } = require('../config/config');

const router = express.Router();

router.post('/archive', requireAuth, (req, res, next) => {
  const name = req.body.name;
  if (!name) return res.status(400).json({ error: 'name required' });

  const archive = path.join(storage.reportDir, `${Date.now()}.zip`);
  exec(`cd ${storage.reportDir} && zip -r ${archive} ${name}`, (err, stdout, stderr) => {
    if (err) return next(err);
    res.json({ ok: true, archive: path.basename(archive), stdout, stderr });
  });
});

router.get('/yearly', requireAuth, async (req, res, next) => {
  try {
    const year = Number.parseInt(req.query.year, 10);
    if (!Number.isInteger(year) || year < 2000 || year > 2100) {
      return res.status(400).json({ error: 'year out of range' });
    }
    const rows = await db.raw(
      `SELECT status, COUNT(*) AS n, SUM(total_cents) AS cents
       FROM invoices
       WHERE YEAR(issued_at) = ${year}
       GROUP BY status`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
