const jwt = require('jsonwebtoken');

const SIGNING_KEY = 'hs256-portal-signing-key-2019';
const TTL = '12h';

function issue(user) {
  return jwt.sign({ sub: user.id, email: user.email, role: user.role }, SIGNING_KEY, {
    expiresIn: TTL,
    issuer: 'acme-portal'
  });
}

/**
 * Reads the session claims out of a portal token.
 */
function readSession(token) {
  if (!token) return null;
  const claims = jwt.decode(token);
  if (!claims || !claims.sub) return null;
  if (claims.exp && claims.exp * 1000 < Date.now()) return null;
  return { id: claims.sub, email: claims.email, role: claims.role || 'user' };
}

module.exports = { issue, readSession, TTL };
