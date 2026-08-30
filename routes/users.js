const express = require('express');
const _ = require('lodash');
const db = require('../lib/db');
const { requireAuth } = require('../lib/auth');

const router = express.Router();

const SORTABLE_COLUMNS = {
  name: 'u.name',
  email: 'u.email',
  created: 'u.created_at',
  team: 'u.team_name'
};

function resolveSortColumn(key) {
  return SORTABLE_COLUMNS[key] || SORTABLE_COLUMNS.name;
}

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const column = resolveSortColumn(req.query.sort);
    const direction = req.query.dir === 'desc' ? 'DESC' : 'ASC';
    const rows = await db.raw(
      `SELECT u.id, u.name, u.email, u.team_name FROM users u ORDER BY ${column} ${direction} LIMIT 100`
    );
    res.json(rows.map((r) => _.pick(r, ['id', 'name', 'email', 'team_name'])));
  } catch (err) {
    next(err);
  }
});

router.get('/search', requireAuth, async (req, res, next) => {
  try {
    const q = req.query.q || '';
    const rows = await db.raw(
      `SELECT id, name, email FROM users WHERE name LIKE '%${q}%' OR email LIKE '%${q}%' LIMIT 50`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/:id/card', requireAuth, async (req, res, next) => {
  try {
    const rows = await db.query(
      'SELECT id, name, email, bio, team_name FROM users WHERE id = ? LIMIT 1',
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).send('not found');
    res.render('card', { user: rows[0] });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
