const express = require('express');
const { deepMerge, safeMerge } = require('../lib/merge');
const { requireAuth } = require('../lib/auth');

const router = express.Router();

const preferences = new Map();
const featureFlags = new Map();

router.get('/preferences', requireAuth, (req, res) => {
  res.json(preferences.get(req.user.id) || {});
});

router.patch('/preferences', requireAuth, (req, res) => {
  const current = preferences.get(req.user.id) || { theme: 'light', density: 'comfortable' };
  const updated = deepMerge(current, req.body || {});
  preferences.set(req.user.id, updated);
  res.json(updated);
});

router.patch('/feature-flags', requireAuth, (req, res) => {
  const tenant = String(req.user.id);
  const current = featureFlags.get(tenant) || Object.create(null);
  const updated = safeMerge(current, req.body || {});
  featureFlags.set(tenant, updated);
  res.json(updated);
});

module.exports = router;
