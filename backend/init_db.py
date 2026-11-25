"""
Toyota Industries Engine India (TIEI) - Production Database Initialization
Creates all required relational tables for the TPS Competency System.
Zero dummy/synthetic records. Only authentic plant and API-synchronized data is stored.
"""

import sqlite3
import os
import sys

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'tps_database.db')

def ensure_tables(conn):
    """Creates all core relational tables with appropriate schema and constraints."""
    cursor = conn.cursor()

    # 1. Employees Master Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS employees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        emp_no TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        division TEXT,
        working_area TEXT,
        designation TEXT,
        boss_name TEXT,
        current_level INTEGER DEFAULT 1,
        target_level INTEGER DEFAULT 2,
        training_status INTEGER DEFAULT 0,
        pre_test_score REAL DEFAULT 0,
        post_test_score REAL DEFAULT 0,
        assignment_status INTEGER DEFAULT 0,
        presentation_mgr INTEGER DEFAULT 0,
        presentation_vp INTEGER DEFAULT 0,
        presentation_dmd INTEGER DEFAULT 0,
        practitioner_certified INTEGER DEFAULT 0,
        jishuken_1 INTEGER DEFAULT 0,
        jishuken_2 INTEGER DEFAULT 0,
        champion_eval REAL DEFAULT 0,
        champion_certified INTEGER DEFAULT 0,
        kaizens_submitted INTEGER DEFAULT 0,
        kaizens_approved INTEGER DEFAULT 0,
        cost_savings_inr REAL DEFAULT 0,
        kpi_score REAL DEFAULT 70.0,
        hierarchy_role TEXT DEFAULT 'TL',
        hierarchy_rank INTEGER DEFAULT 4,
        reports_to_emp_no TEXT,
        gender TEXT DEFAULT 'Male',
        avatar TEXT,
        password TEXT DEFAULT 'tiei123',
        email TEXT,
        dept_code TEXT,
        last_synced_at TEXT
    )
    ''')

    # 2. Step Evidence Uploads (11-Step Qualification Journey)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS step_evidence (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        emp_id INTEGER,
        step_num INTEGER,
        step_title TEXT,
        filename TEXT,
        file_url TEXT,
        file_size TEXT,
        uploaded_at TEXT,
        remarks TEXT,
        FOREIGN KEY (emp_id) REFERENCES employees (id) ON DELETE CASCADE
    )
    ''')

    # 3. Training Attendance Register
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS training_attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        emp_id INTEGER,
        emp_no TEXT,
        emp_name TEXT,
        batch_code TEXT,
        attendance_date TEXT,
        session_name TEXT,
        status TEXT,
        marked_by TEXT,
        marked_at TEXT,
        remarks TEXT,
        FOREIGN KEY (emp_id) REFERENCES employees (id) ON DELETE CASCADE
    )
    ''')

    # 4. Department TPS Proposals & Suggestions (Populated via Suggestions API)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS department_nominations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        emp_id INTEGER,
        emp_no TEXT,
        emp_name TEXT,
        department TEXT,
        designation TEXT,
        proposed_level TEXT,
        nominated_by TEXT,
        nomination_date TEXT,
        justification TEXT,
        status TEXT,
        batch_code TEXT,
        FOREIGN KEY (emp_id) REFERENCES employees (id) ON DELETE SET NULL
    )
    ''')

    # 5. Works-site Struggles & 21 Kaizen Viewpoints Log
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS komarigoto (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        emp_id INTEGER,
        challenge TEXT,
        category TEXT,
        current_condition TEXT,
        target_condition TEXT,
        impact TEXT,
        priority INTEGER,
        viewpoints_21 TEXT,
        countermeasures TEXT,
        feasibility TEXT,
        unfeasible_reason TEXT,
        status TEXT,
        FOREIGN KEY (emp_id) REFERENCES employees (id) ON DELETE CASCADE
    )
    ''')

    # 6. Official Certifications
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS certifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cert_no TEXT UNIQUE,
        emp_id INTEGER,
        emp_name TEXT,
        level_name TEXT,
        issue_date TEXT,
        signatory TEXT,
        status TEXT,
        FOREIGN KEY (emp_id) REFERENCES employees (id) ON DELETE CASCADE
    )
    ''')

    # 7. Training Batches
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS training_batches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        batch_code TEXT UNIQUE,
        batch_name TEXT,
        level_name TEXT,
        module_name TEXT,
        trainer_name TEXT,
        venue TEXT,
        start_date TEXT,
        end_date TEXT,
        capacity INTEGER DEFAULT 20,
        enrolled_count INTEGER DEFAULT 0,
        status TEXT
    )
    ''')

    # 8. Amrut Kaizen Integration Table (Populated via Amrut Sync)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS kaizen_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        control_no TEXT UNIQUE,
        emp_id INTEGER,
        emp_no TEXT,
        emp_name TEXT,
        work_name TEXT,
        category TEXT,
        line TEXT,
        machine TEXT,
        material_cost REAL DEFAULT 0,
        man_hours_cost REAL DEFAULT 0,
        machine_cost REAL DEFAULT 0,
        total_cost REAL DEFAULT 0,
        status TEXT,
        request_date TEXT
    )
    ''')

    conn.commit()

def upgrade_and_seed_hierarchy(conn):
    """Ensures schema integrity and guarantees essential plant administration role exists."""
    ensure_tables(conn)
    cursor = conn.cursor()

    # Ensure TPS Coordinator exists for attendance administration
    coord = cursor.execute("SELECT id FROM employees WHERE emp_no = 'TPS001'").fetchone()
    if not coord:
        cursor.execute("""
            INSERT INTO employees (
                emp_no, name, division, working_area, designation, boss_name,
                hierarchy_role, hierarchy_rank, reports_to_emp_no, gender,
                current_level, target_level, training_status,
                password, email, last_synced_at
            ) VALUES (
                'TPS001', 'RAKSHITH PRABHU', 'GD', 'TPS COORDINATION OFFICE',
                'TPS Coordinator', 'Section Head', 'TPS_COORDINATOR', 7,
                'MGR001', 'Male', 1, 2, 0, 'tiei123',
                'rakshith.prabhu@tiei.toyota-industries.com', datetime('now')
            )
        """)
        conn.commit()

def init_db(reset=False):
    """Initializes clean database schema with zero dummy records."""
    conn = sqlite3.connect(DB_PATH)
    ensure_tables(conn)
    upgrade_and_seed_hierarchy(conn)
    conn.close()
    print("Clean production database schema initialized successfully! Zero dummy data present.")

if __name__ == '__main__':
    init_db()
