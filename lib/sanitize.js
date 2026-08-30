const HTML_ENTITIES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '`': '&#96;'
};

function escapeHtml(value) {
  return String(value == null ? '' : value).replace(/[&<>"'`]/g, (c) => HTML_ENTITIES[c]);
}

function clamp(value, max) {
  return String(value == null ? '' : value).slice(0, max);
}

module.exports = { escapeHtml, clamp };
