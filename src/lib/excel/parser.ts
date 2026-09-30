import * as XLSX from "xlsx";

export type ExcelRow = Record<string, string>;

export type ExcelParseResult = {
    data: ExcelRow[];
    errors: string[];
};

export function parseExcel(file: File): Promise<ExcelParseResult> {
    return new Promise((resolve) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                const data = event.target?.result;

                if (!data) {
                    resolve({
                        data: [],
                        errors: ["Couldn't read the Excel file."],
                    });

                    return;
                }

                const workbook = XLSX.read(data, {
                    type: "array"
                });

                const sheetName = workbook.SheetNames[0];

                if (!sheetName) {
                    resolve({
                        data: [],
                        errors: ["The Excel file doesn't contain a worksheet."],
                    });

                    return;
                }

                const sheet = workbook.Sheets[sheetName];

                const rows = XLSX.utils.sheet_to_json<ExcelRow>(sheet, {
                    defval: "",
                    raw: false,
                });

                resolve({
                    data: rows,
                    errors: [],
                });
            } catch (error) {
                resolve({
                    data: [],
                    errors: [
                        error instanceof Error ? error.message: "Couldn't read the Excel file.",
                    ],
                });
            }
        };

        reader.onerror = () => {
            resolve({
                data: [],
                errors: ["Couldn't read the Excel file."],
            });
        };

        reader.readAsArrayBuffer(file);
    });
}