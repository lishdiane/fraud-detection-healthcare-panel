"use client";

import { ChangeEvent, useState } from "react";
import { VerifiedCSVRow, parseCSV } from "../../lib/csv/parser";
import { validateCSVFile, validateCSVRows } from "../../lib/csv/validation";
import { verifyProvider } from "../actions/verifyProvider";
import { uploadCSVData } from "../actions/uploadCSV";

export default function CSVPage() {
  const [rows, setRows] = useState<VerifiedCSVRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [fileName, setFileName] = useState("");

  // Processing progress
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState("");
  const [processedCount, setProcessedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const visibleColumns =
    rows.length > 0
      ? Object.keys(rows[0]).filter(
          (column) =>
            column !== "npiValid" &&
            column !== "nameMatch" &&
            column !== "specialtyMatch",
        )
      : [];

  const progressPercent =
    totalCount > 0 ? Math.round((processedCount / totalCount) * 100) : 0;

  async function handleFileUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    // Reset previous results
    setRows([]);
    setErrors([]);
    setFileName("");
    setIsProcessing(false);
    setProcessingStage("");
    setProcessedCount(0);
    setTotalCount(0);

    if (!file) {
      return;
    }

    setFileName(file.name);
    setIsProcessing(true);
    setProcessingStage("Validating file...");

    try {
      // Validate file
      const fileErrors = validateCSVFile(file);

      if (fileErrors.length > 0) {
        setErrors(fileErrors);
        return;
      }

      // Parse CSV
      setProcessingStage("Reading CSV file...");

      const result = await parseCSV(file);

      if (result.errors.length > 0) {
        setErrors(result.errors);
        return;
      }

      // Validate rows
      setProcessingStage("Validating provider records...");

      const validationResult = validateCSVRows(result.data);

      if (!validationResult.valid) {
        setErrors(validationResult.errors);
        return;
      }

      // Verify providers
      setProcessingStage("Verifying providers...");
      setTotalCount(result.data.length);

      let completed = 0;

      const verifiedRows: VerifiedCSVRow[] = await Promise.all(
        result.data.map(async (row): Promise<VerifiedCSVRow> => {
          const verification = await verifyProvider({
            first_name: row.first_name,
            last_name: row.last_name,
            npi: row.npi,
            specialty: row.specialty,
          });

          completed++;
          setProcessedCount(completed);

          return {
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
            npiValid: verification.npiValid,
            nameMatch: verification.nameMatch,
            specialtyMatch: verification.specialtyMatch,
          };
        }),
      );

      // Save verified data and run backend processing
      setProcessingStage("Saving providers and calculating risk...");

      const uploadResult = await uploadCSVData(
        verifiedRows.map((row) => ({
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
          npiValid: row.npiValid,
          nameMatch: row.nameMatch,
          specialtyMatch: row.specialtyMatch,
        })),
        file.name,
      );

      if (!uploadResult.success) {
        setErrors([uploadResult.error ?? "The CSV couldn't be saved."]);
        return;
      }

      // Only show success after upload finishes
      setRows(verifiedRows);
    } catch (error) {
      console.error("CSV processing failed:", error);
      setErrors([
        "Something went wrong while processing the file. Please try again.",
      ]);
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-lg bg-white p-4 shadow-md sm:p-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Import Provider Data
          </h1>

          <p className="mt-2 text-gray-600">
            Upload a CSV file with the healthcare provider information.
          </p>

          {/* File Selection */}
          <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Select a CSV file
            </h2>

            <p className="mt-1 text-sm text-gray-600">
              Select a CSV file with the provider information.
            </p>

            <label
              className={`mt-4 inline-block rounded-md px-4 py-2 font-medium text-white ${
                isProcessing
                  ? "cursor-not-allowed bg-blue-400"
                  : "cursor-pointer bg-blue-600 hover:bg-blue-700"
              }`}
            >
              Choose CSV File
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileUpload}
                disabled={isProcessing}
                className="hidden"
              />
            </label>

            {fileName && (
              <p className="mt-3 text-sm text-gray-700">
                Selected: <span className="font-medium">{fileName}</span>
              </p>
            )}
          </div>

          {/* Processing Indicator */}
          {isProcessing && (
            <div
              className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-5"
              role="status"
              aria-live="polite"
            >
              <div className="flex items-center gap-3">
                <div
                  className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600"
                  aria-hidden="true"
                />

                <div>
                  <p className="font-semibold text-blue-900">
                    {processingStage}
                  </p>

                  {processingStage === "Verifying providers..." && (
                    <p className="mt-1 text-sm text-blue-700">
                      {processedCount} of {totalCount} providers verified
                    </p>
                  )}
                </div>
              </div>

              {/* Verification Progress Bar */}
              {processingStage === "Verifying providers..." &&
                totalCount > 0 && (
                  <div className="mt-4">
                    <div
                      className="h-2 overflow-hidden rounded-full bg-blue-200"
                      role="progressbar"
                      aria-label="Provider verification progress"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={progressPercent}
                    >
                      <div
                        className="h-full rounded-full bg-blue-600 transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>

                    <p className="mt-2 text-right text-xs text-blue-700">
                      {progressPercent}%
                    </p>
                  </div>
                )}

              {processingStage ===
                "Saving providers and calculating risk..." && (
                <p className="mt-2 text-sm text-blue-700">
                  Verification complete. Please wait while your records are
                  saved and processed.
                </p>
              )}
            </div>
          )}

          {/* Validation / Processing Errors */}
          {errors.length > 0 && (
            <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
              <h2 className="font-semibold">Validation or Processing Errors</h2>

              <ul className="mt-2 list-disc pl-5 text-sm">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Success and Data Preview */}
          {rows.length > 0 && errors.length === 0 && !isProcessing && (
            <div className="mt-6">
              <div className="rounded-md border border-green-200 bg-green-50 p-4">
                <p className="font-semibold text-green-700">
                  File uploaded successfully.
                </p>

                <p className="mt-1 text-sm text-green-700">
                  {rows.length} provider record(s) were successfully verified
                  and submitted for processing.
                </p>
              </div>

              <h2 className="mt-6 text-lg font-semibold text-gray-900">
                Data Preview
              </h2>

              <div className="mt-3 overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full border-collapse bg-white text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      {visibleColumns.map((column) => (
                        <th
                          key={column}
                          className="border-b border-gray-200 px-4 py-3 text-left font-semibold text-gray-700"
                        >
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {rows.map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-gray-50">
                        {visibleColumns.map((column) => (
                          <td
                            key={column}
                            className="border-b border-gray-100 px-4 py-3 text-gray-700"
                          >
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
