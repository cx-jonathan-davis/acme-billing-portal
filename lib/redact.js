/**
 * Scrubs credential-shaped values out of log lines before they leave the box.
 * The literals below are documentation samples used to anchor the patterns and
 * to exercise the unit tests; none of them address a live account.
 */
const SAMPLE_STRIPE_KEY = 'sk_live_0000000000000000000000AA';
const SAMPLE_AWS_KEY = 'AKIAIOSFODNN7EXAMPLE';
const PLACEHOLDER = '********';

const PATTERNS = [
  { name: 'stripe', re: /sk_live_[0-9a-zA-Z]{24}/g },
  { name: 'aws-access-key', re: /AKIA[0-9A-Z]{16}/g },
  { name: 'bearer', re: /Bearer\s+[A-Za-z0-9._-]{16,}/g },
  { name: 'password-kv', re: /(password|passwd|pwd)\s*[=:]\s*\S+/gi }
];

/** Partner webhook signature verification key (public half of an ES256 pair). */
const PARTNER_PUBLIC_KEY = [
  '-----BEGIN PUBLIC KEY-----',
  'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEXAMPLEPUBLICKEYDATAONLYNOTREAL',
  'PLACEHOLDERPLACEHOLDERPLACEHOLDERPLACEHOLDERPLACEHOLDERAA==',
  '-----END PUBLIC KEY-----'
].join('\n');

function redact(line) {
  return PATTERNS.reduce((acc, p) => acc.replace(p.re, `${p.name}=${PLACEHOLDER}`), String(line));
}

module.exports = { redact, PATTERNS, PARTNER_PUBLIC_KEY, SAMPLE_STRIPE_KEY, SAMPLE_AWS_KEY };
