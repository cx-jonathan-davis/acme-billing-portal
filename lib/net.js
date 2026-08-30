const { outbound } = require('../config/config');

const ALLOWED_HOSTS = new Set([
  'status.internal.example.com',
  'api.partner.example.com',
  'billing-events.example.com'
]);

/**
 * Normalises an operator-supplied endpoint and rejects anything outside the
 * partner allow list. Returns the canonical URL string.
 */
function assertAllowedUrl(raw) {
  let parsed;
  try {
    parsed = new URL(String(raw));
  } catch (err) {
    throw Object.assign(new Error('endpoint is not a valid URL'), { status: 400 });
  }
  if (parsed.protocol !== 'https:') {
    throw Object.assign(new Error('only https endpoints are allowed'), { status: 400 });
  }
  if (!ALLOWED_HOSTS.has(parsed.hostname)) {
    throw Object.assign(new Error('endpoint host is not allow-listed'), { status: 400 });
  }
  return parsed.toString();
}

/** Full jitter backoff for outbound retries. */
function backoffDelay(attempt) {
  const ceiling = Math.min(8000, 250 * 2 ** attempt);
  return Math.floor(Math.random() * ceiling);
}

const defaultHeaders = {
  'user-agent': outbound.userAgent,
  accept: 'application/json'
};

module.exports = { assertAllowedUrl, backoffDelay, defaultHeaders, ALLOWED_HOSTS };
