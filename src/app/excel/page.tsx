"use client";

import { ChangeEvent, useState } from "react";
import { ExcelRow, parseExcel } from "../../lib/excel/parser";
import {
  validateExcelFile,
  validateExcelRows,
} from "../../lib/excel/validation";
import { uploadExcelData, ExcelUploadRow } from "../actions/uploadExcel";

export default function ExcelPage() {
  const [rows, setRows] = useState<ExcelRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [fileName, setFileName] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  // Processing progress
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState("");
  const [totalCount, setTotalCount] = useState(0);

  const visibleColumns = rows.length > 0 ? Object.keys(rows[0]) : [];

  async function handleFileUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    // Reset previous results
    setRows([]);
    setErrors([]);
    setFileName("");
    setSaveMessage("");
    setIsProcessing(false);
    setProcessingStage("");
    setTotalCount(0);

    if (!file) {
      return;
    }

    setFileName(file.name);
    setIsProcessing(true);
    setProcessingStage("Validating file...");

    try {
      // Validate file
      const fileErrors = validateExcelFile(file);

      if (fileErrors.length > 0) {
        setErrors(fileErrors);
        return;
      }

      // Parse Excel
      setProcessingStage("Reading Excel file...");

      const result = await parseExcel(file);

      if (result.errors.length > 0) {
        setErrors(result.errors);
        return;
      }

      // Validate provider records
      setProcessingStage("Validating provider records...");

      const validationResult = validateExcelRows(result.data);

      if (!validationResult.valid) {
        setErrors(validationResult.errors);
        return;
      }

      if (result.data.length === 0) {
        setErrors(["The Excel file contains no provider records."]);
        return;
      }

      setTotalCount(result.data.length);

      // Prepare rows for database
      const cleanRows: ExcelUploadRow[] = result.data.map((row) => ({
        first_name: String(row.first_name ?? ""),
        last_name: String(row.last_name ?? ""),
        email: String(row.email ?? ""),
        phone: String(row.phone ?? ""),
        address: String(row.address ?? ""),
        city: String(row.city ?? ""),
        state: String(row.state ?? ""),
        zip: String(row.zip ?? ""),
        npi: String(row.npi ?? ""),
        specialty: String(row.specialty ?? ""),
        ip_address: String(row.ip_address ?? ""),
        test_case: String(row.test_case ?? ""),
      }));

      // Save records and wait for backend processing
      setProcessingStage("Saving providers and processing records...");

      const uploadResult = await uploadExcelData(cleanRows, file.name);

      if (!uploadResult.success) {
        setErrors([uploadResult.error ?? "Couldn't save the Excel data."]);
        return;
      }

      // Only show success after database upload completes
      setRows(result.data);

      setSaveMessage(
        `${uploadResult.insertedCount} provider record(s) were saved to the database.`,
      );
    } catch (error) {
      console.error("Excel processing failed:", error);

      setErrors([
        "Something went wrong while processing the Excel file. Please try again.",
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
            Upload an Excel file with the healthcare provider information.
          </p>

          {/* File Selection */}
          <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Select an Excel file
            </h2>

            <p className="mt-1 text-sm text-gray-600">
              Select an XLSX file with the provider information.
            </p>

            <label
              className={`mt-4 inline-block rounded-md px-4 py-2 font-medium text-white ${
                isProcessing
                  ? "cursor-not-allowed bg-blue-400"
                  : "cursor-pointer bg-blue-600 hover:bg-blue-700"
              }`}
            >
              Choose Excel File
              <input
                type="file"
                accept=".xlsx"
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

                  {processingStage ===
                    "Saving providers and processing records..." && (
                    <p className="mt-1 text-sm text-blue-700">
                      Processing {totalCount} provider record(s). Please wait...
                    </p>
                  )}
                </div>
              </div>

              {/* Animated progress indicator */}
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-blue-200">
                <div className="h-full w-1/3 animate-pulse rounded-full bg-blue-600" />
              </div>
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
                  {rows.length} provider record(s) were successfully validated
                  and submitted.
                </p>

                {saveMessage && (
                  <p className="mt-2 text-sm font-medium text-green-700">
                    {saveMessage}
                  </p>
                )}
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
