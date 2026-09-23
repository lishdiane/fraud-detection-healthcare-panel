-- 1. Create Enumerated Check Constraints or ENUM Types (Optional)
-- In PostgreSQL, VARCHAR with CHECK constraints is clean and easily extensible.

-- ==========================================
-- Table: users
-- ==========================================
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'reviewer' CHECK (role IN ('admin', 'reviewer')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- Table: csv_uploads
-- ==========================================
CREATE TABLE csv_uploads (
    upload_id SERIAL PRIMARY KEY,
    project_name VARCHAR(150) NOT NULL,
    company_name VARCHAR(150),
    upload_year SMALLINT NOT NULL,
    raw_file_path VARCHAR(500) NOT NULL,
    cleaned_file_path VARCHAR(500),
    file_size_bytes BIGINT,
    initial_participant_count INT NOT NULL DEFAULT 0,
    fraudulent_participant_count INT DEFAULT 0,
    uploaded_by_user_id INT NOT NULL,
    reviewed_by_user_id INT,
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_csv_uploads_uploader 
        FOREIGN KEY (uploaded_by_user_id) REFERENCES users(user_id) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_csv_uploads_reviewer 
        FOREIGN KEY (reviewed_by_user_id) REFERENCES users(user_id) 
        ON DELETE SET NULL ON UPDATE CASCADE
);

-- ==========================================
-- Table: fraud_rules
-- ==========================================
CREATE TABLE fraud_rules (
    rule_id SERIAL PRIMARY KEY,
    rule_code VARCHAR(50) NOT NULL UNIQUE,
    rule_name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('npi_check', 'duplicate', 'location', 'ip_address', 'formatting')),
    description TEXT,
    risk_score_weight NUMERIC(5,2) NOT NULL DEFAULT 10.00,
    severity_level VARCHAR(20) DEFAULT 'medium' CHECK (severity_level IN ('low', 'medium', 'high', 'critical')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- Table: panelists
-- ==========================================
CREATE TABLE panelists (
    panelist_id SERIAL PRIMARY KEY,
    upload_id INT NOT NULL,
    reviewed_by_user_id INT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone_number VARCHAR(30),
    npi_number VARCHAR(10),
    specialty VARCHAR(150),
    practice_name VARCHAR(200),
    street_address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    postal_code VARCHAR(20),
    ip_address VARCHAR(45) NOT NULL,
    risk_score NUMERIC(5,2) DEFAULT 0.00,
    risk_level VARCHAR(20) DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    review_status VARCHAR(20) DEFAULT 'pending' CHECK (review_status IN ('pending', 'reviewed', 'approved', 'fraudulent')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_panelist_upload 
        FOREIGN KEY (upload_id) REFERENCES csv_uploads(upload_id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_panelist_reviewer 
        FOREIGN KEY (reviewed_by_user_id) REFERENCES users(user_id) 
        ON DELETE SET NULL ON UPDATE CASCADE
);

-- Indexes for frequent queries
CREATE INDEX idx_panelists_email ON panelists(email);
CREATE INDEX idx_panelists_npi ON panelists(npi_number);
CREATE INDEX idx_panelists_ip ON panelists(ip_address);

-- ==========================================
-- Table: panelist_flags
-- ==========================================
CREATE TABLE panelist_flags (
    flag_id SERIAL PRIMARY KEY,
    panelist_id INT NOT NULL,
    rule_id INT NOT NULL,
    explanation TEXT NOT NULL,
    flagged_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_flags_panelist 
        FOREIGN KEY (panelist_id) REFERENCES panelists(panelist_id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_flags_rule 
        FOREIGN KEY (rule_id) REFERENCES fraud_rules(rule_id) 
        ON DELETE RESTRICT ON UPDATE CASCADE
);