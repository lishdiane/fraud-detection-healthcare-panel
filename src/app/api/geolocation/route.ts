import { NextResponse } from "next/server";
import { processPanelistGeolocation } from "../../lib/geolocation-processor";

export async function POST() {
    try {
        console.log('API /api/geolocation triggered...');
        const result = await processPanelistGeolocation(50);
        return NextResponse.json({
            success: true,
            message: `Processed ${result.processed} panelists.`,
        });
    } catch (error) {
        console.error('CRITICAL ERROR in /api/geolocation:', error);
        return NextResponse.json(
            { success: false, 
              error: 'Failed to execute geolocation evaluation.',
              details: error.message || String(error) 
            },
            { status: 500 }
        );
    }
}