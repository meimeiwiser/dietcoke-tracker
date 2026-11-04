const form = document.getElementById('entry-form');
const list = document.getElementById('entries');
const weekly = document.getElementById('weekly');

async function loadWeekly() {
  const res = await fetch('/api/stats/weekly');
  const weeks = await res.json();
  const max = Math.max(1, ...weeks.map(w => w.cans));

  weekly.innerHTML = '';
  for (const w of weeks) {
    const li = document.createElement('li');

    const label = document.createElement('div');
    label.className = 'meta';
    label.textContent = `Week of ${w.week_start}: ${w.cans} can${w.cans === 1 ? '' : 's'}`;

    const bar = document.createElement('div');
    bar.style.cssText = `height:8px;border-radius:4px;background:#e5242b;width:${(w.cans / max) * 100}%`;

    li.append(label, bar);
    weekly.append(li);
  }
}

function setDefaultTime() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  document.getElementById('consumed_at').value = now.toISOString().slice(0, 16);
}

async function loadEntries() {
  const res = await fetch('/api/entries');
  const entries = await res.json();

  list.innerHTML = '';
  for (const e of entries) {
    const li = document.createElement('li');

    const when = new Date(e.consumed_at).toLocaleString([], {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
    const stars = e.rating ? '★'.repeat(e.rating) : '';

    const top = document.createElement('div');
    top.className = 'top';
    top.textContent = `${e.variety} ${stars}`;

    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = [when, e.location].filter(Boolean).join(' · ');

    const notes = document.createElement('div');
    notes.className = 'notes';
    notes.textContent = e.notes || '';

    const del = document.createElement('button');
    del.className = 'delete';
    del.textContent = 'Delete';
    del.addEventListener('click', async () => {
      await fetch(`/api/entries/${e.id}`, { method: 'DELETE' });
      loadEntries();
      loadWeekly();
    });

    li.append(top, meta, notes, del);
    list.append(li);
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const entry = {
    consumed_at: document.getElementById('consumed_at').value,
    variety: document.getElementById('variety').value,
    location: document.getElementById('location').value,
    notes: document.getElementById('notes').value,
    rating: document.getElementById('rating').value
      ? Number(document.getElementById('rating').value)
      : null,
  };

  await fetch('/api/entries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  });

  form.reset();
  setDefaultTime();
  loadEntries();
  loadWeekly();
});

setDefaultTime();
loadEntries();
loadWeekly();