import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

// Check if running in production or connecting to a cloud provider like Neon
const isProduction = process.env.NODE_ENV === 'production';
const isCloudDatabase = connectionString?.includes('neon.tech');

declare global {
  var postgresPool: Pool | undefined;
}

let pool: Pool;

if (isProduction) {
  pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: true },
  });
} else {
  // Reuse global pool in development to prevent hot-reload from exhausting connections
  if (!global.postgresPool) {
    global.postgresPool = new Pool({
      connectionString,
      ssl: isCloudDatabase ? { rejectUnauthorized: true } : false,
    });
  }
  pool = global.postgresPool;
}

export default pool;