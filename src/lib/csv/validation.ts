import { CSVRow } from "./parser";

export type ValidationResult = {
    valid: boolean;
    errors: string[];
};

const REQUIRED_COLUMNS = [
    "first_name",
    "last_name",
    "email",
    "phone",
    "address",
    "city",
    "state",
    "zip",
    "npi",
    "specialty",
    "ip_address",
    "test_case",
];

export function validateCSVFile(file: File): string[] {
    const errors: string[] = [];

    if (!file) {
        errors.push("No file has been selected.");
        return errors;
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
        errors.push("The file must be a .CSV file.");
    }

    if (file.size === 0) {
        errors.push("This CSV file is empty.");
    }

    return errors;
}

export function validateCSVRows(rows: CSVRow[]): ValidationResult {
    const errors: string[] = [];

    if (rows.length === 0) {
        errors.push("The CSV doesn't have any data.");
        return {
            valid: false,
            errors,
        };
    }

    const columns = Object.keys(rows[0]);
    const missingColumns = REQUIRED_COLUMNS.filter(
        (column) => !columns.includes(column)
    );

    if (missingColumns.length > 0) {
        errors.push(
            `Missing required columns: ${missingColumns.join(", ")}.`
        );
    }

    rows.forEach((row, index) => {

        const rowNumber = index + 2;
        const values = Object.values(row);

        if (values.every((value) => !value || value.trim() === "")) {
            errors.push(`Row ${rowNumber} is empty.`);
            return;
    }

    if (!row.first_name || row.first_name.trim() === "") {
        errors.push(`Row ${rowNumber}: First name is required.`);
    }

    if (!row.last_name || row.last_name.trim() === "") {
    errors.push(`Row ${rowNumber}: Last name is required.`);
    }

    if (!row.email || row.email.trim() === "") {
    errors.push(`Row ${rowNumber}: Email is required.`);
    } else if (!isValidEmail(row.email)) {
    errors.push(`Row ${rowNumber}: Email format is invalid.`);
    }

    if (!row.phone || row.phone.trim() === "") {
    errors.push(`Row ${rowNumber}: Phone is required.`);
    }

    if (!row.address || row.address.trim() === "") {
    errors.push(`Row ${rowNumber}: Address is required.`);
    }

    if (!row.city || row.city.trim() === "") {
    errors.push(`Row ${rowNumber}: City is required.`);
    }

    if (!row.state || row.state.trim() === "") {
    errors.push(`Row ${rowNumber}: State is required.`);
    } else if (!isValidState(row.state)) {
        errors.push(
            `Row ${rowNumber}: State must contain exactly 2 letters.`
        );
    }

    if (!row.zip || row.zip.trim() === "") {
    errors.push(`Row ${rowNumber}: ZIP is required.`);
    }

    if (!row.npi || row.npi.trim() === "") {
    errors.push(`Row ${rowNumber}: NPI is required.`);
    } else if (!isValidNPI(row.npi)) {
    errors.push(`Row ${rowNumber}: NPI must contain 10 digits.`);
    }

    if (!row.specialty || row.specialty.trim() === "") {
    errors.push(`Row ${rowNumber}: Specialty is required.`);
    }

    if (!row.ip_address || row.ip_address.trim() === "") {
    errors.push(`Row ${rowNumber}: IP Address is required.`);
    }

    if (!row.test_case || row.test_case.trim() === "") {
    errors.push(`Row ${rowNumber}: Test case is required.`);
    }

});

    return {
        valid: errors.length === 0,
        errors,
    };
}

function isValidEmail(email: string): boolean {
    const value = email.trim();

    const atIndex = value.indexOf("@");

    if (atIndex <= 0 || atIndex === value.length - 1) {
        return false;
    }

    const domain = value.substring(atIndex + 1);

    return (
        domain.includes(".") &&
        !domain.startsWith(".") &&
        !domain.endsWith(".")
    );
}

function isValidNPI(npi: string): boolean {
    const value = npi.trim();

    return (
        value.length === 10 &&
        [...value].every(
            (char) => char >= "0" && char <= "9"
        )
    );
}

function isValidState(state: string): boolean {
    const value = state.trim();

    return (
        value.length === 2 &&
        [...value].every(
            (char) =>
            (char >= "A" && char <= "Z") ||
            (char >= "a" && char <= "z")
        )
    );
}