import pool from './db';
import {
    PanelistData
} from './definitions'

export async function fetchPanelists(riskLevel?: string) {
    try{
        const client = await pool.connect();
        const data = 
        !riskLevel || riskLevel === "all"
        ? await client.query<PanelistData>(`SELECT * FROM panelists`)
        : await client.query<PanelistData>(`SELECT * FROM panelists WHERE risk_level = $1`,
            [riskLevel]
        );
        
        return data.rows;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch panelists data.');
    }
}