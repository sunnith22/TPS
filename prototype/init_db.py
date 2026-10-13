import sqlite3
import openpyxl
import os
import sys
import random

DB_PATH = os.path.join(os.path.dirname(__file__), 'tps_database.db')
EXCEL_PATH = os.path.join(os.path.dirname(__file__), '..', '001_TPS Journey Visualisation.xlsx')

HIERARCHY_LEADERS = [
    # Level 1: Manager
    {
        "emp_no": "MGR001", "name": "MANUKUMAR G", "division": "GD", "working_area": "ALL (GD Section)",
        "designation": "Section Manager / HOD", "boss_name": "Antony John Sudhakar P (VP)", "hierarchy_role": "Manager",
        "hierarchy_rank": 1, "reports_to_emp_no": "VP001", "gender": "Male",
        "avatar": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80",
        "current_level": 3, "target_level": 4, "training_status": 2, "pre_test_score": 80.0, "post_test_score": 95.0,
        "assignment_status": 2, "presentation_mgr": 2, "presentation_vp": 2, "presentation_dmd": 2,
        "practitioner_certified": 1, "jishuken_1": 1, "jishuken_2": 1, "champion_eval": 95.0, "champion_certified": 1,
        "kaizens_submitted": 18, "kaizens_approved": 15, "cost_savings_inr": 850000.0, "kpi_score": 96.5
    },
    # Level 2: AM (Assistant Manager)
    {
        "emp_no": "AM001", "name": "GOVINDA R", "division": "GD", "working_area": "HEAD & CRANK",
        "designation": "Assistant Manager", "boss_name": "MANUKUMAR G (Manager)", "hierarchy_role": "AM",
        "hierarchy_rank": 2, "reports_to_emp_no": "MGR001", "gender": "Male",
        "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
        "current_level": 3, "target_level": 4, "training_status": 2, "pre_test_score": 75.0, "post_test_score": 92.0,
        "assignment_status": 2, "presentation_mgr": 2, "presentation_vp": 2, "presentation_dmd": 2,
        "practitioner_certified": 1, "jishuken_1": 1, "jishuken_2": 1, "champion_eval": 91.0, "champion_certified": 1,
        "kaizens_submitted": 14, "kaizens_approved": 11, "cost_savings_inr": 480000.0, "kpi_score": 92.4
    },
    {
        "emp_no": "AM002", "name": "KAILASH NATH", "division": "GD", "working_area": "BLOCK & ASSY",
        "designation": "Assistant Manager", "boss_name": "MANUKUMAR G (Manager)", "hierarchy_role": "AM",
        "hierarchy_rank": 2, "reports_to_emp_no": "MGR001", "gender": "Male",
        "avatar": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80",
        "current_level": 2, "target_level": 3, "training_status": 2, "pre_test_score": 70.0, "post_test_score": 88.0,
        "assignment_status": 2, "presentation_mgr": 2, "presentation_vp": 2, "presentation_dmd": 1,
        "practitioner_certified": 1, "jishuken_1": 1, "jishuken_2": 0, "champion_eval": 84.0, "champion_certified": 0,
        "kaizens_submitted": 10, "kaizens_approved": 7, "cost_savings_inr": 290000.0, "kpi_score": 88.0
    },
    # Level 3: GL (Group Leader)
    {
        "emp_no": "GL001", "name": "BINDUKUMAR S", "division": "GD", "working_area": "HEAD",
        "designation": "Group Leader", "boss_name": "GOVINDA R (AM)", "hierarchy_role": "GL",
        "hierarchy_rank": 3, "reports_to_emp_no": "AM001", "gender": "Male",
        "avatar": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&q=80",
        "current_level": 2, "target_level": 3, "training_status": 2, "pre_test_score": 68.0, "post_test_score": 86.0,
        "assignment_status": 2, "presentation_mgr": 2, "presentation_vp": 2, "presentation_dmd": 1,
        "practitioner_certified": 1, "jishuken_1": 1, "jishuken_2": 1, "champion_eval": 88.0, "champion_certified": 0,
        "kaizens_submitted": 12, "kaizens_approved": 9, "cost_savings_inr": 340000.0, "kpi_score": 89.5
    },
    {
        "emp_no": "GL002", "name": "PRASHANTH K", "division": "GD", "working_area": "CRANK",
        "designation": "Group Leader", "boss_name": "GOVINDA R (AM)", "hierarchy_role": "GL",
        "hierarchy_rank": 3, "reports_to_emp_no": "AM001", "gender": "Male",
        "avatar": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=120&q=80",
        "current_level": 2, "target_level": 3, "training_status": 2, "pre_test_score": 65.0, "post_test_score": 84.0,
        "assignment_status": 2, "presentation_mgr": 2, "presentation_vp": 1, "presentation_dmd": 0,
        "practitioner_certified": 1, "jishuken_1": 1, "jishuken_2": 0, "champion_eval": 82.0, "champion_certified": 0,
        "kaizens_submitted": 8, "kaizens_approved": 6, "cost_savings_inr": 210000.0, "kpi_score": 86.2
    },
    # Level 5: GAT (Graduate Apprentice Trainee)
    {
        "emp_no": "60101", "name": "VINAY KUMAR", "division": "GD", "working_area": "HEAD",
        "designation": "Graduate Apprentice Trainee (GAT)", "boss_name": "ARUNA D R (TL)", "hierarchy_role": "GAT",
        "hierarchy_rank": 5, "reports_to_emp_no": "50031", "gender": "Male",
        "avatar": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=120&q=80",
        "current_level": 1, "target_level": 2, "training_status": 2, "pre_test_score": 68.0, "post_test_score": 86.0,
        "assignment_status": 2, "presentation_mgr": 1, "presentation_vp": 0, "presentation_dmd": 0,
        "practitioner_certified": 0, "jishuken_1": 0, "jishuken_2": 0, "champion_eval": 0.0, "champion_certified": 0,
        "kaizens_submitted": 4, "kaizens_approved": 2, "cost_savings_inr": 54000.0, "kpi_score": 82.5
    },
    {
        "emp_no": "60102", "name": "POOJA SHARMA", "division": "GD", "working_area": "HEAD",
        "designation": "Graduate Apprentice Trainee (GAT)", "boss_name": "ARUNA D R (TL)", "hierarchy_role": "GAT",
        "hierarchy_rank": 5, "reports_to_emp_no": "50031", "gender": "Female",
        "avatar": "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80",
        "current_level": 1, "target_level": 2, "training_status": 2, "pre_test_score": 62.0, "post_test_score": 84.0,
        "assignment_status": 1, "presentation_mgr": 0, "presentation_vp": 0, "presentation_dmd": 0,
        "practitioner_certified": 0, "jishuken_1": 0, "jishuken_2": 0, "champion_eval": 0.0, "champion_certified": 0,
        "kaizens_submitted": 3, "kaizens_approved": 1, "cost_savings_inr": 32000.0, "kpi_score": 79.0
    },
    {
        "emp_no": "60103", "name": "SNEHA R", "division": "GD", "working_area": "CRANK",
        "designation": "Graduate Apprentice Trainee (GAT)", "boss_name": "KIRAN GOWDA (TL)", "hierarchy_role": "GAT",
        "hierarchy_rank": 5, "reports_to_emp_no": "476", "gender": "Female",
        "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
        "current_level": 1, "target_level": 2, "training_status": 1, "pre_test_score": 59.0, "post_test_score": 78.0,
        "assignment_status": 1, "presentation_mgr": 0, "presentation_vp": 0, "presentation_dmd": 0,
        "practitioner_certified": 0, "jishuken_1": 0, "jishuken_2": 0, "champion_eval": 0.0, "champion_certified": 0,
        "kaizens_submitted": 2, "kaizens_approved": 1, "cost_savings_inr": 18000.0, "kpi_score": 76.2
    },
    # Level 6: WT (Working Trainee / WT Boys)
    {
        "emp_no": "70201", "name": "RAMESH K", "division": "GD", "working_area": "HEAD",
        "designation": "Working Trainee (WT Boy)", "boss_name": "VINAY KUMAR (GAT)", "hierarchy_role": "WT",
        "hierarchy_rank": 6, "reports_to_emp_no": "60101", "gender": "Male",
        "avatar": "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=120&q=80",
        "current_level": 1, "target_level": 2, "training_status": 2, "pre_test_score": 58.0, "post_test_score": 82.0,
        "assignment_status": 1, "presentation_mgr": 1, "presentation_vp": 0, "presentation_dmd": 0,
        "practitioner_certified": 0, "jishuken_1": 0, "jishuken_2": 0, "champion_eval": 0.0, "champion_certified": 0,
        "kaizens_submitted": 3, "kaizens_approved": 2, "cost_savings_inr": 42000.0, "kpi_score": 78.4
    },
    {
        "emp_no": "70202", "name": "SURESH N", "division": "GD", "working_area": "HEAD",
        "designation": "Working Trainee (WT Boy)", "boss_name": "VINAY KUMAR (GAT)", "hierarchy_role": "WT",
        "hierarchy_rank": 6, "reports_to_emp_no": "60101", "gender": "Male",
        "avatar": "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=120&q=80",
        "current_level": 1, "target_level": 2, "training_status": 2, "pre_test_score": 50.0, "post_test_score": 76.0,
        "assignment_status": 1, "presentation_mgr": 0, "presentation_vp": 0, "presentation_dmd": 0,
        "practitioner_certified": 0, "jishuken_1": 0, "jishuken_2": 0, "champion_eval": 0.0, "champion_certified": 0,
        "kaizens_submitted": 2, "kaizens_approved": 1, "cost_savings_inr": 28000.0, "kpi_score": 74.0
    },
    {
        "emp_no": "70203", "name": "MANJUNATH B", "division": "GD", "working_area": "HEAD",
        "designation": "Working Trainee (WT Boy)", "boss_name": "POOJA SHARMA (GAT)", "hierarchy_role": "WT",
        "hierarchy_rank": 6, "reports_to_emp_no": "60102", "gender": "Male",
        "avatar": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=120&q=80",
        "current_level": 1, "target_level": 2, "training_status": 1, "pre_test_score": 48.0, "post_test_score": 0.0,
        "assignment_status": 0, "presentation_mgr": 0, "presentation_vp": 0, "presentation_dmd": 0,
        "practitioner_certified": 0, "jishuken_1": 0, "jishuken_2": 0, "champion_eval": 0.0, "champion_certified": 0,
        "kaizens_submitted": 1, "kaizens_approved": 0, "cost_savings_inr": 0.0, "kpi_score": 68.0
    },
    {
        "emp_no": "70204", "name": "CHETAN M", "division": "GD", "working_area": "CRANK",
        "designation": "Working Trainee (WT Boy)", "boss_name": "SNEHA R (GAT)", "hierarchy_role": "WT",
        "hierarchy_rank": 6, "reports_to_emp_no": "60103", "gender": "Male",
        "avatar": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&q=80",
        "current_level": 1, "target_level": 2, "training_status": 2, "pre_test_score": 54.0, "post_test_score": 79.0,
        "assignment_status": 1, "presentation_mgr": 0, "presentation_vp": 0, "presentation_dmd": 0,
        "practitioner_certified": 0, "jishuken_1": 0, "jishuken_2": 0, "champion_eval": 0.0, "champion_certified": 0,
        "kaizens_submitted": 2, "kaizens_approved": 1, "cost_savings_inr": 21000.0, "kpi_score": 75.5
    },
    {
        "emp_no": "70205", "name": "PRAVEEN S", "division": "GD", "working_area": "CRANK",
        "designation": "Working Trainee (WT Boy)", "boss_name": "SNEHA R (GAT)", "hierarchy_role": "WT",
        "hierarchy_rank": 6, "reports_to_emp_no": "60103", "gender": "Male",
        "avatar": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80",
        "current_level": 1, "target_level": 2, "training_status": 1, "pre_test_score": 45.0, "post_test_score": 0.0,
        "assignment_status": 0, "presentation_mgr": 0, "presentation_vp": 0, "presentation_dmd": 0,
        "practitioner_certified": 0, "jishuken_1": 0, "jishuken_2": 0, "champion_eval": 0.0, "champion_certified": 0,
        "kaizens_submitted": 1, "kaizens_approved": 0, "cost_savings_inr": 0.0, "kpi_score": 66.0
    }
]

def upgrade_and_seed_hierarchy(conn):
    cursor = conn.cursor()
    cursor.execute("PRAGMA table_info(employees)")
    cols = [row[1] for row in cursor.fetchall()]

    if 'hierarchy_role' not in cols:
        cursor.execute("ALTER TABLE employees ADD COLUMN hierarchy_role TEXT DEFAULT 'TL'")
    if 'hierarchy_rank' not in cols:
        cursor.execute("ALTER TABLE employees ADD COLUMN hierarchy_rank INTEGER DEFAULT 4")
    if 'reports_to_emp_no' not in cols:
        cursor.execute("ALTER TABLE employees ADD COLUMN reports_to_emp_no TEXT")
    if 'gender' not in cols:
        cursor.execute("ALTER TABLE employees ADD COLUMN gender TEXT DEFAULT 'Male'")
    if 'avatar' not in cols:
        cursor.execute("ALTER TABLE employees ADD COLUMN avatar TEXT")
    if 'password' not in cols:
        cursor.execute("ALTER TABLE employees ADD COLUMN password TEXT DEFAULT 'tiei123'")
    conn.commit()

    # Update existing Team Leaders
    cursor.execute("UPDATE employees SET hierarchy_role = 'TL', hierarchy_rank = 4 WHERE hierarchy_role IS NULL OR hierarchy_role = 'TL'")
    # ARUNA D R is Female and reports to GL001
    cursor.execute("""
        UPDATE employees 
        SET gender = 'Female', 
            avatar = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
            reports_to_emp_no = 'GL001',
            boss_name = 'BINDUKUMAR S (GL)'
        WHERE emp_no = '50031'
    """)
    # Set default avatar and reporting GL for other TLs
    cursor.execute("""
        UPDATE employees 
        SET avatar = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
            reports_to_emp_no = 'GL001',
            boss_name = 'BINDUKUMAR S (GL)'
        WHERE hierarchy_role = 'TL' AND (avatar IS NULL OR avatar = '') AND emp_no != '50031'
    """)
    cursor.execute("""
        UPDATE employees 
        SET reports_to_emp_no = 'GL002',
            boss_name = 'PRASHANTH K (GL)'
        WHERE hierarchy_role = 'TL' AND working_area = 'CRANK'
    """)
    conn.commit()

    # Insert or update Hierarchy Leaders and Trainees (Manager, AM, GL, GAT, WT)
    for h in HIERARCHY_LEADERS:
        existing = cursor.execute("SELECT id FROM employees WHERE emp_no = ?", (h['emp_no'],)).fetchone()
        if existing:
            cursor.execute("""
                UPDATE employees SET
                    name = ?, division = ?, working_area = ?, designation = ?, boss_name = ?,
                    hierarchy_role = ?, hierarchy_rank = ?, reports_to_emp_no = ?, gender = ?, avatar = ?,
                    current_level = ?, target_level = ?, training_status = ?, pre_test_score = ?, post_test_score = ?,
                    assignment_status = ?, presentation_mgr = ?, presentation_vp = ?, presentation_dmd = ?,
                    practitioner_certified = ?, jishuken_1 = ?, jishuken_2 = ?, champion_eval = ?, champion_certified = ?,
                    kaizens_submitted = ?, kaizens_approved = ?, cost_savings_inr = ?, kpi_score = ?, password = 'tiei123'
                WHERE emp_no = ?
            """, (
                h['name'], h['division'], h['working_area'], h['designation'], h['boss_name'],
                h['hierarchy_role'], h['hierarchy_rank'], h['reports_to_emp_no'], h['gender'], h['avatar'],
                h['current_level'], h['target_level'], h['training_status'], h['pre_test_score'], h['post_test_score'],
                h['assignment_status'], h['presentation_mgr'], h['presentation_vp'], h['presentation_dmd'],
                h['practitioner_certified'], h['jishuken_1'], h['jishuken_2'], h['champion_eval'], h['champion_certified'],
                h['kaizens_submitted'], h['kaizens_approved'], h['cost_savings_inr'], h['kpi_score'],
                h['emp_no']
            ))
        else:
            cursor.execute("""
                INSERT INTO employees (
                    emp_no, name, division, working_area, designation, boss_name,
                    hierarchy_role, hierarchy_rank, reports_to_emp_no, gender, avatar, password,
                    current_level, target_level, training_status, pre_test_score, post_test_score,
                    assignment_status, presentation_mgr, presentation_vp, presentation_dmd,
                    practitioner_certified, jishuken_1, jishuken_2, champion_eval, champion_certified,
                    kaizens_submitted, kaizens_approved, cost_savings_inr, kpi_score
                ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            """, (
                h['emp_no'], h['name'], h['division'], h['working_area'], h['designation'], h['boss_name'],
                h['hierarchy_role'], h['hierarchy_rank'], h['reports_to_emp_no'], h['gender'], h['avatar'], 'tiei123',
                h['current_level'], h['target_level'], h['training_status'], h['pre_test_score'], h['post_test_score'],
                h['assignment_status'], h['presentation_mgr'], h['presentation_vp'], h['presentation_dmd'],
                h['practitioner_certified'], h['jishuken_1'], h['jishuken_2'], h['champion_eval'], h['champion_certified'],
                h['kaizens_submitted'], h['kaizens_approved'], h['cost_savings_inr'], h['kpi_score']
            ))
    conn.commit()

    # Ensure step_evidence table exists
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
        FOREIGN KEY (emp_id) REFERENCES employees (id)
    )
    ''')
    conn.commit()

    # Seed initial step evidence for WT RAMESH K (#70201)
    wt_emp = cursor.execute("SELECT id FROM employees WHERE emp_no = '70201'").fetchone()
    if wt_emp:
        wt_id = wt_emp[0]
        ev_count = cursor.execute("SELECT COUNT(*) FROM step_evidence WHERE emp_id = ?", (wt_id,)).fetchone()[0]
        if ev_count == 0:
            cursor.execute("""
                INSERT INTO step_evidence (emp_id, step_num, step_title, filename, file_url, file_size, uploaded_at, remarks)
                VALUES
                (?, 1, 'Identify & Plan Training', 'RAMESH_K_WT_Step1_Nomination.pdf', '/static/uploads/RAMESH_K_WT_Step1_Nomination.pdf', '128 KB', '2026-06-01 10:00:00', 'Enrolled in WT Standardized Work training'),
                (?, 2, 'Pre-Training Test Score', 'RAMESH_K_WT_Step2_PreTest.pdf', '/static/uploads/RAMESH_K_WT_Step2_PreTest.pdf', '110 KB', '2026-06-05 14:00:00', 'Diagnostic score 58% baseline recorded'),
                (?, 3, 'Post-Training Test Score', 'RAMESH_K_WT_Step3_PostTest.pdf', '/static/uploads/RAMESH_K_WT_Step3_PostTest.pdf', '135 KB', '2026-06-12 16:30:00', 'Passed with 82% knowledge certification')
            """, (wt_id, wt_id, wt_id))
            conn.commit()

    # Seed Komarigoto challenge for RAMESH K (WT)
    if wt_emp:
        wt_id = wt_emp[0]
        kg_count = cursor.execute("SELECT COUNT(*) FROM komarigoto WHERE emp_id = ?", (wt_id,)).fetchone()[0]
        if kg_count == 0:
            cursor.execute("""
                INSERT INTO komarigoto (
                    emp_id, challenge, category, current_condition, target_condition,
                    impact, priority, viewpoints_21, countermeasures, feasibility, unfeasible_reason, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                wt_id, "OP-110 Station Bolt Bin Excessive Reach & Back Strain", "P",
                "Operator walking 4 paces per bolt assembly (18 sec/cycle)",
                "Zero excess walking, gravity chute dispenser <= 400mm",
                "Physical fatigue and minor line takt delay of 8 sec", 1, "12,14,15",
                "Install angled gravity chute bin on workstation apron", "Feasible", "", "Submitted"
            ))
            conn.commit()


def init_db(reset=False):
    reset = reset or ('--reset' in sys.argv)
    if os.path.exists(DB_PATH) and not reset:
        print(f"Database exists at {DB_PATH}. Verifying schema & seeding hierarchy...")
        conn = sqlite3.connect(DB_PATH)
        upgrade_and_seed_hierarchy(conn)
        conn.close()
        print("Schema and 6-level hierarchy successfully verified!")
        return

    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Create tables
    cursor.execute('''
    CREATE TABLE employees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        emp_no TEXT UNIQUE,
        name TEXT,
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
        kpi_score REAL DEFAULT 0,
        hierarchy_role TEXT DEFAULT 'TL',
        hierarchy_rank INTEGER DEFAULT 4,
        reports_to_emp_no TEXT,
        gender TEXT DEFAULT 'Male',
        avatar TEXT,
        password TEXT DEFAULT 'tiei123'
    )
    ''')

    cursor.execute('''
    CREATE TABLE komarigoto (
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
        FOREIGN KEY (emp_id) REFERENCES employees (id)
    )
    ''')

    cursor.execute('''
    CREATE TABLE certifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cert_no TEXT UNIQUE,
        emp_id INTEGER,
        emp_name TEXT,
        level_name TEXT,
        issue_date TEXT,
        signatory TEXT,
        status TEXT,
        FOREIGN KEY (emp_id) REFERENCES employees (id)
    )
    ''')

    cursor.execute('''
    CREATE TABLE training_batches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        batch_code TEXT,
        level_name TEXT,
        module_name TEXT,
        trainer_name TEXT,
        venue TEXT,
        start_date TEXT,
        end_date TEXT,
        capacity INTEGER,
        enrolled_count INTEGER,
        status TEXT
    )
    ''')

    cursor.execute('''
    CREATE TABLE kaizen_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        control_no TEXT,
        emp_id INTEGER,
        emp_name TEXT,
        work_name TEXT,
        category TEXT,
        line TEXT,
        machine TEXT,
        material_cost REAL,
        man_hours_cost REAL,
        machine_cost REAL,
        total_cost REAL,
        status TEXT,
        request_date TEXT
    )
    ''')

    cursor.execute('''
    CREATE TABLE step_evidence (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        emp_id INTEGER,
        step_num INTEGER,
        step_title TEXT,
        filename TEXT,
        file_url TEXT,
        file_size TEXT,
        uploaded_at TEXT,
        remarks TEXT,
        FOREIGN KEY (emp_id) REFERENCES employees (id)
    )
    ''')

    # Read from Excel if exists
    employees_to_insert = []
    if os.path.exists(EXCEL_PATH):
        wb = openpyxl.load_workbook(EXCEL_PATH, data_only=True)
        sheet = wb.active
        rows = list(sheet.iter_rows(values_only=True))
        
        for r in rows[2:]:
            if r[0] and r[3]: # name and emp_no
                name = str(r[0]).strip().lstrip("'")
                div = str(r[1] or 'GD').strip()
                area = str(r[2] or 'HEAD').strip()
                emp_no = str(r[3]).strip()
                desig = str(r[5] or 'Z10').strip()
                boss = str(r[6] or 'BINDUKUMAR S (GL)').strip()
                
                training_status = int(r[7]) if r[7] is not None and str(r[7]).isdigit() else 0
                post_test = int(r[8]) if r[8] is not None and str(r[8]).isdigit() else 0
                assignment = int(r[9]) if r[9] is not None and str(r[9]).isdigit() else 0
                pres_mgr = int(r[10]) if r[10] is not None and str(r[10]).isdigit() else 0
                pres_vp = int(r[11]) if r[11] is not None and str(r[11]).isdigit() else 0
                pres_dmd = int(r[12]) if r[12] is not None and str(r[12]).isdigit() else 0

                pre_score = random.randint(45, 65) if training_status > 0 else 0
                post_score = random.randint(75, 96) if post_test == 2 else (random.randint(50, 70) if training_status == 2 else 0)
                
                is_cert = 1 if (pres_mgr == 2 and pres_vp == 2) else 0
                current_level = 2 if is_cert else 1
                target_level = 3 if current_level == 2 else 2
                j1 = 1 if is_cert and random.random() > 0.4 else 0
                j2 = 1 if j1 and random.random() > 0.5 else 0
                champ_cert = 1 if j1 and j2 and random.random() > 0.6 else 0
                if champ_cert:
                    current_level = 3
                    target_level = 4

                kaizens_sub = random.randint(3, 14)
                kaizens_app = min(kaizens_sub, random.randint(2, kaizens_sub))
                savings = kaizens_app * random.randint(15000, 65000)
                kpi_score = round(70 + (kaizens_app * 2.5) + (post_score * 0.1), 1)

                is_aruna = (emp_no == '50031')
                gender = 'Female' if is_aruna else 'Male'
                avatar = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80' if is_aruna else 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80'
                rep_boss_no = 'GL002' if area == 'CRANK' else 'GL001'

                employees_to_insert.append((
                    emp_no, name, div, area, desig, boss,
                    current_level, target_level,
                    training_status, pre_score, post_score,
                    assignment, pres_mgr, pres_vp, pres_dmd,
                    is_cert, j1, j2, 85.0 if j2 else 0, champ_cert,
                    kaizens_sub, kaizens_app, savings, kpi_score,
                    'TL', 4, rep_boss_no, gender, avatar, 'tiei123'
                ))

    # Give ARUNA D R (TL) completed milestones
    if len(employees_to_insert) > 0:
        for idx, emp_row in enumerate(employees_to_insert):
            if emp_row[0] == '50031':
                e1 = list(emp_row)
                e1[12] = 2 # pres_mgr
                e1[13] = 2 # pres_vp
                e1[14] = 2 # pres_dmd
                e1[15] = 1 # is_cert
                e1[16] = 1 # j1
                e1[17] = 1 # j2
                e1[18] = 92.5 # champ_eval
                e1[19] = 1 # champ_cert
                e1[6] = 3 # current_level
                e1[7] = 4 # target_level
                employees_to_insert[idx] = tuple(e1)

    cursor.executemany('''
    INSERT INTO employees (
        emp_no, name, division, working_area, designation, boss_name,
        current_level, target_level,
        training_status, pre_test_score, post_test_score,
        assignment_status, presentation_mgr, presentation_vp, presentation_dmd,
        practitioner_certified, jishuken_1, jishuken_2, champion_eval, champion_certified,
        kaizens_submitted, kaizens_approved, cost_savings_inr, kpi_score,
        hierarchy_role, hierarchy_rank, reports_to_emp_no, gender, avatar, password
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    ''', employees_to_insert)

    conn.commit()

    # Seed the dedicated Manager, AMs, GLs, GATs, WTs
    upgrade_and_seed_hierarchy(conn)

    # Seed Komarigoto samples for ARUNA D R (id: 1)
    sample_challenges = [
        (1, 'OP-100: T01 Tool Breakage loss on rough milling', 'P', 'Actual 20min/change vs Target 5min', '5 min/change', 'Daily line takt time missed by 18%', 1, '1,3,19', 'Implement pneumatic quick-change torque fixture & pre-setter gauge', 'Feasible', '', 'Implemented'),
        (1, 'OP-120: Coolant splash causing operator slipping & floor mess', 'S', 'Oil residue on walkway, cleaning 4x per shift', 'Zero spill, dry floor condition', 'Safety near-miss hazard & 5S score dropped', 1, '3,21', 'Fabricate polycarbonate splash guard with return drain gutter', 'Feasible', '', 'Standardized'),
        (1, 'Crank Pin Chamfer Double Handling & Burrs', 'Q', 'Manual file deburring required for 15% components', 'Zero manual rework at station', 'Rework bottleneck of 45 sec/part', 2, '6,8,16', 'Automate brush deburr cycle inside machining envelope', 'Feasible', '', 'In Progress'),
        (1, 'Line Supply: Excessive buffer inventory between Machining & Assembly', 'C', '65 WIP engine blocks stored in aisle', 'Standard buffer <= 8 blocks (Kanban limit)', 'Capital blocked, floor space congestion', 1, '7,11,14', 'Establish 2-bin gravity feed roller chute with electronic sensor alert', 'Feasible', '', 'Implemented')
    ]
    cursor.executemany('''
    INSERT INTO komarigoto (
        emp_id, challenge, category, current_condition, target_condition,
        impact, priority, viewpoints_21, countermeasures, feasibility, unfeasible_reason, status
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
    ''', sample_challenges)

    # Seed Certifications
    cursor.execute('''
    INSERT INTO certifications (cert_no, emp_id, emp_name, level_name, issue_date, signatory, status)
    VALUES 
    ('TIEI/TPS/2026/001', 1, 'ARUNA D R', 'Level 2 - TPS Practitioner', '2026-06-15', 'Antony John Sudhakar P (VP)', 'Active'),
    ('TIEI/TPS/2026/002', 1, 'ARUNA D R', 'Level 3 - TPS Champion', '2026-09-10', 'Mohammed Rasool Mulla (HOD)', 'Active'),
    ('TIEI/TPS/2026/003', 2, 'KARTHIKEYAN', 'Level 2 - TPS Practitioner', '2026-07-20', 'Antony John Sudhakar P (VP)', 'Active')
    ''')

    # Seed Batches
    cursor.execute('''
    INSERT INTO training_batches (batch_code, level_name, module_name, trainer_name, venue, start_date, end_date, capacity, enrolled_count, status)
    VALUES
    ('BATCH-2026-Q3-01', 'Level 2 - TPS Practitioner', 'Standardized Work 3 Slips & 21 KVP', 'Dilip R (Master Trainer)', 'TIEI TPS Dojo Room A', '2026-10-15', '2026-10-17', 20, 18, 'Scheduled'),
    ('BATCH-2026-Q3-02', 'Level 3 - Advanced Practitioner', 'Value Stream Mapping & MIFC', 'Rakshith Prabhu (Senior Trainer)', 'Plant Simulation Lab', '2026-10-22', '2026-10-24', 15, 12, 'Scheduled'),
    ('BATCH-2026-Q3-03', 'Level 1 - TPS Foundation', '5S, Waste Identification & Safety', 'Govinda (Lead Assessor)', 'Shop Floor Training Bay 2', '2026-11-05', '2026-11-06', 25, 25, 'Full')
    ''')

    # Seed Kaizen Requests
    cursor.execute('''
    INSERT INTO kaizen_requests (control_no, emp_id, emp_name, work_name, category, line, machine, material_cost, man_hours_cost, machine_cost, total_cost, status, request_date)
    VALUES
    ('KAIZEN-2026-089', 1, 'ARUNA D R', 'Pneumatic Quick-Change Tool Fixture', 'Productivity', 'GD HEAD', 'MILLING', 4500.0, 1800.0, 1200.0, 7500.0, 'Approved', '2026-08-12'),
    ('KAIZEN-2026-094', 1, 'ARUNA D R', 'Polycarbonate Splash Guard with Drain', 'Safety', 'GD HEAD', 'SURFACE GRINDING', 2800.0, 950.0, 600.0, 4350.0, 'Approved', '2026-08-25'),
    ('KAIZEN-2026-102', 2, 'KARTHIKEYAN', 'Gravity Roller Chute for Cylinder Head Transfer', 'Productivity', 'GD HEAD', 'WELDING', 6200.0, 2400.0, 1800.0, 10400.0, 'Approved', '2026-09-02'),
    ('KAIZEN-2026-110', 4, 'KIRAN GOWDA', 'Ergonomic Magnetic Tool Retractor', 'Moral improvement', 'GD CRANK', 'LATHE', 1500.0, 600.0, 400.0, 2500.0, 'Under Review', '2026-09-28')
    ''')

    # Seed Step Evidence for ARUNA D R
    aruna_emp = cursor.execute("SELECT id FROM employees WHERE emp_no = '50031'").fetchone()
    if aruna_emp:
        aruna_id = aruna_emp[0]
        cursor.execute('''
        INSERT INTO step_evidence (emp_id, step_num, step_title, filename, file_url, file_size, uploaded_at, remarks)
        VALUES
        (?, 1, 'Identify & Plan Training', 'ARUNA_DR_Step1_training_slip.pdf', '/static/uploads/ARUNA_DR_Step1_training_slip.pdf', '142 KB', '2026-05-10 09:30:00', 'Nomination signed by HOD'),
        (?, 2, 'Pre-Training Test Score', 'ARUNA_DR_Step2_pre_test.pdf', '/static/uploads/ARUNA_DR_Step2_pre_test.pdf', '118 KB', '2026-05-15 14:00:00', 'Baseline diagnostic assessment score 58%'),
        (?, 3, 'Post-Training Test Score', 'ARUNA_DR_Step3_post_test.pdf', '/static/uploads/ARUNA_DR_Step3_post_test.pdf', '125 KB', '2026-05-18 16:30:00', 'Official post-training score 88% verified'),
        (?, 4, 'Post-Training Assignment', 'ARUNA_DR_Step4_a3_komarigoto.xlsx', '/static/uploads/ARUNA_DR_Step4_a3_komarigoto.xlsx', '340 KB', '2026-05-28 11:15:00', 'A3 Action learning sheet & 21 KVP analysis submitted'),
        (?, 5, 'Presentation (MGR & Trainer)', 'ARUNA_DR_Step5_mgr_review.pdf', '/static/uploads/ARUNA_DR_Step5_mgr_review.pdf', '512 KB', '2026-06-05 15:45:00', 'Manager sign-off completed on Gemba'),
        (?, 6, 'Presentation (VP & DMD)', 'ARUNA_DR_Step6_vp_review.pdf', '/static/uploads/ARUNA_DR_Step6_vp_review.pdf', '890 KB', '2026-06-12 10:20:00', 'VP Executive presentation deck and sign-off')
        ''', (aruna_id, aruna_id, aruna_id, aruna_id, aruna_id, aruna_id))

    conn.commit()
    conn.close()
    print(f"Successfully initialized SQLite database at {DB_PATH} with 6-level hierarchy!")

if __name__ == '__main__':
    init_db()
