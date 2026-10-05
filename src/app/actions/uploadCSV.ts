"use server";

import { getSession } from "../../lib/users/sessions";
import { saveParticipants } from "../../database/saveParticipants";

export type CSVUploadRow = {
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

export async function uploadCSVData(
    rows: CSVUploadRow[],
    fileName: string
) {
    const session = await getSession();

    if (!session?.value) {
        return {
            success: false,
            uploadId: null,
            insertedCount: 0,
            error: "You must be logged in to upload a CSV file.",
        };
    }

    const userId = Number(session.value);

    if (!Number.isInteger(userId) || userId <= 0) {
        return {
            success: false,
            uploadId: null,
            insertedCount: 0,
            error: "The current user sessionis invalid.",
        };
    }

    return await saveParticipants(
        rows,
        fileName,
        userId
    );
}