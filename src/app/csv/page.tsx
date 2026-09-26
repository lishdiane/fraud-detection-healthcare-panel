"use client";

import { ChangeEvent, useState } from "react";
import { CSVRow, VerifiedCSVRow, parseCSV } from "../../lib/csv/parser";
import { validateCSVFile, validateCSVRows } from "../../lib/csv/validation";
import { verifyProvider } from "../actions/verifyProvider";

export default function CSVPage() {
    const [rows, setRows] = useState<VerifiedCSVRow[]>([]);
    const [errors, setErrors] = useState<string[]>([]);
    const [fileName, setFileName] = useState("");

    async function handleFileUpload(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        setRows([]);
        setErrors([]);
        setFileName("");

        if (!file) {
            return;
        }

        setFileName(file.name);

        const fileErrors = validateCSVFile(file);

        if (fileErrors.length > 0) {
            setErrors(fileErrors);
            return;
        }

        const result = await parseCSV(file);

        if (result.errors.length > 0) {
            setErrors(result.errors);
            return;
        }

        const validationResult = validateCSVRows(result.data);

        if (!validationResult.valid) {
            setErrors(validationResult.errors);
            return;
        }

        const verifiedRows: VerifiedCSVRow[] = await Promise.all(
            result.data.map(async (row) => {
                const verification = await verifyProvider({
                    first_name: row.first_name,
                    last_name: row.last_name,
                    npi: row.npi,
                    specialty: row.specialty,
                });

                return {
                    ...row,
                    ...verification
                }
            })
        )        
        setRows(verifiedRows);
    }

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-5xl">
                <div className="rounded-lg bg-white p-8 shadow-md">
                    <h1 className="text-2xl font-bold text-gray-900">
                    Import Provider Data
                </h1>

                <p className="mt-2 text-gray-600">
                    Upload a CSV file with the healthcare provider information.
                </p>

                <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-6">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Select a CSV file
                    </h2>

                    <p className="mt-1 text-sm text-gray-600">
                        Select a CSV file with the provider information.
                    </p>

                    <label className="mt-4 inline-block cursor-pointer rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700">
                        Choose CSV File

                <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileUpload}
                className="hidden"/>
                </label>

                {fileName && (
                    <p className="mt-3 text-sm text-gray-700">
                        Selected:{" "}
                        <span className="font-medium">
                            {fileName}
                        </span>
                    </p>
                )}
            </div>

                {errors.length > 0 && (
                    <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
                        <h2 className="font-semibold">
                            Validation Errors
                        </h2>

                        <ul className="mt-2 list-disc pl-5 text-sm">
                            {errors.map((error, index) => (
                                <li key={index}>{error}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {rows.length > 0 && errors.length === 0 && (
                    <div className="mt-6">
                        <div className="rounded-md border border-green-200 bg-green-50 p-4">
                        <p className="font-semibold text-green-700">
                            File validated successfully.
                        </p>

                        <p className="mt-1 text-sm text-green-700">
                            {rows.length} provider record(s) were successfully parsed.
                        </p>
                    </div>

                        <h2 className="mt-6 text-lg font-semibold text-gray-900">
                            Data Preview
                        </h2>

                        <div className="mt-3 overflow-x-auto rounded-lg border border-gray-200">
                        <table className="min-w-full border-collapse bg-white text-sm">
                            <thead>
                                <tr className="bg-gray-50">
                                    {Object.keys(rows[0]).map((column) => (
                                        <th
                                        key={column}
                                        className="border-b border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">

                                            {column}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {rows.map((row, rowIndex) => (
                                    <tr key={rowIndex} className="hover:bg-gray-50">
                                        {Object.keys(rows[0]).map((column) => (
                                            <td
                                            key={column}
                                            className="border-b border-gray-100 px-4 py-3 text-gray-700">
                                                {String(row[column])}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                )}
            </div>
        </div>
    </main>
    );
}