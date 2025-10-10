// lib/db.ts
import { Pool } from 'pg';

// Declaramos una variable global para cachear la conexión.
// Esto es clave para el rendimiento en entornos serverless como Vercel.
let conn: Pool | undefined;

if (!conn) {
  conn = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
}

export const executeQuery = async (query: string, params: any[] = []) => {
  try {
    const result = await conn!.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('Database Query Error:', error);
    throw new Error('Failed to execute database query.');
  }
};