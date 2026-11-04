const express = require('express');
const db = require('./db');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public'));

// GET /api/entries - list all entries, newest first
app.get('/api/entries', (req, res) => {
  const rows = db.prepare('SELECT * FROM entries ORDER BY consumed_at DESC').all();
  res.json(rows);
});

// GET /api/stats/weekly - cans per week, newest week first
app.get('/api/stats/weekly', (req, res) => {
  const rows = db.prepare(`
    SELECT date(consumed_at, 'weekday 0', '-6 days') AS week_start,
           COUNT(*) AS cans
    FROM entries
    GROUP BY week_start
    ORDER BY week_start DESC
  `).all();
  res.json(rows);
});

// POST /api/entries - add a new entry
app.post('/api/entries', (req, res) => {
  const { consumed_at, variety, location, notes, rating } = req.body;

  if (!consumed_at || !variety) {
    return res.status(400).json({ error: 'consumed_at and variety are required' });
  }

  const result = db.prepare(`
    INSERT INTO entries (consumed_at, variety, location, notes, rating)
    VALUES (?, ?, ?, ?, ?)
  `).run(consumed_at, variety, location || null, notes || null, rating || null);

  const created = db.prepare('SELECT * FROM entries WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(created);
});

// DELETE /api/entries/:id - remove an entry
app.delete('/api/entries/:id', (req, res) => {
  const result = db.prepare('DELETE FROM entries WHERE id = ?').run(req.params.id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Entry not found' });
  }
  res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});