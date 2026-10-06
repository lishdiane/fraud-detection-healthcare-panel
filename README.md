# Healthcare Panel Fraud Detection

Healthcare Panel Fraud Detection is a web application designed to help healthcare market research panels identify potentially duplicate, suspicious, or inconsistent provider registrations.

The application processes provider data from CSV files, verifies healthcare provider information against NPI data, detects duplicate records, analyzes IP/geolocation information, and calculates an explainable fraud risk score for each participant.

Risk indicators are intended to identify records that may require additional review and should not be interpreted as definitive evidence of fraud.

## Live Application

The application is deployed on Vercel:

https://fraud-detection-healthcare-panel.vercel.app/dashboard

## Features

### Import & Validation

Provider records can be uploaded in CSV or Excel (.xlsx) format.

The application validates required participant information before processing the records, including:

- First and last name
- Email
- Phone
- Address
- City, state, and ZIP code
- NPI
- Specialty
- IP address

### NPI Verification

Provider information is verified using data from the National Plan and Provider Enumeration System (NPPES).

The application checks:

- Whether the submitted NPI is valid
- Whether the provider name matches the NPI record
- Whether the submitted specialty matches the provider's NPI taxonomy

Discrepancies generate risk indicators that can contribute to the provider's overall risk score.

### Duplicate Detection

New participant records are compared with existing records to identify potentially duplicated registration information.

Duplicate detection includes:

- Name
- Email
- Phone number
- NPI
- IP address

Duplicate information is treated as a risk indicator rather than an automatic fraud determination.

### IP & Geolocation Analysis

Participant IP information is analyzed for geographic inconsistencies.

Geolocation analysis can identify indicators such as:

- Significant distance between the IP location and reported practice location
- IP addresses originating outside the expected country
- Suspicious location discrepancies

IP geolocation is approximate and is evaluated alongside the application's other fraud indicators.

### Fraud Rules

Detected issues are associated with configurable fraud rules stored in the database.

Rules contain information including:

- Rule code
- Rule name
- Category
- Description
- Risk score weight
- Severity
- Active status

Examples include duplicate email, duplicate NPI, invalid NPI, NPI name mismatch, NPI specialty mismatch, and location discrepancies.

### Risk Scoring

Triggered fraud rules contribute weighted points toward the participant's overall risk score.

Scores are capped at 100 and assigned a risk classification:

| Score | Risk Level |
| ---: | --- |
| 0–24 | Low |
| 25–49 | Medium |
| 50–74 | High |
| 75–100 | Critical |

The application also displays the individual risk indicators that contributed to the score, allowing reviewers to understand why a record was flagged.

### Dashboard & Review

Processed provider records are displayed in a centralized dashboard.

The dashboard includes:

- Provider name
- NPI
- Specialty
- Location
- Email
- Risk score
- Risk level
- Review status
- Triggered fraud indicators

Users can view detailed fraud results for individual providers and review the rules that contributed to their risk score.

Providers can also be filtered by risk level to help prioritize records for review.

### Authentication

Application data is restricted to authenticated users.

The application uses password hashing, session-based authentication, and protected application routes.

## Technology Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js |
| Frontend | React, TypeScript |
| Styling | Tailwind CSS |
| Backend | Next.js Server Actions, TypeScript |
| Database | PostgreSQL |
| Database Hosting | Neon |
| Provider Verification | NPPES NPI Registry API |
| Geolocation | IP Geolocation API |
| Deployment | Vercel |
| Version Control | GitHub |

## Processing Flow

```text
CSV Upload
    ↓
Data Validation
    ↓
NPI Verification
    ↓
Database Storage
    ↓
Duplicate Detection
    ↓
IP / Geolocation Analysis
    ↓
Fraud Rule Evaluation
    ↓
Risk Scoring
    ↓
Dashboard Review
```

Each detection step can generate risk indicators. Indicators are stored with the participant record and contribute to the participant's overall risk score.

## Test Data

A sample CSV is included in the repository for testing the application's fraud detection functionality.

The test data contains controlled scenarios including:

- Clean provider records
- Duplicate emails
- Duplicate phone numbers
- Duplicate NPIs
- Duplicate IP addresses
- Invalid NPIs
- NPI name mismatches
- NPI specialty mismatches
- Geographic discrepancies
- Records containing multiple simultaneous risk indicators

The sample data is intended for application testing and demonstration purposes.

**Sample CSV:** [`sample-data/test-providers.csv`](sample-data/test-providers.csv)

## Limitations

Healthcare Panel Fraud Detection is a screening and review tool.

Duplicate information may have legitimate explanations, NPI discrepancies do not necessarily indicate fraudulent activity, and IP-based geolocation provides approximate location information. Risk classifications also depend on the configured rules, weights, and thresholds.

Flagged records should therefore be reviewed by a user before any conclusions are made.

## Team Information

Diane Lish 
Lievelyn Zapata 
Carlos Medina 