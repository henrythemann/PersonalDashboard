import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // If using SSL connection (e.g., when connecting to a cloud database in production):
  // ssl: {
  //   rejectUnauthorized: false,
  // },
});

export default async function handler(req: any, res: any) {
  try {
    const client = await pool.connect();
    if (req.query.start_time === undefined || req.query.end_time === undefined || req.query.title === undefined || req.query.start_time === null || req.query.end_time === null || req.query.title === null || req.query.title === '' || req.query.start_time > req.query.end_time ) {
      return res.status(400).json({ error: 'Invalid query parameters' });
    }
    const result = await client.query('INSERT INTO public.events (start_time, end_time, title) VALUES ($1, $2, $3)', [req.query.start_time, req.query.end_time, req.query.title]);
    const items = result.rows;
    res.status(200).json(items);
    client.release();
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
    console.error(err);
  }
}
