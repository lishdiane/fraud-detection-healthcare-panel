'use client';

import { useState } from 'react';
import { fetchFlagsByPanelistId } from '../../lib/actions';

interface FlagsModalProps {
    panelistId: number;
    panelistName: string;
}

export default function FlagsModal({ panelistId, panelistName }: FlagsModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [flags, setFlags] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const handleOpen = async () => {
        setIsOpen(true);
        setLoading(true);
        try {
            const data = await fetchFlagsByPanelistId(panelistId);
            setFlags(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={handleOpen}
                className="text-blue-600 hover:underline font-medium text-xs md:text-sm"
            >
                See flags
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
                        <div className="flex items-center justify-between border-b pb-3">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Flags for {panelistName}
                            </h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-gray-600 font-bold text-xl"
                            >
                                &times;
                            </button>
                        </div>

                        <div className="mt-4 max-h-80 overflow-y-auto">
                            {loading ? (
                                <p className="text-sm text-gray-500 py-4 text-center">Loading flags...</p>
                            ) : flags.length === 0 ? (
                                <p className="text-sm text-gray-500 py-4 text-center">No flags found for this panelist.</p>
                            ) : (
                                <ul className="divide-y divide-gray-200">
                                    {flags.map((flag) => (
                                        

                                        <li key={flag.flag_id || flag.id} className="py-3 text-sm">
                                            <div className="flex items-center justify-between font-medium text-gray-900">
                                                <span>Rule # {flag.rule_id}</span>
                                                <span className="text-xs text-gray-400"> Flag ID: {flag.flag_id}</span>
                                            </div>
                                            <p className="mt-1 text-gray-700 text-sm leading-relaxed">{flag.explanation}</p>
                                            
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}