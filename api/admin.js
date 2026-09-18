import { neon } from '@neondatabase/serverless';

function getAuth(req) {
  const configured = String(process.env.ADMIN_TOKEN || process.env.ADMIN_PASSWORD || '').trim();
  const supplied = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
  if (!configured) return { ok: false, reason: 'missing_admin_token' };
  return { ok: supplied === configured, reason: supplied === configured ? null : 'invalid_token' };
}

export default async function handler(req, res) {
  const auth = getAuth(req);
  if (!auth.ok) return res.status(auth.reason === 'missing_admin_token' ? 500 : 401).json({ error: auth.reason });
  if (!process.env.DATABASE_URL) return res.status(500).json({ error: 'missing_database_url' });

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

    if (req.method === 'GET') {
      const rows = await sql`SELECT * FROM tahire_events ORDER BY created_at DESC LIMIT 1000`;
      return res.json(rows);
    }

    if (req.method === 'DELETE') {
      const id = Number(req.query?.id || 0);
      const sessionId = String(req.query?.session_id || '').trim();

      if (id > 0) {
        await sql`DELETE FROM tahire_events WHERE id = ${id}`;
        return res.json({ ok: true, deleted: 'event' });
      }

      if (sessionId) {
        await sql`DELETE FROM tahire_events WHERE session_id = ${sessionId}`;
        return res.json({ ok: true, deleted: 'session' });
      }

      await sql`DELETE FROM tahire_events`;
      return res.json({ ok: true, deleted: 'all' });
    }

    return res.status(405).json({ error: 'method_not_allowed' });
  } catch (error) {
    console.error('admin api error', error);
    return res.status(500).json({ error: 'server_error' });
  }
}
