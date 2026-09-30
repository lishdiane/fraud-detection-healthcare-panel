import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('neon.tech')
    ? { rejectUnauthorized: false }
    : false,
});

async function runMigration() {
  const client = await pool.connect();
  try {
    console.log('Running database schema updates...');
    await client.query('BEGIN');

    // Add geolocation columns
    await client.query(`
      ALTER TABLE panelists 
      ADD COLUMN IF NOT EXISTS ip_latitude NUMERIC(9,6),
      ADD COLUMN IF NOT EXISTS ip_longitude NUMERIC(9,6),
      ADD COLUMN IF NOT EXISTS ip_city VARCHAR(100),
      ADD COLUMN IF NOT EXISTS ip_state VARCHAR(50),
      ADD COLUMN IF NOT EXISTS ip_country VARCHAR(100),
      ADD COLUMN IF NOT EXISTS is_proxy_or_vpn BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS distance_to_practice_miles NUMERIC(8,2);
    `);

    // Insert location fraud rules
    await client.query(`
      INSERT INTO fraud_rules (rule_code, rule_name, category, description, risk_score_weight, severity_level)
      VALUES 
      ('LOCATION_MISMATCH', 'State/City Location Mismatch', 'location', 'IP location is > 300 miles from reported practice address.', 25.00, 'high'),
      ('FOREIGN_IP', 'International IP Address', 'location', 'IP location country does not match reported practice country.', 50.00, 'critical'),
      ('PROXY_VPN_DETECTED', 'Anonymous Proxy/VPN IP', 'ip_address', 'IP address belongs to a known VPN, proxy, or data center node.', 35.00, 'high')
      ON CONFLICT (rule_code) DO NOTHING;
    `);

    await client.query('COMMIT');
    console.log('Migration completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();