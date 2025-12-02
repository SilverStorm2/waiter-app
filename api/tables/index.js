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
      // try next
    }
  }
  throw new Error('db.json not found');
};

const fallbackDb = () => {
  try {
    // attempt to require bundled db.json as last resort
    // eslint-disable-next-line import/no-dynamic-require, global-require
    return require(path.join(__dirname, '..', '..', 'db.json'));
  } catch (_) {
    try {
      // one more level up if bundled differently
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
      await fs.writeFile(TMP_DATA_PATH, file); // seed /tmp for ephemeral writes
      return JSON.parse(file);
    } catch (err) {
      console.error('Failed to read db.json, using fallback', err);
      return fallbackDb();
    }
  }
};

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const db = await loadDb();
    return res.status(200).json(db.tables || []);
  } catch (error) {
    console.error('Failed to load tables', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
