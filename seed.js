const db = require('./db');

const insert = db.prepare(`
  INSERT INTO entries (consumed_at, variety, location, notes, rating)
  VALUES (?, ?, ?, ?, ?)
`);

insert.run('2026-10-29T09:15', 'Classic', 'Home', 'Morning ritual', 4);
insert.run('2026-10-30T13:40', 'Cherry', 'Office', 'Vending machine find', 5);
insert.run('2026-10-31T16:05', 'Ginger Lime', 'Cafe', 'Surprisingly good', 3);

const rows = db.prepare('SELECT * FROM entries ORDER BY consumed_at DESC').all();
console.log(rows);