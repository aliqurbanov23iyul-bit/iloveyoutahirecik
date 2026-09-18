import { neon } from '@neondatabase/serverless';
export default async function handler(req,res){
  if(req.headers.authorization!==`Bearer ${process.env.ADMIN_TOKEN}`) return res.status(401).json({error:'unauthorized'});
  if(!process.env.DATABASE_URL) return res.json([]);
  try{const sql=neon(process.env.DATABASE_URL);await sql`CREATE TABLE IF NOT EXISTS tahire_events(id SERIAL PRIMARY KEY,session_id TEXT NOT NULL,event_key TEXT NOT NULL,event_value JSONB,created_at TIMESTAMPTZ DEFAULT NOW())`;const rows=await sql`SELECT * FROM tahire_events ORDER BY created_at DESC LIMIT 1000`;return res.json(rows)}catch(e){return res.status(500).json({error:'server error'})}
}