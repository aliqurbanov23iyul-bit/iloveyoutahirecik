import { neon } from '@neondatabase/serverless';

function isAdmin(req) {
  const configured = String(process.env.ADMIN_TOKEN || process.env.ADMIN_PASSWORD || '').trim();
  const header = String(req.headers.authorization || '');
  const supplied = header.replace(/^Bearer\s+/i, '').trim();

  if (!configured) return { ok: false, reason: 'missing_admin_token' };
  return { ok: supplied === configured, reason: supplied === configured ? null : 'invalid_token' };
}

export default async function handler(req, res) {
  const auth = isAdmin(req);

  if (!auth.ok) {
    return res.status(auth.reason === 'missing_admin_token' ? 500 : 401).json({
      error: auth.reason
    });
  }

  if (!process.env.DATABASE_URL) {
    return res.status(500).json({ error: 'missing_database_url' });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);

    await sql`
      CREATE TABLE IF NOT EXISTS tahire_events(
        id SERIAL PRIMARY KEY,
        session_id TEXT NOT NULL,
        event_key TEXT NOT NULL,
        event_value JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    const rows = await sql`
      SELECT *
      FROM tahire_events
      ORDER BY created_at DESC
      LIMIT 1000
    `;

    return res.json(rows);
  } catch (error) {
    console.error('admin api error', error);
    return res.status(500).json({ error: 'server_error' });
  }
}
