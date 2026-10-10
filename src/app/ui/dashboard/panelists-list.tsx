import { fetchPanelists } from "../../lib/data";
import ReviewStatusSelect from "./ReviewStatusSelect";
import FlagsModal from "./FlagsModal";

export default async function PanelistList({
  riskLevel,
}: {
  riskLevel?: string;
}) {
  const panelists = await fetchPanelists(riskLevel);

  if (!panelists || panelists.length === 0) {
    return (
      <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
        <h3 className="text-sm font-semibold text-gray-900">
          No panelists found
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          No panelists match your current filter, or you haven't uploaded any
          data yet.
        </p>
      </div>
    );
  }

  const riskBadge = (level: string | null | undefined) => {
    const colors: Record<string, string> = {
      critical: "bg-red-100 text-red-800",
      high: "bg-orange-100 text-orange-800",
      medium: "bg-amber-100 text-amber-800",
      low: "bg-green-100 text-green-800",
    };

    const normalized = level?.toLowerCase() ?? "unknown";

    return (
      <span
        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
          colors[normalized] ?? "bg-gray-100 text-gray-700"
        }`}
      >
        {normalized}
      </span>
    );
  };

  return (
    <section className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-gray-200 px-5 py-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Panelist Review
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Review provider risk and verification results
          </p>
        </div>

        <span className="shrink-0 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
          {panelists.length} panelists
        </span>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-5 py-4 font-semibold">Provider</th>
              <th className="px-4 py-4 font-semibold">NPI</th>
              <th className="px-4 py-4 font-semibold">Risk</th>
              <th className="px-4 py-4 font-semibold">Review</th>
              <th className="px-4 py-4 font-semibold">Details</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {panelists.map((panelist) => (
              <tr
                key={panelist.panelist_id}
                className="transition-colors hover:bg-gray-50"
              >
                <td className="px-5 py-4">
                  <div className="font-medium text-gray-900">
                    {panelist.first_name} {panelist.last_name}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {panelist.specialty || "Specialty not provided"}
                  </div>
                </td>

                <td className="whitespace-nowrap px-4 py-4 text-gray-600">
                  {panelist.npi_number || "—"}
                </td>

                <td className="px-4 py-4">
                  <div className="flex flex-col items-start gap-1">
                    {riskBadge(panelist.risk_level)}
                    <span className="text-xs text-gray-500">
                      {panelist.risk_score ?? "—"} pts
                    </span>
                  </div>
                </td>

                <td className="px-4 py-4">
                  <ReviewStatusSelect
                    panelistId={panelist.panelist_id}
                    currentStatus={panelist.review_status}
                  />
                </td>

                <td className="px-4 py-4">
                  <FlagsModal panelist={panelist} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 bg-gray-50 p-3 md:hidden">
        {panelists.map((panelist) => (
          <article
            key={panelist.panelist_id}
            className="rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1 text-left">
                <h3 className="text-left font-semibold text-gray-900">
                  {panelist.first_name} {panelist.last_name}
                </h3>
                <p className="mt-1 text-left text-sm text-gray-500">
                  {panelist.specialty || "Specialty not provided"}
                </p>
              </div>

              <div className="shrink-0">{riskBadge(panelist.risk_level)}</div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
              <div>
                <p className="text-xs text-gray-500">NPI</p>
                <p className="mt-1 text-sm font-medium text-gray-800">
                  {panelist.npi_number || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Risk Score</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {panelist.risk_score ?? "—"} pts
                </p>
              </div>
            </div>

            <div className="mt-4 border-t border-gray-100 pt-4">
              <p className="mb-2 text-xs font-medium text-gray-500">
                Review Status
              </p>
              <ReviewStatusSelect
                panelistId={panelist.panelist_id}
                currentStatus={panelist.review_status}
              />
            </div>

            <div className="mt-4 border-t border-gray-100 pt-3">
              <FlagsModal panelist={panelist} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
