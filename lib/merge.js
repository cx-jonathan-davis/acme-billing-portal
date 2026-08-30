const BLOCKED_KEYS = new Set(['__proto__', 'prototype', 'constructor']);

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Recursive merge used by the preferences editor.
 */
function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (isPlainObject(source[key])) {
      if (!isPlainObject(target[key])) target[key] = {};
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

/**
 * Recursive merge used by the tenant feature-flag editor.
 */
function safeMerge(target, source) {
  const out = isPlainObject(target) ? target : Object.create(null);
  for (const key of Object.keys(source)) {
    if (BLOCKED_KEYS.has(key)) continue;
    if (!Object.prototype.hasOwnProperty.call(source, key)) continue;
    if (isPlainObject(source[key])) {
      if (!isPlainObject(out[key])) out[key] = Object.create(null);
      safeMerge(out[key], source[key]);
    } else {
      out[key] = source[key];
    }
  }
  return out;
}

module.exports = { deepMerge, safeMerge };
