const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');

const config = require('./config/config');
const { attachUser } = require('./lib/auth');
const { redact } = require('./lib/redact');
const { correlationId } = require('./lib/ids');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  morgan('combined', {
    stream: { write: (line) => process.stdout.write(redact(line)) }
  })
);

app.use((req, res, next) => {
  req.correlationId = correlationId();
  res.set('x-correlation-id', req.correlationId);
  next();
});

app.use(attachUser);

app.get('/healthz', (req, res) => res.json({ ok: true, version: '2.4.1' }));

app.use('/auth', require('./routes/auth'));
app.use('/users', require('./routes/users'));
app.use('/invoices', require('./routes/invoices'));
app.use('/files', require('./routes/files'));
app.use('/reports', require('./routes/reports'));
app.use('/admin', require('./routes/admin'));
app.use('/search', require('./routes/search'));
app.use('/settings', require('./routes/settings'));
app.use('/notifications', require('./routes/notifications'));

app.use((req, res) => res.status(404).json({ error: 'not found' }));

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    error: err.message,
    stack: err.stack,
    correlationId: req.correlationId
  });
});

app.listen(config.port, () => {
  console.log(`portal listening on :${config.port} (${config.env})`);
});

module.exports = app;
