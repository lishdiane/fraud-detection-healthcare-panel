import { Pool, PoolClient } from "pg";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export interface ParticipantForDuplicateCheck {
    first_name: string;
    last_name: string;
    email: string;
    phone_number?: string | null;
    npi_number?: string | null;
    ip_address: string;
}

export interface DuplicateMatch {
    panelistId: number;
    matchedFields: string[];
    panelist: {
        first_name: string;
        last_name: string;
        email: string;
        phone_number: string | null;
        npi_number: string | null;
        ip_address: string;
    };
}

export interface DuplicateCheckResult {
    isDuplicate: boolean;
    matches: DuplicateMatch[];
}

function checkName(value?: string | null): string {
    return (value ?? "")
    .trim()
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .join(" ");
}

function checkEmail(value?: string | null): string {
    return (value ?? "").trim().toLowerCase();
}

function checkNumbers(value?: string | null): string {
    const text = value ?? "";
    let result = "";

    for (const character of text) {
        if (character >= "0" && character <= "9") {
            result += character;
        }
    }

    return result;
}

function checkIp(value?: string | null): string {
    return (value ?? "").trim().toLowerCase();
}

export async function checkForDuplicates(
    participant: ParticipantForDuplicateCheck,
    excludePanelistId?: number,
    database: Pool | PoolClient = pool,
): Promise<DuplicateCheckResult> {
    const firstName = checkName(participant.first_name);
    const lastName = checkName(participant.last_name);
    const email = checkEmail(participant.email);
    const phone = checkNumbers(participant.phone_number);
    const npi = checkNumbers(participant.npi_number);
    const ip = checkIp(participant.ip_address);

    const result = await database.query(`

        SELECT
            panelist_id,
            first_name,
            last_name,
            email,
            phone_number,
            npi_number,
            ip_address
        FROM panelists
`);

const matches: DuplicateMatch[] = [];

for (const row of result.rows) {
    if (
        excludePanelistId !== undefined &&
        row.panelist_id === excludePanelistId
    ) {
        continue;
    }

    const matchedFields: string[] = [];

    if (
        firstName &&
        lastName &&
        checkName(row.first_name) === firstName &&
        checkName(row.last_name) === lastName
    ) {
        matchedFields.push("name");
    }
    
    if (
        email &&
        checkEmail(row.email) === email
        ) {
        matchedFields.push("email");
        }

    if (
        phone &&
        checkNumbers(row.phone_number) === phone
        ) {
        matchedFields.push("phone");
        }

    if (
        npi &&
        checkNumbers(row.npi_number) === npi
        ) {
        matchedFields.push("npi");
        }

    if (
        ip &&
        checkIp(row.ip_address) === ip
        ) {
        matchedFields.push("ip");
    }

    if (matchedFields.length > 0) {
        matches.push({
            panelistId: row.panelist_id,
            matchedFields,
            panelist: {
                first_name: row.first_name,
                last_name: row.last_name,
                email: row.email,
                phone_number: row.phone_number,
                npi_number: row.npi_number,
                ip_address: row.ip_address,
            },
        });
    }
}

return {
    isDuplicate: matches.length > 0,
    matches,
    };
}