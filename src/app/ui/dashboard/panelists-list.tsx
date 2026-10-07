import { fetchPanelists } from "../../lib/data";
import ReviewStatusSelect from "./ReviewStatusSelect";
import FlagsModal from "./FlagsModal";


export default async function PanelistList({
    riskLevel,
    }: {
        riskLevel?: string;
    }) {
    const panelists = await fetchPanelists(riskLevel);

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
                                <th scope="col" className="px-3 py-3 font-medium">
                                    City
                                </th>
                                <th scope="col" className="px-3 py-5 font-medium">                                    
                                    Email
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
                                    <td className="whitespace-nowrap px-3 py-3">
                                        <p>{panelist.specialty}</p>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3">
                                        <p>{panelist.city}</p>
                                    </td>
                                    
                                    <td className="whitespace-nowrap px-3 py-3">
                                        <p>{panelist.email}</p>                                    
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