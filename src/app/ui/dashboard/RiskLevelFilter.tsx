"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function RiskLevelFilter() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentRisk = searchParams.get("risk") ?? "all";

    function handleChange(value: string) {
        const params = new URLSearchParams(searchParams.toString());

        if (value === "all") {
            params.delete("risk");
        } else {
            params.set("risk", value);
        }

        const queryString = params.toString();

        router.push(queryString ? `${pathname}?${queryString}` : pathname);
    }

    return (
        <div className="mb-6">
            <label htmlFor="risk-level" className="mb-2 block text-sm font-medium text-gray-700">
                Filter by Risk Level
            </label>

            <select
                id="risk-level"
                value={currentRisk}
                onChange={(event) => handleChange(event.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none">

                <option value="all">All Risk Levels</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
                </select>
        </div>
    );
}