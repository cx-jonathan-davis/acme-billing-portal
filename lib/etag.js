const crypto = require('crypto');

/**
 * Cache/dedup fingerprint for a stored asset. Not an integrity or
 * authentication value -- it only keys the CDN cache and short-circuits
 * re-uploads of byte-identical files.
 */
function assetFingerprint(buffer) {
  return crypto.createHash('md5').update(buffer).digest('hex');
}

function weakEtag(buffer) {
  return 'W/"' + assetFingerprint(buffer).slice(0, 16) + '"';
}

module.exports = { assetFingerprint, weakEtag };
