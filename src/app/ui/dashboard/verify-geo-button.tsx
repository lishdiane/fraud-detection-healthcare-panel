'use client';

import { useState } from 'react';
import {useRouter} from 'next/navigation';

interface FailureReason {
    ip: string;
    reason: string;
}

interface EvaluationResult {
  total: number;
  sucessprocessed: number;
  failed: number;
  failures: FailureReason[];

}

export default function VerifyGeoButton() {
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState<EvaluationResult | null>(null);
    const router = useRouter();

    const handleVerify = async () => {
        setLoading(true);
        setSummary(null);
        try {
            const response = await fetch('/api/geolocation', {method: 'POST',});

            const data = await response.json();

            if (data.success) {
                // Triggers Next.js Server Components to re-fresh getDashboardParticipants()
                router.refresh();
                setSummary({
                    total: data.total ?? 0,
                    sucessprocessed: data.sucessprocessed ?? 0,
                    failed: data.failed ?? 0,
                    failures: data.failures ?? [],
                });
                alert(`Geolocation evaluation executed successfully. ${data.processed ?? 0} panelists processed.`);
            } else {
                alert(`Error: ${data.details || data.error}`);
            }
        } catch (err) {
            console.error('Failed to trigger geolocation execution: ', err);
            alert('Network error during evaluation execution.');
        } finally {
            setLoading(false);
        }
    };

    return (


        <div className="flex flex-col items-start gap-3 m-2">
            <button 
              onClick={handleVerify}
              disabled={loading}
              className="rounded-lg border-2 border-solid p-2 bg-blue-500 text-white disabled:opacity-50 font-medium hover:bg-blue-600 transition"
            >
              {loading ? 'Evaluating Geolocation...' : 'Evaluate geolocation'}
            </button>

            {/* Geolocation Process Summary Card */}
            {summary && (
                <div className="w-full max-w-xl rounded-xl border border-gray-200 bg-white p-4 shadow-sm text-sm text-gray-800">
                    <h3 className="font-semibold text-base text-gray-900 mb-2">Geolocation Batch Summary</h3>
                    
                    <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                        <div className="bg-gray-50 p-2 rounded-lg border">
                            <span className="block text-gray-500 text-xs">Total Evaluated</span>
                            <span className="font-bold text-lg text-gray-800">{summary.total}</span>
                        </div>
                        <div className="bg-green-50 p-2 rounded-lg border border-green-200">
                            <span className="block text-green-700 text-xs">Successful</span>
                            <span className="font-bold text-lg text-green-700">{summary.sucessprocessed}</span>
                        </div>
                        <div className="bg-amber-50 p-2 rounded-lg border border-amber-200">
                            <span className="block text-amber-700 text-xs">Unsuccessful</span>
                            <span className="font-bold text-lg text-amber-700">{summary.failed}</span>
                        </div>
                    </div>

                    {summary.failures.length > 0 && (
                        <div className="mt-3">
                            <h4 className="font-medium text-xs text-gray-500 uppercase tracking-wider mb-1">Unsuccessful Records & Reasons</h4>
                            <ul className="space-y-1 bg-gray-50 p-2 rounded-lg border max-h-40 overflow-y-auto">
                                {summary.failures.map((item, idx) => (
                                    <li key={idx} className="text-xs flex justify-between border-b last:border-0 pb-1 pt-1">
                                        <span className="font-mono text-gray-600">{item.ip}</span>
                                        <span className="text-red-600 font-medium text-right">{item.reason}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
        
}