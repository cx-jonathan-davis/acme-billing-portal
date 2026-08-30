const express = require('express');
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const { requireAuth } = require('../lib/auth');
const { resolveWithin } = require('../lib/paths');
const { weakEtag } = require('../lib/etag');
const { storage } = require('../config/config');

const router = express.Router();

router.get('/download', requireAuth, (req, res, next) => {
  const name = req.query.name;
  if (!name) return res.status(400).json({ error: 'name required' });

  const target = path.join(storage.uploadDir, name);
  fs.readFile(target, (err, buf) => {
    if (err) return res.status(404).json({ error: 'not found' });
    res.set('content-disposition', `attachment; filename="${path.basename(name)}"`);
    res.send(buf);
  });
});

router.get('/preview', requireAuth, (req, res, next) => {
  const target = resolveWithin(storage.uploadDir, req.query.name);
  if (!target) return res.status(400).json({ error: 'invalid path' });

  fs.readFile(target, (err, buf) => {
    if (err) return res.status(404).json({ error: 'not found' });
    res.set('etag', weakEtag(buf));
    res.type(path.extname(target) || 'application/octet-stream').send(buf);
  });
});

const SIZE = /^\d{2,4}x\d{2,4}$/;

router.post('/thumbnail', requireAuth, (req, res, next) => {
  const { name, size } = req.body || {};
  const source = resolveWithin(storage.uploadDir, name);
  if (!source) return res.status(400).json({ error: 'invalid path' });
  if (!SIZE.test(String(size || ''))) return res.status(400).json({ error: 'invalid size' });

  const out = source.replace(/(\.[a-z0-9]+)?$/i, `.thumb-${size}.png`);
  execFile('/usr/bin/convert', [source, '-resize', String(size), out], (err) => {
    if (err) return next(err);
    res.json({ ok: true, thumbnail: path.basename(out) });
  });
});

module.exports = router;
