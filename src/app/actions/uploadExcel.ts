"use server";

import { getSession } from "../../lib/users/sessions";
import { saveParticipants } from "../../database/saveParticipants";

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

    return await saveParticipants(
        rows.map((row) => ({
            first_name: row.first_name,
            last_name: row.last_name,
            email: row.email,
            phone: row.phone,
            address: row.address,
            city: row.city,
            state: row.state,
            zip: row.zip,
            npi: row.npi,
            specialty: row.specialty,
            ip_address: row.ip_address,
            npiValid: true,
            nameMatch: true,
            specialtyMatch: true,
        })),
        fileName,
        userId
    );
}