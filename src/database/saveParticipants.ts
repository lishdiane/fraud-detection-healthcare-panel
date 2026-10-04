import { Pool } from "pg";
import { checkForDuplicates } from "../lib/database/duplicates";
import { calculateRiskScore } from "../lib/database/riskScoring";

export type ParticipantUploadRow = {
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
    npiValid: boolean;
    nameMatch: boolean;
    specialtyMatch: boolean;
};

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export async function saveParticipants(
    rows: ParticipantUploadRow[],
    fileName: string,
    userId: number
 ) {
 
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

        let duplicateCount = 0;
        let fraudulentParticipantCount = 0;

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

    const triggeredRuleCodes = new Set<string>();

    if (duplicateResult.isDuplicate) {
        duplicateCount++;

        for (const match of duplicateResult.matches) {
            for (const field of match.matchedFields) {
                if (field === "name") {
                    triggeredRuleCodes.add("DUPLICATE_NAME");
                }

                if (field === "email") {
                    triggeredRuleCodes.add("DUPLICATE_EMAIL");
                }

                if (field === "phone") {
                    triggeredRuleCodes.add("DUPLICATE_PHONE");
                }

                if (field === "npi") {
                    triggeredRuleCodes.add("DUPLICATE_NPI");
                }

                if (field === "ip") {
                    triggeredRuleCodes.add("DUPLICATE_IP");
                }
            }
        }
    }
    
    if (!row.npiValid) {
        triggeredRuleCodes.add("INVALID_NPI_FORMAT");
    }

    if (!row.nameMatch) {
        triggeredRuleCodes.add("NPI_NAME_MISMATCH");
    }

    if (!row.specialtyMatch) {
        triggeredRuleCodes.add("SPECIALTY_INVALID");
    }

        const riskResult = await calculateRiskScore(
            Array.from(triggeredRuleCodes),
            client
        );

        for (const rule of riskResult.rules) {
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
                    rule.ruleId,
                    `${rule.ruleCode} detected. Risk points added: ${rule.weight}.`,
                ]
        );
    }

    await client.query(
        `
        UPDATE panelists
        SET
            risk_score = $1,
            risk_level = $2
        WHERE panelist_id = $3
        `,
        [
            riskResult.score,
            riskResult.level,
            panelistId,
        ]
    );

    if (
        riskResult.level === "high" ||
        riskResult.level === "critical"
    ) {
        fraudulentParticipantCount++;
    }
}

    await client.query(
        `
        UPDATE csv_uploads
        SET
            fraudulent_participant_count = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE upload_id = $2
        `,
        [
            fraudulentParticipantCount,
            uploadId
        ]
    );

    await client.query("COMMIT");

    return {
        success: true,
        uploadId,
        insertedCount: rows.length,
        duplicateCount,
        fraudulentParticipantCount,
    };

    } catch (error) {
        await client.query("ROLLBACK");

        console.error("DATABASE ERROR:", error);

        return {
            success: false,
            uploadId: null,
            insertedCount: 0,
            duplicateCount: 0,
            fraudulentParticipantCount: 0,
            error:
                error instanceof Error ? error.message: "Couldn't save the participant data to the database."
        };

    } finally {
        client.release();
    }
    
}