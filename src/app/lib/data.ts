import pool from './db';
import {
    PanelistData
} from './definitions';
import { getSession } from "../../lib/users/sessions";

export async function fetchPanelists() {
    try{
        const session = await getSession();

        if (!session?.value) {
            // Return an empty array if not logged in to match the expected return type
            return [];
        }

        const userId = Number(session.value);
        const client = await pool.connect();
        const data = await client.query<PanelistData>(
            `SELECT * FROM panelists 
            WHERE reviewed_by_user_id = $1
            ORDER BY panelist_id ASC`, [userId]); 

        return data.rows;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch panelists data.');
    }
}