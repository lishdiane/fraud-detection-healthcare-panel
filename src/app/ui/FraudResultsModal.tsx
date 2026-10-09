"use client";

type FraudFlag = {
  rule_name: string;
  description: string;
  score_weight: number;
};

type ProviderFraudResult = {
  first_name: string;
  last_name: string;
  npi_number: string;
  email: string;
  specialty: string;
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  risk_score: number;
  risk_level: string;
  flags: FraudFlag[];
};

type FraudResultsModalProps = {
  provider: ProviderFraudResult;
  onClose: () => void;
};

export default function FraudResultsModal({
  provider,
  onClose,
}: FraudResultsModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[90dvh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white text-left shadow-xl">
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-gray-200 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
              Fraud Risk Details
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Provider verification and risk assessment
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close fraud risk details"
            className="shrink-0 text-2xl text-gray-400 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {/* Provider Information */}
          <div className="border-b border-gray-200 px-5 py-5 sm:px-6">
            <h3 className="text-left text-lg font-semibold text-slate-900">
              {provider.first_name} {provider.last_name}
            </h3>

            <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
              <div className="min-w-0 text-left">
                <p className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Email
                </p>
                <p className="mt-1 break-all text-left text-sm text-slate-900">
                  {provider.email}
                </p>
              </div>

              <div className="min-w-0 text-left">
                <p className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Specialty
                </p>
                <p className="mt-1 text-left text-sm text-slate-900">
                  {provider.specialty}
                </p>
              </div>

              <div className="min-w-0 text-left sm:col-span-2">
                <p className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Address
                </p>
                <p className="mt-1 text-left text-sm text-slate-900">
                  {provider.street_address}
                </p>
                <p className="text-left text-sm text-slate-900">
                  {provider.city}, {provider.state} {provider.postal_code}
                </p>
              </div>
            </div>
          </div>

          {/* Risk Summary */}
          <div className="grid grid-cols-1 gap-4 border-b border-gray-200 bg-gray-50 px-5 py-5 sm:grid-cols-3 sm:px-6">
            <div className="text-left">
              <p className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                NPI
              </p>
              <p className="mt-1 text-left font-medium text-slate-900">
                {provider.npi_number}
              </p>
            </div>

            <div className="text-left">
              <p className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Risk Score
              </p>
              <p className="mt-1 text-left text-xl font-bold text-slate-900">
                {provider.risk_score}
              </p>
            </div>

            <div className="text-left">
              <p className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Risk Level
              </p>
              <p className="mt-1 text-left font-semibold capitalize text-slate-900">
                {provider.risk_level}
              </p>
            </div>
          </div>

          {/* Risk Indicators */}
          <div className="px-5 py-5 text-left sm:px-6">
            <h3 className="text-left text-lg font-semibold text-slate-900">
              Risk Indicators
            </h3>

            <p className="mt-1 text-left text-sm text-gray-500">
              Factors that contributed to this provider's risk score.
            </p>

            <div className="mt-5 space-y-3">
              {provider.flags.length === 0 ? (
                <div className="rounded-lg bg-green-50 p-4 text-left text-sm text-green-700">
                  No fraud risk indicators were detected.
                </div>
              ) : (
                provider.flags.map((flag, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-left"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1 text-left">
                        <p className="text-left font-semibold text-slate-900">
                          {flag.rule_name}
                        </p>

                        <p className="mt-1 text-left text-sm text-gray-600">
                          {flag.description}
                        </p>
                      </div>

                      <span className="shrink-0 whitespace-nowrap rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                        +{flag.score_weight}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 justify-end border-t border-gray-200 px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-blue-500 px-5 py-2 text-sm font-medium text-white hover:bg-blue-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
