/**
 * Non-security identifiers: log correlation and client-side list keys.
 */
function correlationId() {
  return 'req_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

function rowKey(prefix) {
  return prefix + '-' + Math.floor(Math.random() * 1e6);
}

module.exports = { correlationId, rowKey };
