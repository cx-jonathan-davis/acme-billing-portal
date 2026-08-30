const express = require('express');
const { renderEmail } = require('../lib/render');
const { requireAuth } = require('../lib/auth');

const router = express.Router();

router.post('/preview', requireAuth, (req, res) => {
  const { template, data } = req.body || {};
  try {
    res.type('html').send(renderEmail(String(template), data || {}));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
