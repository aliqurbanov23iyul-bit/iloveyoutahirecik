import { neon } from '@neondatabase/serverless';

const defaults = {
  instagram_url: 'https://instagram.com/',
  after_music: 'Bunu təsadüfən seçmədim.'
};

function isAdmin(req) {
  const configured = String(process.env.ADMIN_TOKEN || process.env.ADMIN_PASSWORD || '').trim();
  const supplied = String(req.headers.authorization || '')
    .replace(/^Bearer\s+/i, '')
    .trim();

  return configured && supplied === configured;
}

export default async function handler(req, res) {
  if (!process.env.DATABASE_URL) {
    if (req.method === 'GET') return res.json(defaults);
    return res.status(500).json({ error: 'missing_database_url' });
  }

  const sql = neon(process.env.DATABASE_URL);

  await sql`
    CREATE TABLE IF NOT EXISTS tahire_config(
      id INT PRIMARY KEY DEFAULT 1,
      data JSONB NOT NULL DEFAULT '{}'::jsonb,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  if (req.method === 'GET') {
    const rows = await sql`SELECT data FROM tahire_config WHERE id=1`;
    return res.json({ ...defaults, ...(rows[0]?.data || {}) });
  }

  if (req.method === 'POST') {
    if (!isAdmin(req)) {
      return res.status(401).json({ error: 'invalid_token' });
    }

    const data = req.body || {};

    await sql`
      INSERT INTO tahire_config(id, data)
      VALUES(1, ${JSON.stringify(data)}::jsonb)
      ON CONFLICT(id)
      DO UPDATE SET data=EXCLUDED.data, updated_at=NOW()
    `;

    return res.json({ ok: true });
  }

  return res.status(405).end();
}
