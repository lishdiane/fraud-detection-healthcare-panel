"use server";

import { Pool } from "pg";
import { getSession } from "../../lib/users/sessions";
import { checkForDuplicates } from "../../lib/database/duplicates";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export type ExcelUploadRow = {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    npi: string;
    specialty: string;
    ip_address: string;
    test_case: string;
};

export async function uploadExcelData(rows:ExcelUploadRow[],
    fileName: string
) {

    const session = await getSession();

    if (!session?.value) {
        return {
            success: false,
            uploadId: null,
            insertedCount: 0,
            error: "You must be logged in to upload an Excel file.",
        };
    }

    const userId = Number(session.value);

    if (!Number.isInteger(userId) || userId <= 0) {
        return {
            success: false,
            uploadId: null,
            insertedCount: 0,
            error: "The current user session is invalid.",
        };
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const uploadResult = await client.query(
            `
            
            INSERT INTO csv_uploads (
            project_name,
            company_name,
            upload_year,
            raw_file_path,
            initial_participant_count,
            uploaded_by_user_id
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING upload_id
            `,

            [
                fileName,
                null,
                new Date().getFullYear(),
                fileName,
                rows.length,
                userId,
            ]
        );

        const uploadId = uploadResult.rows[0].upload_id;

        const ruleResult = await client.query(
            `
            INSERT INTO fraud_rules (
                rule_code,
                rule_name,
                category,
                description
                )
                VALUES (
                $1,
                $2,
                $3,
                $4
                )
                ON CONFLICT (rule_code)
                DO UPDATE SET
                    rule_name = EXCLUDED.rule_name,
                    category = EXCLUDED.category,
                    description = EXCLUDED.description
                RETURNING rule_id
                `,
                [
                    "DUPLICATE_PARTICIPANT",
                    "Duplicate participant",
                    "duplicate",
                    "Participant information matches another participant by name, email, phone, NPI or IP address.",
                ]
        );

        const duplicateRuleId = ruleResult.rows[0].rule_id;

        let duplicateCount = 0;

        for (const row of rows) {
            const panelistResult = await client.query(
                `
                INSERT INTO panelists (
                upload_id,
                first_name,
                last_name,
                email,
                phone_number,
                npi_number,
                specialty,
                street_address,
                city,
                state,
                postal_code,
                ip_address
            )
            VALUES (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6,
                $7,
                $8,
                $9,
                $10,
                $11,
                $12
            )
                RETURNING panelist_id
                `,
            [
                uploadId,
                row.first_name,
                row.last_name,
                row.email,
                row.phone,
                row.npi,
                row.specialty,
                row.address,
                row.city,
                row.state,
                row.zip,
                row.ip_address
            ]
        );

    const panelistId = panelistResult.rows[0].panelist_id;

    const duplicateResult = await checkForDuplicates(
        {
            first_name: row.first_name,
            last_name: row.last_name,
            email: row.email,
            phone_number: row.phone,
            npi_number: row.npi,
            ip_address: row.ip_address,
        },
        panelistId,
        client
    );

    if (duplicateResult.isDuplicate) {
        duplicateCount++;

        const matchedFields = new Set<string>();

        for (const match of duplicateResult.matches) {
            for (const field of match.matchedFields) {
                matchedFields.add(field);
            }
        }

        await client.query(
            `
            INSERT INTO panelist_flags (
                panelist_id,
                rule_id,
                explanation
                )
                VALUES ($1, $2, $3)
                `,
                [
                    panelistId,
                    duplicateRuleId,
                    `Duplicate information detected. Matching fields: ${Array.from(matchedFields).join(", ")}`,
                ]
        );
    }
}

    await client.query("COMMIT");

    return {
        success: true,
        uploadId,
        insertedCount: rows.length,
        duplicateCount,
    };

    } catch (error) {
        await client.query("ROLLBACK");

        console.error("DATABASE ERROR:", error);

        return {
            success: false,
            uploadId: null,
            insertedCount: 0,
            duplicateCount: 0,
            error:
                error instanceof Error ? error.message: "Couldn't save the Excel data to the database."
        };

    } finally {
        client.release();
    }
    
}