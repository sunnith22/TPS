-- TIEI TPS Competency Development & Learning Management System
-- PostgreSQL Production Schema

CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    emp_no VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    division VARCHAR(50) DEFAULT 'GD',
    working_area VARCHAR(50) DEFAULT 'HEAD',
    designation VARCHAR(50) DEFAULT 'Z10',
    boss_name VARCHAR(100) DEFAULT 'TPS Office',
    
    -- TPS Competency Levels (1=Foundation, 2=Practitioner, 3=Champion, 4=Master)
    current_level INT DEFAULT 1,
    target_level INT DEFAULT 2,
    
    -- 11-Step Journey Milestones
    training_status INT DEFAULT 0, -- 0=Not Started, 1=Scheduled, 2=Completed
    pre_test_score NUMERIC(5,2) DEFAULT 0.0,
    post_test_score NUMERIC(5,2) DEFAULT 0.0,
    assignment_status INT DEFAULT 0, -- 0=Pending, 1=Draft, 2=Submitted, 3=Approved
    
    presentation_mgr INT DEFAULT 0, -- 0 or 2
    presentation_vp INT DEFAULT 0,  -- 0 or 2
    presentation_dmd INT DEFAULT 0, -- 0 or 2
    
    practitioner_certified INT DEFAULT 0, -- 0 or 1
    jishuken_1 INT DEFAULT 0, -- 0 or 1
    jishuken_2 INT DEFAULT 0, -- 0 or 1
    champion_eval NUMERIC(5,2) DEFAULT 0.0,
    champion_certified INT DEFAULT 0, -- 0 or 1
    
    -- Amrut Kaizen & Performance Integration
    kaizens_submitted INT DEFAULT 0,
    kaizens_approved INT DEFAULT 0,
    cost_savings_inr NUMERIC(12,2) DEFAULT 0.0,
    kpi_score NUMERIC(5,2) DEFAULT 75.0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS komarigoto (
    id SERIAL PRIMARY KEY,
    emp_id INT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    challenge VARCHAR(255) NOT NULL,
    category VARCHAR(10) DEFAULT 'P', -- S, E, Q, P, C
    current_condition TEXT,
    target_condition TEXT,
    impact TEXT,
    priority INT DEFAULT 1,
    viewpoints_21 VARCHAR(100), -- Comma-separated KVP IDs
    countermeasures TEXT,
    feasibility VARCHAR(50) DEFAULT 'Feasible',
    unfeasible_reason TEXT,
    status VARCHAR(50) DEFAULT 'Identified', -- Identified, In Progress, Implemented, Standardized
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS certifications (
    id SERIAL PRIMARY KEY,
    cert_no VARCHAR(100) UNIQUE NOT NULL,
    emp_id INT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    emp_name VARCHAR(100) NOT NULL,
    level_name VARCHAR(100) NOT NULL,
    issue_date VARCHAR(50) NOT NULL,
    signatory VARCHAR(100) DEFAULT 'Antony John Sudhakar P (VP)',
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS training_batches (
    id SERIAL PRIMARY KEY,
    batch_code VARCHAR(50) UNIQUE NOT NULL,
    level_name VARCHAR(100) NOT NULL,
    module_name VARCHAR(200) NOT NULL,
    trainer_name VARCHAR(100) NOT NULL,
    venue VARCHAR(100) DEFAULT 'TIEI TPS Dojo Room A',
    start_date VARCHAR(50) NOT NULL,
    end_date VARCHAR(50) NOT NULL,
    capacity INT DEFAULT 20,
    enrolled_count INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS kaizen_requests (
    id SERIAL PRIMARY KEY,
    control_no VARCHAR(50) UNIQUE NOT NULL,
    emp_id INT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    emp_name VARCHAR(100) NOT NULL,
    work_name VARCHAR(255) NOT NULL,
    category VARCHAR(50) DEFAULT 'Productivity',
    line VARCHAR(50) DEFAULT 'GD HEAD',
    machine VARCHAR(50) DEFAULT 'MILLING',
    material_cost NUMERIC(10,2) DEFAULT 0.0,
    man_hours_cost NUMERIC(10,2) DEFAULT 0.0,
    machine_cost NUMERIC(10,2) DEFAULT 0.0,
    total_cost NUMERIC(10,2) DEFAULT 0.0,
    status VARCHAR(50) DEFAULT 'Approved',
    request_date VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_employees_area ON employees(working_area);
CREATE INDEX IF NOT EXISTS idx_employees_level ON employees(current_level);
CREATE INDEX IF NOT EXISTS idx_komarigoto_emp ON komarigoto(emp_id);
CREATE INDEX IF NOT EXISTS idx_certifications_no ON certifications(cert_no);
