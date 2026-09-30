import pool from './db';
import { evaluatePanelistLocation } from './geo';

interface PanelistRecord {
  panelist_id: number;
  ip_address: string;
  postal_code?: string;
  city?: string;
  state?: string;
  
}

/**
 * Fetches pending panelists from DB, runs geolocation checks, 
 * updates geolocation fields, and records fraud flags.
 */

export async function processPanelistGeolocation(limit: number = 50) {
    const client = await pool.connect();
    let processedCount = 0;

    try {
      await client.query('BEGIN')
        // 1. Fetch panelists who haven't had their IP evaluated yet
        const { rows: panelists } = await client.query<PanelistRecord>(`
          SELECT *
          FROM panelists
          WHERE ip_latitude IS NULL AND ip_address IS NOT NULL
          LIMIT $1
        `, [limit]);
        
        if (panelists.length === 0) {
            console.log('No pending panelists to evaluate.');
            return {processed: 0};

        }

        console.log(`Processing ${panelists.length} panelists for geolocation...`);

        for (const panelist of panelists) {
          // Evaluate IP location against practice postal code using ipgeolocation.io
          // console.log(`Processing panelist ${panelist.panelist_id}`);
          const evaluation = await evaluatePanelistLocation(
            panelist.ip_address,
            panelist.postal_code,
            'United States'
          );

          // Skip database updates id the IP lookup failed completely
          if (evaluation.ip_longitude === undefined) continue;

          // Begin DB Transaction to update record and attach flags
          await client.query('BEGIN');

          // Update Panelist Geolocation Attributes
          await client.query(`
            UPDATE panelists
            SET 
              ip_latitude = $1,
              ip_longitude = $2,
              ip_city = $3,
              ip_state = $4,
              ip_country = $5,
              is_proxy_or_vpn = $6,
              distance_to_practice_miles = $7
            WHERE panelist_id = $8
          `, [
            evaluation.ip_latitude,
            evaluation.ip_longitude,
            evaluation.ip_city,
            evaluation.ip_state,
            evaluation.ip_country,
            evaluation.is_proxy_or_vpn,
            evaluation.distance_to_practice_miles ?? null,
            panelist.panelist_id
          ]);

          // Insert triggered flags into panelist_flags
          for (const flag of evaluation.flags_to_raise) {
            await client.query(`
              INSERT INTO panelist_flags (panelist_id, rule_id, explanation)
              SELECT $1, rule_id, $2
              FROM fraud_rules
              WHERE rule_code = $3
              ON CONFLICT DO NOTHING
            `, [panelist.panelist_id, flag.explanation, flag.rule_code]);
          }

          // Recalculate aggregate panelist risk score based on newly applied       flags
            await client.query(`
              UPDATE panelists
              SET 
                risk_score = COALESCE((
                  SELECT SUM(fr.risk_score_weight)
                  FROM panelist_flags pf
                  JOIN fraud_rules fr ON pf.rule_id = fr.rule_id
                  WHERE pf.panelist_id = $1
                ), 0),
                risk_level = CASE 
                  WHEN COALESCE((SELECT SUM(fr.risk_score_weight) FROM       panelist_flags pf JOIN fraud_rules fr ON pf.rule_id = fr.rule_id       WHERE pf.panelist_id = $1), 0) >= 75 THEN 'critical'
                  WHEN COALESCE((SELECT SUM(fr.risk_score_weight) FROM       panelist_flags pf JOIN fraud_rules fr ON pf.rule_id = fr.rule_id       WHERE pf.panelist_id = $1), 0) >= 50 THEN 'high'
                  WHEN COALESCE((SELECT SUM(fr.risk_score_weight) FROM       panelist_flags pf JOIN fraud_rules fr ON pf.rule_id = fr.rule_id       WHERE pf.panelist_id = $1), 0) >= 25 THEN 'medium'
                  ELSE 'low'
                END
              WHERE panelist_id = $1
            `, [panelist.panelist_id]);

            processedCount++;

            
        }
        // Commit all updates at the end of the batch
        await client.query('COMMIT');

        return {processed: processedCount};
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error processing geolocations:', error);
        throw error;
    } finally {
        client.release();
    }
}