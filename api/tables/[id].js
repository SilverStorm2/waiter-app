const fs = require('fs/promises');
const path = require('path');

const TMP_DATA_PATH = '/tmp/db.json';

const resolveDataPath = async () => {
  const candidates = [
    path.join(process.cwd(), 'db.json'),
    path.join(__dirname, '..', '..', 'db.json'),
    path.join(__dirname, '..', '..', '..', 'db.json'),
  ];

  for (const candidate of candidates) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch (_) {
      // keep searching
    }
  }
  throw new Error('db.json not found');
};

const fallbackDb = () => {
  try {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    return require(path.join(__dirname, '..', '..', 'db.json'));
  } catch (_) {
    try {
      // eslint-disable-next-line import/no-dynamic-require, global-require
      return require(path.join(__dirname, '..', '..', '..', 'db.json'));
    } catch (err) {
      console.error('Fallback db.json missing', err);
      return { tables: [] };
    }
  }
};

const loadDb = async () => {
  try {
    const tmp = await fs.readFile(TMP_DATA_PATH, 'utf-8');
    return JSON.parse(tmp);
  } catch (_) {
    try {
      const dataPath = await resolveDataPath();
      const file = await fs.readFile(dataPath, 'utf-8');
      await fs.writeFile(TMP_DATA_PATH, file);
      return JSON.parse(file);
    } catch (err) {
      console.error('Failed to read db.json, using fallback', err);
      return fallbackDb();
    }
  }
};

const saveDb = db => fs.writeFile(TMP_DATA_PATH, JSON.stringify(db, null, 2));

const parseBody = req =>
  new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => {
      data += chunk;
    });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });

module.exports = async (req, res) => {
  const {
    query: { id },
  } = req;

  try {
    const db = await loadDb();
    const tableIndex = (db.tables || []).findIndex(table => String(table.id) === String(id));

    if (tableIndex === -1) {
      return res.status(404).json({ error: 'Table not found' });
    }

    if (req.method === 'GET') {
      return res.status(200).json(db.tables[tableIndex]);
    }

    if (req.method === 'PATCH') {
      const body = await parseBody(req);
      const updated = { ...db.tables[tableIndex], ...body };
      db.tables[tableIndex] = updated;
      await saveDb(db);
      return res.status(200).json(updated);
    }

    res.setHeader('Allow', 'GET, PATCH');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Failed to handle table request', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
