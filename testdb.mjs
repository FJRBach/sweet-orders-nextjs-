import pg from 'pg';
import dotenv from 'dotenv';

// Carga las variables desde tu archivo .env.local
dotenv.config({ path: '.env.local' });

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL;

async function verifyConnection() {
  if (!connectionString) {
    console.error("❌ Error: La variable de entorno DATABASE_URL no está definida en tu archivo .env.local.");
    return;
  }

  console.log("Intentando conectar a la base de datos de Neon...");

  const pool = new Pool({ connectionString });
  const client = await pool.connect();

  try {
    const result = await client.query('SELECT NOW()');
    console.log("✅ ¡Conexión exitosa!");
    console.log("   Hora actual de la base de datos:", result.rows[0].now);
  } catch (error) {
    console.error("❌ Falló la conexión a la base de datos:", error.message);
  } finally {
    // Cierra la conexión para que el script finalice
    await client.release();
    await pool.end();
  }
}

verifyConnection();