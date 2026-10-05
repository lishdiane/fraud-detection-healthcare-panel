import Papa from "papaparse";

export type CSVRow = Record<string, string>;

export type VerifiedCSVRow = {
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

export type CSVParseResult = {
    data: CSVRow[];
    errors: string[];
};

export function parseCSV(file: File): Promise<CSVParseResult> {
    return new Promise((resolve) => {
        Papa.parse<CSVRow>(file, {
            header: true,
            skipEmptyLines: true,

            complete: (results) => {
                const errors = results.errors.map((error) => {
                    return `Row ${error.row ?? "unknown"}: ${error.message}`;
                });

                resolve({
                data: results.data,
                errors,
                });
            },

            error: (error) => {
            resolve({
            data: [],
            errors: [error.message],
            });
            },
        });
    });
}