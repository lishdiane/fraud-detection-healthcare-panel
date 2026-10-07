import Link from "next/link";
import requireAuth from "../../lib/users/requireAuth";

export default async function UploadPage() {
    await requireAuth();

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-3xl">
                <div className="rounded-lg bg-white p-8 shadow-md">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Upload Files
                    </h1>

                    <p className="mt-2 text-gray-600">
                        Choose the file that you want to import.
                    </p>

                    <div className="mt-8 grid gap-6 md:grid-cols-2">
                        <Link
                        href="/csv"
                        className="rounded-lg border border-gray-200 bg-gray-50 p-6 transition hover:border-blue-400 hover:bg-blue-50">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Upload CSV
                            </h2>

                            <p className="mt-2 text-sm text-gray-600">
                                Import provider data from a CSV file.
                            </p>
                        </Link>

                        <Link
                        href="/excel"
                        className="rounded-lg border border-gray-200 bg-gray-50 p-6 transition hover:border-blue-400 hover:bg-blue-50">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Upload Excel
                            </h2>
                            <p className="mt-2 text-sm text-gray-600">
                                Import provider data from an Excel file.
                            </p>
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}