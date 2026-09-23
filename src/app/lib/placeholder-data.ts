import {
  UserData,
  CsvUploadData,
  FraudRuleData,
  PanelistData,
  PanelistFlagData,
} from './definitions';

export const placeholderUsers: UserData[] = [
  {
    full_name: 'Carlos Medina',
    email: 'admin@example.com',
    password: 'Password123!',
    role: 'admin',
  },
];

export const placeholderCsvUploads: CsvUploadData[] = [
  {
    project_name: 'Q3 Cardiology Panel Audit',
    company_name: 'HealthData Corp',
    upload_year: 2026,
    raw_file_path: '/uploads/raw/q3_cardio_2026.csv',
    file_size_bytes: 204800,
    initial_participant_count: 50,
    fraudulent_participant_count: 10,
  },
];

export const placeholderFraudRules: FraudRuleData[] = [
  {
    rule_code: 'NPI_INVALID',
    rule_name: 'Invalid NPI Checksum',
    category: 'npi_check',
    description: 'NPI number fails 10-digit Luhn algorithm validation.',
    risk_score_weight: 25.0,
    severity_level: 'high',
    is_active: true,
  },
];

export const placeholderPanelists: PanelistData[] = [
  {
    first_name: 'John',
    last_name: 'Doe',
    email: 'johndoe@example.com',
    phone_number: '555-0199',
    npi_number: '1234567890',
    specialty: 'Cardiology',
    practice_name: 'City Heart Clinic',
    street_address: '123 Main St',
    city: 'Austin',
    state: 'TX',
    postal_code: '78701',
    ip_address: '192.168.1.45',
    risk_score: 25.0,
    risk_level: 'medium',
    review_status: 'pending',
  },
];

export const placeholderPanelistFlags: PanelistFlagData[] = [
  {
    rule_code: 'NPI_INVALID',
    explanation: 'Provided NPI failed Luhn validation during automatic check.',
  },
];