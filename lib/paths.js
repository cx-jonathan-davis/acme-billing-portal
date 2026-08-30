const path = require('path');

/**
 * Resolves userPath under baseDir, returning null when the result escapes it.
 */
function resolveWithin(baseDir, userPath) {
  const base = path.resolve(baseDir);
  const target = path.resolve(base, String(userPath || ''));
  if (target !== base && !target.startsWith(base + path.sep)) return null;
  return target;
}

module.exports = { resolveWithin };
