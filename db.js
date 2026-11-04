const Database = require('better-sqlite3');

const db = new Database('dietcoke.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS entries (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    consumed_at TEXT NOT NULL,
    variety     TEXT NOT NULL,
    location    TEXT,
    notes       TEXT,
    rating      INTEGER
  )
`);

module.exports = db;