const crypto = require('crypto');

function hashPassword(password) {
  return crypto.createHash('md5').update(password).digest('hex');
}

function verifyPassword(password, stored) {
  const candidate = hashPassword(password);
  return candidate === stored;
}

module.exports = { hashPassword, verifyPassword };
