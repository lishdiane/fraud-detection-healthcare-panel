import requireAuth from "../../lib/users/requireAuth";
import ModalTest from "../ui/ModalTest";

export default async function DashboardPage() {
  const user = await requireAuth();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>

        <p className="mt-2 text-gray-600">
          View provider records and review fraud risk results.
        </p>
      </div>

      {/* Risk Summary */}
      <div className="mb-8 grid gap-6 md:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Providers</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">--</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Low Risk</p>
          <p className="mt-2 text-3xl font-bold text-green-600">--</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Medium Risk</p>
          <p className="mt-2 text-3xl font-bold text-amber-500">--</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">High Risk</p>
          <p className="mt-2 text-3xl font-bold text-red-500">--</p>
        </div>
      </div>

      {/* Participant Display */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900">Provider Records</h2>

          <p className="mt-1 text-sm text-gray-500">
            Review imported providers and their fraud risk results.
          </p>
        </div>

        {/* Carlos's component goes here */}
        <div className="rounded-lg border-2 border-dashed border-gray-200 p-10 text-center text-gray-400">
          Provider records will display here.
        </div>
      </div>
      <ModalTest />
    </div>
  );
}