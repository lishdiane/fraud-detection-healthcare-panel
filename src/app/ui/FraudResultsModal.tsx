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
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-200 p-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Fraud Risk Details
            </h2>

            <p className="mt-1 text-gray-500">
              {provider.first_name} {provider.last_name}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-2xl text-gray-400 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        {/* Provider Summary */}
        <div className="grid grid-cols-3 gap-4 border-b border-gray-200 p-6">
          <div>
            <p className="text-xs font-medium uppercase text-gray-500">NPI</p>

            <p className="mt-1 font-medium text-slate-900">
              {provider.npi_number}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase text-gray-500">
              Risk Score
            </p>

            <p className="mt-1 text-xl font-bold text-slate-900">
              {provider.risk_score}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase text-gray-500">
              Risk Level
            </p>

            <p className="mt-1 font-semibold text-slate-900">
              {provider.risk_level}
            </p>
          </div>
        </div>

        {/* Flags */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-900">
            Risk Indicators
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Factors that contributed to this provider's risk score.
          </p>

          <div className="mt-5 space-y-3">
            {provider.flags.length === 0 ? (
              <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700">
                No fraud risk indicators were detected.
              </div>
            ) : (
              provider.flags.map((flag, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {flag.rule_name}
                      </p>

                      <p className="mt-1 text-sm text-gray-600">
                        {flag.description}
                      </p>
                    </div>

                    <span className="whitespace-nowrap rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                      +{flag.score_weight}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-gray-200 p-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-blue-500/80 px-5 py-2 text-sm font-medium text-white hover:bg-blue-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
