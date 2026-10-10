'use client';

import { useState } from 'react';
import {useRouter} from 'next/navigation';

export default function VerifyGeoButton() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleVerify = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/geolocation', {method: 'POST',});

            const data = await response.json();

            if (data.success) {
                // Triggers Next.js Server Components to re-fresh getDashboardParticipants()
                router.refresh();
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
        <button 
          onClick={handleVerify}
          disabled={loading}
          className="rounded-lg border-2 border-solid p-2 m-2 bg-blue-500 text-white" >
          {loading ? 'Evaluating...': 'Evaluate geolocation'}
        </button>
        
    );
}