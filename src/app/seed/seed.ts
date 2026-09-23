import { Pool } from "pg";
import bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import path from 'path';

import {
  placeholderUsers,
  placeholderCsvUploads,
  placeholderFraudRules,
  placeholderPanelists,
  placeholderPanelistFlags,
} from '../lib/placeholder-data';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  const client = await pool.connect();

  try {
    console.log('Starting database seed...');
    await client.query('BEGIN');

    // 1. Seed Users
    const userMap = new Map<string, number>();
    for (const user of placeholderUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      const res = await client.query(
        `
        INSERT INTO users (full_name, email, password_hash, role)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name
        RETURNING user_id, email;
        `,
        [user.full_name, user.email, hashedPassword, user.role]
      );
      userMap.set(res.rows[0].email, res.rows[0].user_id);
    }
    const adminUserId = userMap.get('admin@example.com')!;

    // 2. Seed CSV Uploads
    const uploadIds: number[] = [];
    for (const upload of placeholderCsvUploads) {
      const res = await client.query(
        `
        INSERT INTO csv_uploads (
          project_name, company_name, upload_year, raw_file_path,
          cleaned_file_path, file_size_bytes, initial_participant_count,
          fraudulent_participant_count, uploaded_by_user_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING upload_id;
        `,
        [
          upload.project_name,
          upload.company_name,
          upload.upload_year,
          upload.raw_file_path,
          upload.cleaned_file_path,
          upload.file_size_bytes,
          upload.initial_participant_count,
          upload.fraudulent_participant_count,
          adminUserId,
        ]
      );
      uploadIds.push(res.rows[0].upload_id);
    }

    // 3. Seed Fraud Rules
    const ruleMap = new Map<string, number>();
    for (const rule of placeholderFraudRules) {
      const res = await client.query(
        `
        INSERT INTO fraud_rules (
          rule_code, rule_name, category, description, risk_score_weight, severity_level, is_active
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (rule_code) DO UPDATE SET rule_name = EXCLUDED.rule_name
        RETURNING rule_id, rule_code;
        `,
        [
          rule.rule_code,
          rule.rule_name,
          rule.category,
          rule.description,
          rule.risk_score_weight,
          rule.severity_level,
          rule.is_active,
        ]
      );
      ruleMap.set(res.rows[0].rule_code, res.rows[0].rule_id);
    }

    // 4. Seed Panelists
    const panelistIds: number[] = [];
    for (const panelist of placeholderPanelists) {
      const res = await client.query(
        `
        INSERT INTO panelists (
          upload_id, reviewed_by_user_id, first_name, last_name, email,
          phone_number, npi_number, specialty, practice_name, street_address,
          city, state, postal_code, ip_address, risk_score, risk_level, review_status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        RETURNING panelist_id;
        `,
        [
          uploadIds[0],
          adminUserId,
          panelist.first_name,
          panelist.last_name,
          panelist.email,
          panelist.phone_number,
          panelist.npi_number,
          panelist.specialty,
          panelist.practice_name,
          panelist.street_address,
          panelist.city,
          panelist.state,
          panelist.postal_code,
          panelist.ip_address,
          panelist.risk_score,
          panelist.risk_level,
          panelist.review_status,
        ]
      );
      panelistIds.push(res.rows[0].panelist_id);
    }

    // 5. Seed Panelist Flags
    for (const flag of placeholderPanelistFlags) {
      const ruleId = ruleMap.get(flag.rule_code);
      if (ruleId) {
        await client.query(
          `
          INSERT INTO panelist_flags (panelist_id, rule_id, explanation)
          VALUES ($1, $2, $3);
          `,
          [panelistIds[0], ruleId, flag.explanation]
        );
      }
    }

    await client.query('COMMIT');
    console.log('Database seeded successfully from placeholder-data!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error during seeding:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

main();