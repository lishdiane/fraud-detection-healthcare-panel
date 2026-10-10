/**
 * Calculate the straight-line distance between two geographic coordinates in miles. 
*/


export function calculateHarversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const TO_RAD= Math.PI / 180;
    const EARTH_RADIUS_MILES = 3958.8 // Radius of Earth in miles

    const dLat = (lat2-lat1) * TO_RAD;
    const dLon = (lon2 - lon1) * TO_RAD;

    const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * TO_RAD) *
    Math.cos(lat2 * TO_RAD) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return parseFloat((EARTH_RADIUS_MILES * c).toFixed(2));
}

export interface IpGeoLocationResult {
    ip: string;
    city: string;
    state_prov: string;
    country_name: string;
    latitude: number;
    longitude: number;
    is_proxy: boolean;
    is_vpn: boolean;
    is_tor: boolean;
}

/**
 *Look up IP address geolocation and security attributes via ipgeolocation.id */

export async function fetchIpGeolocation(ipAddress: string): Promise<IpGeoLocationResult | null> {
    const apiKey = process.env.IPGEOLOCATION_API_KEY;

    if (!apiKey) {
        console.error('IPGEOLOCATION_API_KEY is not configured in environment variables.');
        return null;
    }

    try {
        //include security parameter to fetch proxy/vpn details
        const response = await fetch(
            `https://api.ipgeolocation.io/ipgeo?apiKey=${apiKey}&ip=${ipAddress}`,
            {cache: 'force-cache'} //Cache responses to prevent duplicate API hits. 
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`ipgeolocation.io HTTP ${response.status}:`, errorText);
            return null;   
        }

        const data = await response.json();

        return {
            ip: data.ip,
            city: data.city,
            state_prov: data.state_prov,
            country_name: data.country_name,
            latitude: parseFloat(data.latitude),
            longitude: parseFloat(data.longitude),
            is_proxy: false,
            is_vpn: false,
            is_tor: false,
        };

    } catch (error) {
        console.error('Failed to query ipgeolocation.io:', error);
        return null;
    }
}

export interface LocationEvaluation {

    ip_latitude?: number;
    ip_longitude?: number;
    ip_city?: string;
    ip_state?: string;
    ip_country?: string;
    is_proxy_or_vpn: boolean;
    distance_to_practice_miles?: number;
    flags_to_raise: Array<{
      rule_code: 'LOCATION_MISMATCH' | 'FOREIGN_IP' | 'PROXY_VPN_DETECTED';
      explanation: string;
    }>;   
}

export async function geocodePracticeAddress(
    locationQuery: string
): Promise<{lat: number; lon: number} | null> {
    const apiKey = process.env.IPGEOLOCATION_API_KEY;
    if (!apiKey || !locationQuery) return null;

    try {
        const response = await fetch(
            `https://api.ipgeolocation.io/ipgeo?apiKey=${apiKey}&location=${encodeURIComponent(locationQuery)}`,
            { cache: 'force-cache' }
        );

        if (!response.ok) return null;

        const data = await response.json();
        console.log(data);
        if (data.latitude && data.longitude) {
            return {
                lat: parseFloat(data.latitude),
                lon: parseFloat(data.longitude),
            };
        }
    } catch (error) {
        console.warn(`Failed to geocode location: ${locationQuery}`, error);
    }

    return null;
}

/**
 * Evaluates panelist geolocation and calculates Haversine distance
 */

export async function evaluatePanelistLocation(
    ipAddress: string,
    practicePostalCode?: string,
    reportedCountry: string = 'United States'
): Promise<LocationEvaluation> {
    const geo = await fetchIpGeolocation(ipAddress);

    const evaluation : LocationEvaluation = {
        is_proxy_or_vpn: false,
        flags_to_raise: [],
    };

    if (!geo) return evaluation;

    evaluation.ip_latitude = geo.latitude
    evaluation.ip_longitude = geo.longitude;
    evaluation.ip_city = geo.city;
    evaluation.ip_state = geo.state_prov;
    evaluation.ip_country = geo.country_name;
    evaluation.is_proxy_or_vpn = false;

    // Check for Foreign Country Mismatch
    if (geo.country_name && geo.country_name.toLowerCase() !== reportedCountry.toLowerCase()) {
        evaluation.flags_to_raise.push({
            rule_code: 'FOREIGN_IP',
            explanation: `IP country (${geo.country_name}) does not match reported practice country (${reportedCountry}).`,
        });
    }

    // Calculate distance mismatch if practice coordinates are provided
    if (practicePostalCode && geo.latitude && geo.longitude) {
        const practiceCoords = await geocodePracticeAddress(practicePostalCode);
        
        if (practiceCoords) {
            const distance = calculateHarversineDistance(
                geo.latitude,
                geo.longitude,
                practiceCoords.lat,
                practiceCoords.lon
            );

            evaluation.distance_to_practice_miles = distance;

            if (distance > 300) {
                evaluation.flags_to_raise.push({
                    rule_code: 'LOCATION_MISMATCH',
                    explanation: `IP location (${geo.city}, ${geo.state_prov}) is ${distance} miles away from reported practice location (> 300     miles threshold).`,
                });
            }
        }
       
    }

    return evaluation;
}

/**
 * Helper to detect local, private, loopback, or reserved test-net IPs
 */
export function isPrivateOrTestIP(ip: string): boolean {
    if (!ip) return true;
    
    // Normalize and trim
    const trimmed = ip.trim();

    if (
        trimmed === '127.0.0.1' || 
        trimmed === 'localhost' || 
        trimmed === '::1'
    ) {
        return true;
    }
    
    // Check for standard private ranges and RFC 5737 Test-Net ranges
    return (
        trimmed.startsWith('10.') ||
        trimmed.startsWith('192.168.') ||
        trimmed.startsWith('172.16.') ||
        trimmed.startsWith('172.17.') ||
        trimmed.startsWith('172.18.') ||
        trimmed.startsWith('172.19.') ||
        trimmed.startsWith('172.20.') ||
        trimmed.startsWith('172.21.') ||
        trimmed.startsWith('172.22.') ||
        trimmed.startsWith('172.23.') ||
        trimmed.startsWith('172.24.') ||
        trimmed.startsWith('172.25.') ||
        trimmed.startsWith('172.26.') ||
        trimmed.startsWith('172.27.') ||
        trimmed.startsWith('172.28.') ||
        trimmed.startsWith('172.29.') ||
        trimmed.startsWith('172.30.') ||
        trimmed.startsWith('172.31.') ||
        trimmed.startsWith('198.51.100.') || // TEST-NET-2 (Bonnie Bennett's test IP range)
        trimmed.startsWith('192.0.2.')     || // TEST-NET-1
        trimmed.startsWith('203.0.113.')      // TEST-NET-3
    );
}