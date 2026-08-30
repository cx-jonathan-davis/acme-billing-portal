const { readSession } = require('./tokens');

function attachUser(req, res, next) {
  const header = req.get('authorization') || '';
  const bearer = header.startsWith('Bearer ') ? header.slice(7) : null;
  req.user = readSession(bearer || req.cookies?.portal_session);
  next();
}

function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'authentication required' });
  next();
}

function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'authentication required' });
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'admin role required' });
  next();
}

module.exports = { attachUser, requireAuth, requireAdmin };
