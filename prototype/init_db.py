import sqlite3
import openpyxl
import os
import random

DB_PATH = os.path.join(os.path.dirname(__file__), 'tps_database.db')
EXCEL_PATH = os.path.join(os.path.dirname(__file__), '..', '001_TPS Journey Visualisation.xlsx')

def init_db():
    if os.path.exists(DB_PATH) and not os.path.exists(EXCEL_PATH):
        print(f"Database already exists at {DB_PATH} and Excel source is not present. Preserving database.")
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
        kpi_score REAL DEFAULT 0
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
                boss = str(r[6] or 'TPS Office').strip()
                
                training_status = int(r[7]) if r[7] is not None and str(r[7]).isdigit() else 0
                post_test = int(r[8]) if r[8] is not None and str(r[8]).isdigit() else 0
                assignment = int(r[9]) if r[9] is not None and str(r[9]).isdigit() else 0
                pres_mgr = int(r[10]) if r[10] is not None and str(r[10]).isdigit() else 0
                pres_vp = int(r[11]) if r[11] is not None and str(r[11]).isdigit() else 0
                pres_dmd = int(r[12]) if r[12] is not None and str(r[12]).isdigit() else 0

                # Simulated scores & kaizens
                pre_score = random.randint(45, 65) if training_status > 0 else 0
                post_score = random.randint(75, 96) if post_test == 2 else (random.randint(50, 70) if training_status == 2 else 0)
                
                # Check level
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

                employees_to_insert.append((
                    emp_no, name, div, area, desig, boss,
                    current_level, target_level,
                    training_status, pre_score, post_score,
                    assignment, pres_mgr, pres_vp, pres_dmd,
                    is_cert, j1, j2, 85.0 if j2 else 0, champ_cert,
                    kaizens_sub, kaizens_app, savings, kpi_score
                ))

    # Give top performers completed milestones for full demonstration
    if len(employees_to_insert) > 2:
        e1 = list(employees_to_insert[0]) # ARUNA D R
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
        employees_to_insert[0] = tuple(e1)

        e2 = list(employees_to_insert[1]) # KARTHIKEYAN
        e2[12] = 2
        e2[13] = 2
        e2[15] = 1 # cert
        e2[16] = 1 # j1
        employees_to_insert[1] = tuple(e2)

    cursor.executemany('''
    INSERT INTO employees (
        emp_no, name, division, working_area, designation, boss_name,
        current_level, target_level,
        training_status, pre_test_score, post_test_score,
        assignment_status, presentation_mgr, presentation_vp, presentation_dmd,
        practitioner_certified, jishuken_1, jishuken_2, champion_eval, champion_certified,
        kaizens_submitted, kaizens_approved, cost_savings_inr, kpi_score
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    ''', employees_to_insert)

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

    conn.commit()
    conn.close()
    print(f"Successfully initialized SQLite database at {DB_PATH} with {len(employees_to_insert)} employees.")

if __name__ == '__main__':
    init_db()
