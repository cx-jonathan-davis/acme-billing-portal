const path = require('path');

const root = path.join(__dirname, '..');

module.exports = {
  port: Number(process.env.PORT || 3000),
  env: process.env.NODE_ENV || 'development',

  storage: {
    uploadDir: path.join(root, 'storage', 'uploads'),
    reportDir: path.join(root, 'storage', 'reports')
  },

  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'portal',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'portal'
  },

  outbound: {
    timeoutMs: 3000,
    userAgent: 'acme-portal/2.4.1'
  }
};
