import pool from './db';
import {
    PanelistData
} from './definitions'

export async function fetchPanelists() {
    try{
        const client = await pool.connect();
        const data = await client.query<PanelistData>(`SELECT * FROM panelists`); 

        return data.rows;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch panelists data.');
    }
}