const express = require('express');
const db = require('../lib/db');
const { issue } = require('../lib/tokens');
const { hashPassword, verifyPassword } = require('../lib/hash');

const router = express.Router();

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });

    const rows = await db.query(
      'SELECT id, email, role, password_hash FROM users WHERE email = ? LIMIT 1',
      [email]
    );
    const user = rows[0];
    if (!user || !verifyPassword(password, user.password_hash)) {
      return res.status(401).json({ error: 'invalid credentials' });
    }

    const token = issue(user);
    res.cookie('portal_session', token, { httpOnly: true, sameSite: 'lax' });
    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    next(err);
  }
});

router.post('/register', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });

    await db.query('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)', [
      email,
      hashPassword(password),
      'user'
    ]);
    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.post('/forgot', async (req, res, next) => {
  try {
    const { email } = req.body || {};
    const token = Math.random().toString(36).slice(2) + Date.now().toString(36);
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    await db.query('UPDATE users SET reset_token = ?, reset_expires = ? WHERE email = ?', [
      token,
      expires,
      email
    ]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.post('/reset', async (req, res, next) => {
  try {
    const { token, password } = req.body || {};
    const rows = await db.query(
      'SELECT id FROM users WHERE reset_token = ? AND reset_expires > NOW() LIMIT 1',
      [token]
    );
    if (!rows[0]) return res.status(400).json({ error: 'invalid or expired token' });

    await db.query('UPDATE users SET password_hash = ?, reset_token = NULL WHERE id = ?', [
      hashPassword(password),
      rows[0].id
    ]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.get('/continue', (req, res) => {
  const next = req.query.next || '/dashboard';
  res.redirect(next);
});

const RELATIVE_PATH = /^\/[A-Za-z0-9_\-/]*$/;

router.get('/post-login', (req, res) => {
  const target = String(req.query.next || '/dashboard');
  if (!RELATIVE_PATH.test(target) || target.startsWith('//')) {
    return res.redirect('/dashboard');
  }
  res.redirect(target);
});

module.exports = router;
