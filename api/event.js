import { neon } from '@neondatabase/serverless';
export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'method'});
  try{const {session,key,value}=req.body||{}; if(!session||!key) return res.status(400).json({error:'bad request'});
    if(!process.env.DATABASE_URL) return res.status(200).json({ok:true,demo:true});
    const sql=neon(process.env.DATABASE_URL);
    await sql`CREATE TABLE IF NOT EXISTS tahire_events(id SERIAL PRIMARY KEY,session_id TEXT NOT NULL,event_key TEXT NOT NULL,event_value JSONB,created_at TIMESTAMPTZ DEFAULT NOW())`;
    await sql`INSERT INTO tahire_events(session_id,event_key,event_value) VALUES(${session},${key},${JSON.stringify(value)}::jsonb)`;
    return res.json({ok:true});
  }catch(e){return res.status(500).json({error:'server error'})}
}