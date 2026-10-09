import { fetchPanelists } from "../../lib/data";
import ReviewStatusSelect from "./ReviewStatusSelect";
import FlagsModal from "./FlagsModal";


export default async function PanelistList({
    riskLevel,
    }: {
        riskLevel?: string;
    }) {
    const panelists = await fetchPanelists(riskLevel);

    // Early return for empty state
    if (!panelists || panelists.length === 0) {
        return (
            <div className="mt-6 flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                    <svg
                        className="h-6 w-6 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                        />
                    </svg>
                </div>
                <h3 className="mt-2 text-sm font-semibold text-gray-900">No panelists found</h3>
                <p className="mt-1 text-sm text-gray-500">
                    You haven't uploaded any panelist data yet. Upload a CSV file to begin fraud evaluation.
                </p>
            </div>
        );
    }

    return (
        <div className="mt-6 flow-root">
            <div className="inline-block min-w-full align-middle">
                <div className="rounded-lg by-gray-50 p-2 md:pt-0">
                    <div className="md:hidden">
                        {panelists?.map((panelist)=>(
                            <div
                             key={panelist.panelist_id}
                             className="mb-2 w-full rounded-md bg-white p-4">
                                <div className="flex items-center justify-between border-b pb-4">
                                    <div>
                                        <div className="mb-2 flex items-center">
                                            <p>{panelist.first_name} {panelist.last_name}</p>
                                        </div>
                                    </div>

                                </div>
                                <div className="flex w-full items-center justify-between pt-4">
                                    <div>
                                        <p className="tex-xl font-medium">
                                            {panelist.npi_number}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="tex-xl font-medium">
                                            {panelist.specialty}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="tex-xl font-medium">
                                            {panelist.city}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="tex-xl font-medium">
                                            {panelist.email}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="tex-xl font-medium">
                                            {panelist.risk_score}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="tex-xl font-medium">
                                            {panelist.risk_level}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="tex-xl font-medium">
                                            {panelist.review_status}
                                        </p>
                                    </div>
                                    <div className="flex w-full items-center justify-between pt-4">
                                        <div>
                                            <p className="text-xs text-gray-500">Status</p>
                                            <ReviewStatusSelect 
                                            panelistId={panelist.panelist_id} 
                                            currentStatus={panelist.review_status} 
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <FlagsModal panelist={panelist} />
                                    </div>
                                </div>
                             </div>
                        ))}
                    </div>
                    <table className="hidden min-w-full text-gray-900 md:table">
                        <thead className="rounded-lg text-left text-sm font-normal">
                            <tr>
                                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                                    Full Name
                                </th>
                                <th scope="col" className="px-3 py-3 font-medium">
                                    NPI
                                </th>
                                <th scope="col" className="px-3 py-3 font-medium">
                                    Specialty
                                </th>
                                <th scope="col" className="px-3 py-5 font-medium">                                    
                                    Risk Score
                                </th>
                                <th scope="col" className="px-3 py-5 font-medium">                                    
                                    Risk Level
                                </th>
                                <th scope="col" className="px-3 py-5 font-medium">                                    
                                    Review Status
                                </th>
                                <th scope="col" className="px-3 py-5 font-medium">                                    
                                    Flags
                                </th>                               
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {panelists?.map((panelist)=>(
                                <tr
                                 key={panelist.panelist_id}
                                 className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                                >
                                    <td className="whitespace-nowrap py-3 pl-6 pr-3">
                                        <p>{panelist.first_name} {panelist.last_name}</p>                                       
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3">
                                        <p>{panelist.npi_number}</p>
                                    </td>
                                    <td className="whitespace px-3 py-3">
                                        <p>{panelist.specialty}</p>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3">
                                        <p>{panelist.risk_score}</p>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3">
                                        <p>{panelist.risk_level}</p>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3">
                                        <ReviewStatusSelect 
                                            panelistId={panelist.panelist_id} 
                                            currentStatus={panelist.review_status} 
                                        />
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3">
                                        <FlagsModal 
                                        panelist={panelist}
                                        />
                                    </td> 
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}