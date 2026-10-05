'use client';

import { useTransition } from "react";
import { updateReviewStatus } from "../../lib/actions";

interface Props {
    panelistId: number;
    currentStatus: string;
}

const STATUS_OPTIONS = ['pending', 'reviewed', 'approved', 'fraudulent'];

export default function ReviewStatusSelect({panelistId, currentStatus}: Props) {
    const [isPending, startTransition] = useTransition();

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value;
        startTransition(async () => {
            await updateReviewStatus(panelistId, newStatus);
        })
    };

    return (
        <select
         value = {currentStatus || 'pending'}
         onChange= {handleChange}
         disabled= {isPending}
         className= {`rounded-md border px-2 py-1 text-xs font-medium focus:outline-none focus:ring-2 ${
                isPending ? 'opacity-50' : 'opacity-100'
            }`} 
        >
            {STATUS_OPTIONS.map((status)=> (
                <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
            ))}
        </select>
    );
}