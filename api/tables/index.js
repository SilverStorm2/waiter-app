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

const loadDb = async () => {
  try {
    const tmp = await fs.readFile(TMP_DATA_PATH, 'utf-8');
    return JSON.parse(tmp);
  } catch (_) {
    const dataPath = await resolveDataPath();
    const file = await fs.readFile(dataPath, 'utf-8');
    await fs.writeFile(TMP_DATA_PATH, file); // seed /tmp for ephemeral writes
    return JSON.parse(file);
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
