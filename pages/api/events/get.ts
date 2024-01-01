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
    let whereClause = '';
    const keys = Object.keys(req.query);
    if (keys.length > 0) {
      whereClause = ' WHERE ';
      for (let i = 0; i < keys.length; i++) {
        let key = keys[i];
        let value = req.query[key];
        if (i > 0) {
          whereClause += ' AND ';
        }
        let operator = '=';
        if (key === 'start_time') {
          operator = '>=';
        } else if (key === 'end_time') {
          operator = '<=';
        } else {
          value = '\'' + value + '\'';
        }
        
        whereClause += `${key} ${operator} ${value}`;
        
      }
    }
    const result = await client.query('SELECT start_time, end_time, title, color from public.events' + whereClause);
    const items = result.rows;

    res.status(200).json(items);
    client.release();
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
    console.error(err);
  }
}
