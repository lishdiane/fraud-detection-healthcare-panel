import requireAuth from "../../lib/users/requireAuth";
import { getDashboardParticipants } from "../../lib/database/dashboardData";
import PanelistList from "../ui/dashboard/panelists-list";
import VerifyGeoButton from "../ui/dashboard/verify-geo-button";
import RiskLevelFilter from "../ui/dashboard/RiskLevelFilter";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ risk?: string }>;
}) {
  const user = await requireAuth();
  const params = await searchParams;
  const riskLevel = params.risk ?? "all";
  const participants = await getDashboardParticipants(riskLevel, user.user_id);
  const allParticipants = await getDashboardParticipants("all", user.user_id);
  const totalProviders = allParticipants.length;

  const lowRisk = allParticipants.filter(
    (participant) => participant.risk_level === "low",
  ).length;

  const mediumRisk = allParticipants.filter(
    (participant) => participant.risk_level === "medium",
  ).length;

  const highRisk = allParticipants.filter(
    (participant) => participant.risk_level === "high",
  ).length;

  const criticalRisk = allParticipants.filter(
    (participant) => participant.risk_level === "critical",
  ).length;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>

        <p className="mt-2 text-gray-600">
          View provider records and review fraud risk results.
        </p>

        <RiskLevelFilter />
      </div>

      {/* Risk Summary */}
      <div className="mb-8 grid gap-6 md:grid-cols-5">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Providers</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {totalProviders}
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Low Risk</p>
          <p className="mt-2 text-3xl font-bold text-green-600">{lowRisk}</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Medium Risk</p>
          <p className="mt-2 text-3xl font-bold text-amber-500">{mediumRisk}</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">High Risk</p>
          <p className="mt-2 text-3xl font-bold text-orange-500">{highRisk}</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Critical Risk</p>
          <p className="mt-2 text-3xl font-bold text-red-500">{criticalRisk}</p>
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

        <VerifyGeoButton />

        <div className="rounded-lg border-2 border-dashed border-gray-200 p-10 text-center text-gray-400">
          <PanelistList riskLevel={riskLevel} />
        </div>

        <div className="mt-6">
          <p className="text-sm text-gray-600">
            Showing {participants.length} provider(s)
            {riskLevel !== "all" ? ` with ${riskLevel} risk.` : "."}
          </p>
        </div>
      </div>
    </div>
  );
}
