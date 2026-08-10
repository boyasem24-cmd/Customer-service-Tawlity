// Dependency-free JSON-file storage. Each "table" is a flat array in its own file
// under data/. Writes are serialized per-file with an in-memory promise chain so
// concurrent requests don't clobber each other with a torn read-modify-write.

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const writeQueues = new Map();

function filePath(name) {
  return path.join(DATA_DIR, `${name}.json`);
}

function readTable(name) {
  const file = filePath(name);
  if (!fs.existsSync(file)) return [];
  const raw = fs.readFileSync(file, 'utf8').trim();
  if (!raw) return [];
  return JSON.parse(raw);
}

// Queues writes to `name` so overlapping calls apply in order instead of racing.
function writeTable(name, rows) {
  const prev = writeQueues.get(name) || Promise.resolve();
  const next = prev
    .catch(() => {}) // don't let one failed write jam the queue forever
    .then(() => fs.promises.writeFile(filePath(name), JSON.stringify(rows, null, 2)));
  writeQueues.set(name, next);
  return next;
}

// Reads the table, lets `mutate` change the array in place (or return a new one),
// then persists the result. Callers should keep `mutate` synchronous.
async function withTable(name, mutate) {
  const prev = writeQueues.get(name) || Promise.resolve();
  let result;
  const next = prev
    .catch(() => {})
    .then(async () => {
      const rows = readTable(name);
      result = mutate(rows) || rows;
      await fs.promises.writeFile(filePath(name), JSON.stringify(result, null, 2));
    });
  writeQueues.set(name, next);
  await next;
  return result;
}

module.exports = { readTable, writeTable, withTable };
