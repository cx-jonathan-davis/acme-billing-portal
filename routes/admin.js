const express = require('express');
const { exec } = require('child_process');
const axios = require('axios');
const yaml = require('js-yaml');
const { requireAdmin } = require('../lib/auth');
const { assertAllowedUrl, defaultHeaders } = require('../lib/net');
const { outbound, storage } = require('../config/config');

const router = express.Router();

router.post('/fetch-config', requireAdmin, async (req, res, next) => {
  try {
    const { url } = req.body || {};
    if (!url) return res.status(400).json({ error: 'url required' });

    const response = await axios.get(url, {
      headers: defaultHeaders,
      timeout: outbound.timeoutMs
    });
    res.json({ status: response.status, body: response.data });
  } catch (err) {
    next(err);
  }
});

router.get('/partner-status', requireAdmin, async (req, res, next) => {
  try {
    const url = assertAllowedUrl(req.query.endpoint);
    const response = await axios.get(url, {
      headers: defaultHeaders,
      timeout: outbound.timeoutMs,
      maxRedirects: 0
    });
    res.json({ status: response.status, body: response.data });
  } catch (err) {
    if (err.status === 400) return res.status(400).json({ error: err.message });
    next(err);
  }
});

router.get('/disk', requireAdmin, (req, res, next) => {
  exec(`du -sh ${storage.reportDir} ${storage.uploadDir}`, { timeout: 5000 }, (err, stdout) => {
    if (err) return next(err);
    res.type('text/plain').send(stdout);
  });
});

router.post('/feature-config', requireAdmin, express.text({ type: '*/*' }), (req, res, next) => {
  try {
    const parsed = yaml.load(req.body || '');
    if (typeof parsed !== 'object' || parsed === null) {
      return res.status(400).json({ error: 'expected a mapping' });
    }
    res.json({ ok: true, keys: Object.keys(parsed) });
  } catch (err) {
    res.status(400).json({ error: 'invalid yaml' });
  }
});

module.exports = router;
