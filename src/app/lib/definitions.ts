export interface UserData {
  user_id?: number;
  full_name: string;
  email: string;
  password: string;
  role: 'admin' | 'reviewer';
}

export interface CsvUploadData {
  project_name: string;
  company_name: string;
  upload_year: number;
  raw_file_path: string;
  cleaned_file_path?: string;
  file_size_bytes: number;
  initial_participant_count: number;
  fraudulent_participant_count: number;
}

export interface FraudRuleData {
  rule_code: string;
  rule_name: string;
  category: 'npi_check' | 'duplicate' | 'location' | 'ip_address' | 'formatting';
  description: string;
  risk_score_weight: number;
  severity_level: 'low' | 'medium' | 'high' | 'critical';
  is_active: boolean;
}

export interface PanelistData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  npi_number: string;
  specialty: string;
  practice_name: string;
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  ip_address: string;
  risk_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  review_status: 'pending' | 'reviewed' | 'approved' | 'fraudulent';
  ip_latitude?: number;
  ip_longitude?: number;
  ip_city?: string;
  ip_state?: string;
  ip_country?: string;
  is_proxy_or_vpn?: boolean;
  distance_to_practice_miles?: number;
}

export interface PanelistFlagData {
  rule_code: string; // Used to look up rule_id dynamically
  explanation: string;
}