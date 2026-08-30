const { escapeHtml } = require('./sanitize');

/**
 * Tiny compiled-template helper for the two transactional emails we send.
 * The template bodies are module constants; caller data arrives as an
 * argument to the compiled function, never as part of its source.
 */
const TEMPLATES = {
  invoiceReady:
    'return "<p>Hello " + esc(d.name) + ", invoice " + esc(d.invoiceId) + " is ready.</p>";',
  paymentFailed:
    'return "<p>Hello " + esc(d.name) + ", we could not charge card ending " + esc(d.last4) + ".</p>";'
};

const compiled = Object.fromEntries(
  Object.entries(TEMPLATES).map(([name, body]) => [name, new Function('d', 'esc', body)])
);

function renderEmail(name, data) {
  const fn = compiled[name];
  if (!fn) throw new Error('unknown template: ' + name);
  return fn(data, escapeHtml);
}

module.exports = { renderEmail, TEMPLATES };
