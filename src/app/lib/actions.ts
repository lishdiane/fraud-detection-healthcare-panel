'use me' // or 'use server'
'use server';

import pool from './db';
import { revalidatePath } from 'next/cache';

export async function updateReviewStatus(panelistId: number, status: string) {
    let client;
    try {
        client = await pool.connect();
        await client.query(
            `UPDATE panelists SET review_status = $1 WHERE panelist_id = $2`,
            [status, panelistId]
        );
        // Revalidate cache to trigger an inmediate server re-render
        revalidatePath('/');
    } catch (error) {
        console.error('Failed to update status:', error);
        throw new Error('Database update failed');
    } finally {
        if (client) client.release();
    }
}

export async function fetchFlagsByPanelistId(panelistId: number) {
    let client;
    try {
        client = await pool.connect();
        const result = await client.query(
            `SELECT * FROM panelist_flags WHERE panelist_id = $1`,
            [panelistId]
        );
        return result.rows;
    } catch (error) {
        console.error('Failed to fetch flags:', error);
        throw new Error('Failed to load flags.');
    } finally {
        if (client) client.release();
    }
}