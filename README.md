# ACME Billing Portal

Internal Express service for invoices, uploaded documents and tenant settings.

## Running

```
npm install
DB_HOST=127.0.0.1 DB_USER=portal DB_PASSWORD=... npm start
```

The API boots without a reachable database; routes that touch MySQL will return
500 until `schema.sql` has been applied.

## Layout

- `server.js` – app wiring and middleware
- `config/` – runtime configuration
- `lib/` – database access, auth, hashing, path/URL helpers
- `routes/` – HTTP surface
- `views/` – EJS templates

## Note

This service is used as a target for static analysis and code review exercises.
Do not deploy it.
