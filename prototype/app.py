import sqlite3
import os
import sys
import json
import random
sys.path.insert(0, os.path.dirname(__file__))
from flask import Flask, render_template, jsonify, request
from init_db import upgrade_and_seed_hierarchy

app = Flask(__name__, template_folder='templates', static_folder='static')
DB_PATH = os.path.join(os.path.dirname(__file__), 'tps_database.db')
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'static', 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# Helper: Find all recursive subordinates for an employee in the plant hierarchy
def get_subordinate_emp_nos(cursor, supervisor_emp_no):
    subordinates = []
    current_layer = [supervisor_emp_no]
    while current_layer:
        placeholders = ','.join(['?'] * len(current_layer))
        rows = cursor.execute(
            f"SELECT emp_no FROM employees WHERE reports_to_emp_no IN ({placeholders})",
            current_layer
        ).fetchall()
        next_layer = [r[0] for r in rows if r[0] not in subordinates and r[0] != supervisor_emp_no]
        if not next_layer:
            break
        subordinates.extend(next_layer)
        current_layer = next_layer
    return subordinates

# 21 Kaizen Viewpoints Master Data
KVP_MASTER = [
    {"id": 1, "category": "Muri", "subcategory": "Cycle Time", "name": "Average cycle time more than Takt time", "desc": "Line bottleneck where operator cycle exceeds designated takt time"},
    {"id": 2, "category": "Muri", "subcategory": "Mistake Proofing", "name": "Poor Pokayoke setting", "desc": "Inadequate sensors, limits, or fool-proofing causing operator strain"},
    {"id": 3, "category": "Muri", "subcategory": "Ergonomics", "name": "Poor ergonomics", "desc": "Heavy lifting, awkward posture, or repetitive stress causing physical fatigue"},
    {"id": 4, "category": "Mura", "subcategory": "Variability", "name": "Each model has different cycle time", "desc": "Fluctuating work content between variant batches creating line imbalance"},
    {"id": 5, "category": "Mura", "subcategory": "Obstacles", "name": "Various Obstacles While working", "desc": "Intermittent disruptions, chip entanglement, missing tools"},
    {"id": 6, "category": "Muda", "subcategory": "Repair", "name": "Repair / Rework process", "desc": "Secondary manual rework, filing, weld touch-up or defect correction"},
    {"id": 7, "category": "Muda", "subcategory": "Overproduction", "name": "Advance production", "desc": "Making parts before required by downstream process or exceeding batch limit"},
    {"id": 8, "category": "Muda", "subcategory": "Processing", "name": "Double Job / Over inspection", "desc": "Redundant visual checks, duplicate handling, over-tightened specs"},
    {"id": 9, "category": "Muda", "subcategory": "Conveyance", "name": "Long distance of transportation", "desc": "Excessive travel distance between machining stations or storage"},
    {"id": 10, "category": "Muda", "subcategory": "Conveyance", "name": "Many conveyance methods per route", "desc": "Mixing carts, tuggers, forklifts, and manual carry on a single route"},
    {"id": 11, "category": "Muda", "subcategory": "Stock", "name": "Over necessary stock", "desc": "Excessive WIP buffers, raw materials, or finished engine blocks in aisles"},
    {"id": 12, "category": "Muda", "subcategory": "Motion", "name": "Many times of returning", "desc": "Operator walking back and forth to retrieve parts, tools, or gages"},
    {"id": 13, "category": "Muda", "subcategory": "Motion", "name": "Many working position change", "desc": "Frequent repositioning, bending, stretching, or reaching beyond envelope"},
    {"id": 14, "category": "Muda", "subcategory": "Motion", "name": "Part area larger than working area", "desc": "Parts bin layout forces unnatural reaching or extended walking"},
    {"id": 15, "category": "Muda", "subcategory": "Motion", "name": "Poor work posture", "desc": "Stooping, squatting, or working with raised arms"},
    {"id": 16, "category": "Muda", "subcategory": "Motion", "name": "Double handling", "desc": "Putting down a part and picking it up again instead of direct transfer"},
    {"id": 17, "category": "Muda", "subcategory": "Motion", "name": "Change Direction of Part", "desc": "Rotating or reorienting parts multiple times before fixture loading"},
    {"id": 18, "category": "Muda", "subcategory": "Waiting", "name": "Process interference", "desc": "Waiting for upstream station or logistics delivery"},
    {"id": 19, "category": "Muda", "subcategory": "Waiting", "name": "Poor relation between man - machine time", "desc": "Operator standing idle watching machine run auto cycle"},
    {"id": 20, "category": "Muda", "subcategory": "Waiting", "name": "Average cycle time less than Takt time", "desc": "Starving line or idle wait due to uneven workload allocation"},
    {"id": 21, "category": "Others", "subcategory": "Environment", "name": "Others (Gemba 5S & Environment)", "desc": "Lighting, noise, oil mist, chip accumulation, general worksite improvements"}
]

# 6 Hierarchy Roles Master
HIERARCHY_CONFIG = [
    {
        "rank": 1, "role": "Manager", "title": "1) Section Manager / HOD",
        "description": "Full Section Oversight: Evaluates all AMs, GLs, TLs, GATs, and WTs",
        "demo_emp_no": "MGR001", "demo_name": "MANUKUMAR G", "icon": "fa-user-tie",
        "color": "rose", "badge_bg": "bg-rose-600"
    },
    {
        "rank": 2, "role": "AM", "title": "2) Assistant Manager",
        "description": "Area Operations: Supervises Group Leaders, Team Leaders, and Trainees across lines",
        "demo_emp_no": "AM001", "demo_name": "GOVINDA R", "icon": "fa-award",
        "color": "indigo", "badge_bg": "bg-indigo-600"
    },
    {
        "rank": 3, "role": "GL", "title": "3) Group Leader",
        "description": "Shift & Line In-charge: Guides Team Leaders, GATs, and WT Boys across cell shifts",
        "demo_emp_no": "GL001", "demo_name": "BINDUKUMAR S", "icon": "fa-users-gear",
        "color": "blue", "badge_bg": "bg-blue-600"
    },
    {
        "rank": 4, "role": "TL", "title": "4) Team Leader",
        "description": "Cell & Station Lead: Directly oversees GATs and WT Boys + Manages own TPS Pathway",
        "demo_emp_no": "50031", "demo_name": "ARUNA D R", "icon": "fa-screwdriver-wrench",
        "color": "emerald", "badge_bg": "bg-emerald-600"
    },
    {
        "rank": 5, "role": "GAT", "title": "5) Graduate Apprentice Trainee",
        "description": "Trainee Engineer: Mentors assigned WT Boys on Gemba Kaizens + Completes A3 learning",
        "demo_emp_no": "60101", "demo_name": "VINAY KUMAR", "icon": "fa-graduation-cap",
        "color": "amber", "badge_bg": "bg-amber-600"
    },
    {
        "rank": 6, "role": "WT", "title": "6) Working Trainee (WT Boy)",
        "description": "Shopfloor Trainee: Dedicated Personal Portal (Level, 11-Step Pathway, Evidence Upload & Progress)",
        "demo_emp_no": "70201", "demo_name": "RAMESH K", "icon": "fa-helmet-safety",
        "color": "purple", "badge_bg": "bg-purple-600"
    },
    {
        "rank": 7, "role": "TRAINER", "title": "7) Master Trainer & Verifier",
        "description": "Training Batches, Attendance Register & Knowledge Assessments",
        "demo_emp_no": "TRN001", "demo_name": "DILIP R", "icon": "fa-chalkboard-user",
        "color": "sky", "badge_bg": "bg-[#0067B1]"
    },
    {
        "rank": 8, "role": "TPS_OFFICE", "title": "8) TPS Office / Digital Captain",
        "description": "Plant Competency Governance, Department Nominations & Certifications",
        "demo_emp_no": "TPS001", "demo_name": "RAKSHITH PRABHU", "icon": "fa-laptop-code",
        "color": "amber", "badge_bg": "bg-[#EA7625]"
    }
]

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/viewpoints_21')
def get_viewpoints():
    return jsonify(KVP_MASTER)

@app.route('/api/hierarchy_roles')
def get_hierarchy_roles():
    return jsonify(HIERARCHY_CONFIG)

# Authentication & Hierarchy Sign-In
@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.json or {}
    emp_no = str(data.get('emp_no', '')).strip().upper()
    password = str(data.get('password', '')).strip()

    if not emp_no:
        return jsonify({"success": False, "error": "Please enter an Employee ID"}), 400

    conn = get_db()
    cursor = conn.cursor()
    clean_id = emp_no.split('@')[0].strip()
    emp = cursor.execute('SELECT * FROM employees WHERE UPPER(emp_no) = ? OR UPPER(emp_no) = ?', (emp_no, clean_id)).fetchone()
    if not emp:
        # Also try matching by name substring
        emp = cursor.execute('SELECT * FROM employees WHERE UPPER(name) LIKE ?', (f'%{clean_id}%',)).fetchone()

    if not emp:
        conn.close()
        return jsonify({"success": False, "error": f"Employee ID or account '{emp_no}' not found in TIEI plant records"}), 404

    emp_dict = dict(emp)

    # Fetch recursive subordinates for this user
    sub_emp_nos = get_subordinate_emp_nos(cursor, emp_dict['emp_no'])

    # Fetch direct boss information if exists
    boss_info = None
    if emp_dict.get('reports_to_emp_no'):
        b = cursor.execute('SELECT emp_no, name, designation, hierarchy_role, avatar FROM employees WHERE emp_no = ?', (emp_dict['reports_to_emp_no'],)).fetchone()
        if b:
            boss_info = dict(b)

    conn.close()
    return jsonify({
        "success": True,
        "user": emp_dict,
        "subordinate_emp_nos": sub_emp_nos,
        "subordinates_count": len(sub_emp_nos),
        "boss": boss_info
    })

# Subordinate-Aware Stats Endpoint
@app.route('/api/stats')
def get_stats():
    supervisor = request.args.get('supervisor') or request.args.get('current_user')
    conn = get_db()
    cursor = conn.cursor()

    allowed_emp_nos = None
    if supervisor:
        sub_nos = get_subordinate_emp_nos(cursor, supervisor)
        if sub_nos:
            allowed_emp_nos = sub_nos
        else:
            # If user has no subordinates (e.g. WT), stats reflect their own personal performance
            allowed_emp_nos = [supervisor]

    scope_where = ""
    params = []
    if allowed_emp_nos is not None:
        placeholders = ','.join(['?'] * len(allowed_emp_nos))
        scope_where = f" WHERE emp_no IN ({placeholders})"
        params = list(allowed_emp_nos)

    total_emps = cursor.execute(f'SELECT COUNT(*) FROM employees{scope_where}', params).fetchone()[0]

    trn_where = f" WHERE training_status >= 2" + (f" AND emp_no IN ({','.join(['?']*len(allowed_emp_nos))})" if allowed_emp_nos else "")
    trained_emps = cursor.execute(f'SELECT COUNT(*) FROM employees{trn_where}', params if allowed_emp_nos else []).fetchone()[0]

    asgn_where = f" WHERE assignment_status >= 1" + (f" AND emp_no IN ({','.join(['?']*len(allowed_emp_nos))})" if allowed_emp_nos else "")
    assignments_sub = cursor.execute(f'SELECT COUNT(*) FROM employees{asgn_where}', params if allowed_emp_nos else []).fetchone()[0]

    prac_where = f" WHERE practitioner_certified = 1" + (f" AND emp_no IN ({','.join(['?']*len(allowed_emp_nos))})" if allowed_emp_nos else "")
    practitioner_certs = cursor.execute(f'SELECT COUNT(*) FROM employees{prac_where}', params if allowed_emp_nos else []).fetchone()[0]

    champ_where = f" WHERE champion_certified = 1" + (f" AND emp_no IN ({','.join(['?']*len(allowed_emp_nos))})" if allowed_emp_nos else "")
    champion_certs = cursor.execute(f'SELECT COUNT(*) FROM employees{champ_where}', params if allowed_emp_nos else []).fetchone()[0]

    # Kaizen and cost metrics
    kaizen_totals = cursor.execute(f'''
        SELECT SUM(kaizens_submitted), SUM(kaizens_approved), SUM(cost_savings_inr), AVG(kpi_score)
        FROM employees{scope_where}
    ''', params).fetchone()
    total_kaizens_sub = kaizen_totals[0] or 0
    total_kaizens_app = kaizen_totals[1] or 0
    total_savings = kaizen_totals[2] or 0
    avg_kpi = round(kaizen_totals[3] or 75.0, 1)

    # Area distribution
    area_rows = cursor.execute(f'''
        SELECT working_area, 
               COUNT(*) as total,
               SUM(CASE WHEN practitioner_certified = 1 THEN 1 ELSE 0 END) as certified,
               AVG(kpi_score) as avg_kpi
        FROM employees{scope_where}
        GROUP BY working_area
    ''', params).fetchall()
    area_stats = [dict(r) for r in area_rows]

    # Level distribution
    level_rows = cursor.execute(f'''
        SELECT current_level, COUNT(*) as count 
        FROM employees{scope_where}
        GROUP BY current_level
    ''', params).fetchall()
    level_stats = {r['current_level']: r['count'] for r in level_rows}

    # Hierarchy Role breakdown
    role_rows = cursor.execute(f'''
        SELECT hierarchy_role, COUNT(*) as count 
        FROM employees{scope_where}
        GROUP BY hierarchy_role
    ''', params).fetchall()
    role_stats = {r['hierarchy_role']: r['count'] for r in role_rows}

    conn.close()

    return jsonify({
        "total_employees": total_emps,
        "trained_employees": trained_emps,
        "assignments_submitted": assignments_sub,
        "practitioners_certified": practitioner_certs,
        "champions_certified": champion_certs,
        "total_kaizens_submitted": total_kaizens_sub,
        "total_kaizens_approved": total_kaizens_app,
        "total_cost_savings_inr": total_savings,
        "avg_kpi_score": avg_kpi,
        "manhours_saved_per_day": 4.0,
        "area_stats": area_stats,
        "level_stats": level_stats,
        "role_stats": role_stats
    })

# Subordinate-Aware Employees List Endpoint
@app.route('/api/employees')
def get_employees():
    supervisor = request.args.get('supervisor') or request.args.get('current_user')
    include_self = request.args.get('include_self', 'true').lower() == 'true'
    area = request.args.get('area')
    search = request.args.get('search')
    level = request.args.get('level')
    role = request.args.get('role')

    conn = get_db()
    cursor = conn.cursor()

    allowed_emp_nos = None
    if supervisor:
        sub_nos = get_subordinate_emp_nos(cursor, supervisor)
        if include_self and supervisor not in sub_nos:
            sub_nos.insert(0, supervisor)
        allowed_emp_nos = sub_nos

    query = 'SELECT * FROM employees WHERE 1=1'
    params = []

    if allowed_emp_nos is not None:
        if not allowed_emp_nos:
            conn.close()
            return jsonify([])
        placeholders = ','.join(['?'] * len(allowed_emp_nos))
        query += f' AND emp_no IN ({placeholders})'
        params.extend(allowed_emp_nos)

    if area and area != 'ALL':
        query += ' AND working_area = ?'
        params.append(area)
    if level and level != 'ALL':
        query += ' AND current_level = ?'
        params.append(int(level))
    if role and role != 'ALL':
        query += ' AND hierarchy_role = ?'
        params.append(role)
    if search:
        query += ' AND (name LIKE ? OR emp_no LIKE ? OR boss_name LIKE ?)'
        params.extend([f'%{search}%', f'%{search}%', f'%{search}%'])

    query += ' ORDER BY hierarchy_rank ASC, id ASC'
    rows = cursor.execute(query, params).fetchall()
    emps = [dict(r) for r in rows]
    conn.close()
    return jsonify(emps)

@app.route('/api/employees/<int:emp_id>')
def get_employee(emp_id):
    conn = get_db()
    cursor = conn.cursor()
    emp = cursor.execute('SELECT * FROM employees WHERE id = ?', (emp_id,)).fetchone()
    if not emp:
        conn.close()
        return jsonify({"error": "Not found"}), 404

    emp_dict = dict(emp)

    challenges = cursor.execute('SELECT * FROM komarigoto WHERE emp_id = ?', (emp_id,)).fetchall()
    certs = cursor.execute('SELECT * FROM certifications WHERE emp_id = ?', (emp_id,)).fetchall()
    kaizens = cursor.execute('SELECT * FROM kaizen_requests WHERE emp_id = ?', (emp_id,)).fetchall()

    # Query step evidence if table exists
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
    evidence_rows = cursor.execute('SELECT * FROM step_evidence WHERE emp_id = ? ORDER BY step_num ASC, id DESC', (emp_id,)).fetchall()

    # Subordinates count
    sub_nos = get_subordinate_emp_nos(cursor, emp_dict['emp_no'])
    emp_dict['subordinates_count'] = len(sub_nos)
    emp_dict['subordinate_emp_nos'] = sub_nos

    emp_dict['challenges'] = [dict(c) for c in challenges]
    emp_dict['certifications'] = [dict(c) for c in certs]
    emp_dict['kaizen_history'] = [dict(k) for k in kaizens]
    emp_dict['evidence'] = [dict(ev) for ev in evidence_rows]
    conn.close()
    return jsonify(emp_dict)

@app.route('/api/employees/<int:emp_id>/journey_update', methods=['POST'])
def update_journey(emp_id):
    data = request.json or {}
    field = data.get('field')
    val = data.get('value')

    allowed_fields = [
        'training_status', 'pre_test_score', 'post_test_score', 'assignment_status',
        'presentation_mgr', 'presentation_vp', 'presentation_dmd',
        'practitioner_certified', 'jishuken_1', 'jishuken_2',
        'champion_eval', 'champion_certified', 'current_level', 'target_level'
    ]
    if field not in allowed_fields:
        return jsonify({"error": "Invalid field"}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(f'UPDATE employees SET {field} = ? WHERE id = ?', (val, emp_id))

    # Auto logic check: If presentation_mgr and presentation_vp are completed, award practitioner cert
    emp = cursor.execute('SELECT * FROM employees WHERE id = ?', (emp_id,)).fetchone()
    if emp['presentation_mgr'] == 2 and emp['presentation_vp'] == 2 and emp['practitioner_certified'] == 0:
        cursor.execute('UPDATE employees SET practitioner_certified = 1, current_level = 2, target_level = 3 WHERE id = ?', (emp_id,))
        cert_no = f"TIEI/TPS/2026/{str(emp_id).zfill(3)}"
        cursor.execute('''
            INSERT OR IGNORE INTO certifications (cert_no, emp_id, emp_name, level_name, issue_date, signatory, status)
            VALUES (?, ?, ?, 'Level 2 - TPS Practitioner', date('now'), 'Antony John Sudhakar P (VP)', 'Active')
        ''', (cert_no, emp_id, emp['name']))

    conn.commit()
    updated_emp = cursor.execute('SELECT * FROM employees WHERE id = ?', (emp_id,)).fetchone()
    conn.close()
    return jsonify(dict(updated_emp))

@app.route('/api/employees/<int:emp_id>/evidence', methods=['GET', 'POST'])
def manage_step_evidence(emp_id):
    conn = get_db()
    cursor = conn.cursor()
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

    if request.method == 'POST':
        if request.is_json:
            data = request.json or {}
            step_num = int(data.get('step_num', 1))
            step_title = data.get('step_title', '')
            filename = data.get('filename', f'Evidence_Step_{step_num}.pdf')
            file_url = data.get('file_url', f'/static/uploads/{filename}')
            file_size = data.get('file_size', '124 KB')
            remarks = data.get('remarks', '')
        else:
            step_num = int(request.form.get('step_num', 1))
            step_title = request.form.get('step_title', '')
            remarks = request.form.get('remarks', '')
            file = request.files.get('file')
            if file and file.filename:
                filename = file.filename
                save_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(save_path)
                file_url = f'/static/uploads/{filename}'
                file_size = f"{round(os.path.getsize(save_path) / 1024, 1)} KB"
            else:
                filename = request.form.get('filename', f'Evidence_Step_{step_num}.pdf')
                file_url = f'/static/uploads/{filename}'
                file_size = request.form.get('file_size', '142 KB')

        cursor.execute('''
            INSERT INTO step_evidence (emp_id, step_num, step_title, filename, file_url, file_size, uploaded_at, remarks)
            VALUES (?, ?, ?, ?, ?, ?, datetime('now'), ?)
        ''', (emp_id, step_num, step_title, filename, file_url, file_size, remarks))
        conn.commit()

        row = cursor.execute('SELECT * FROM step_evidence WHERE id = last_insert_rowid()').fetchone()
        conn.close()
        return jsonify(dict(row))

    rows = cursor.execute('SELECT * FROM step_evidence WHERE emp_id = ? ORDER BY step_num ASC, id DESC', (emp_id,)).fetchall()
    evidence_list = [dict(r) for r in rows]
    conn.close()
    return jsonify(evidence_list)

@app.route('/api/komarigoto', methods=['POST'])
def add_komarigoto():
    data = request.json
    emp_id = data.get('emp_id')
    challenge = data.get('challenge')
    category = data.get('category', 'P')
    current_cond = data.get('current_condition', '')
    target_cond = data.get('target_condition', '')
    impact = data.get('impact', '')
    priority = int(data.get('priority', 1))
    viewpoints = data.get('viewpoints_21', '')
    countermeasures = data.get('countermeasures', '')
    feasibility = data.get('feasibility', 'Feasible')
    unfeasible_reason = data.get('unfeasible_reason', '')
    status = data.get('status', 'Identified')

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO komarigoto (
            emp_id, challenge, category, current_condition, target_condition,
            impact, priority, viewpoints_21, countermeasures, feasibility, unfeasible_reason, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (emp_id, challenge, category, current_cond, target_cond, impact, priority, viewpoints, countermeasures, feasibility, unfeasible_reason, status))

    cursor.execute('UPDATE employees SET assignment_status = 2 WHERE id = ? AND assignment_status < 2', (emp_id,))
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    return jsonify({"success": True, "id": new_id})

@app.route('/api/certifications')
def get_certifications():
    conn = get_db()
    cursor = conn.cursor()
    rows = cursor.execute('''
        SELECT c.*, e.division, e.working_area, e.designation, e.emp_no 
        FROM certifications c 
        JOIN employees e ON c.emp_id = e.id 
        ORDER BY c.id DESC
    ''').fetchall()
    certs = [dict(r) for r in rows]
    conn.close()
    return jsonify(certs)

@app.route('/api/certifications/issue', methods=['POST'])
def issue_certification():
    data = request.json
    emp_id = data.get('emp_id')
    level_name = data.get('level_name', 'Level 2 - TPS Practitioner')
    signatory = data.get('signatory', 'Antony John Sudhakar P (VP)')

    conn = get_db()
    cursor = conn.cursor()
    emp = cursor.execute('SELECT * FROM employees WHERE id = ?', (emp_id,)).fetchone()
    if not emp:
        conn.close()
        return jsonify({"error": "Employee not found"}), 404

    cert_no = f"TIEI/TPS/2026/{str(emp_id).zfill(3)}-{random.randint(10,99)}"
    cursor.execute('''
        INSERT INTO certifications (cert_no, emp_id, emp_name, level_name, issue_date, signatory, status)
        VALUES (?, ?, ?, ?, date('now'), ?, 'Active')
    ''', (cert_no, emp_id, emp['name'], level_name, signatory))

    if 'Level 2' in level_name:
        cursor.execute('UPDATE employees SET practitioner_certified = 1, current_level = 2, target_level = 3 WHERE id = ?', (emp_id,))
    elif 'Level 3' in level_name:
        cursor.execute('UPDATE employees SET champion_certified = 1, current_level = 3, target_level = 4 WHERE id = ?', (emp_id,))

    conn.commit()
    conn.close()
    return jsonify({"success": True, "cert_no": cert_no})

@app.route('/api/training_batches')
def get_batches():
    conn = get_db()
    cursor = conn.cursor()
    rows = cursor.execute('SELECT * FROM training_batches ORDER BY id ASC').fetchall()
    batches = [dict(r) for r in rows]
    conn.close()
    return jsonify(batches)

@app.route('/api/kaizen_requests')
def get_kaizens():
    conn = get_db()
    cursor = conn.cursor()
    rows = cursor.execute('SELECT * FROM kaizen_requests ORDER BY id DESC').fetchall()
    kaizens = [dict(r) for r in rows]
    conn.close()
    return jsonify(kaizens)

# ==========================================
# TRAINING ATTENDANCE ENDPOINTS (Mark & Track)
# ==========================================
@app.route('/api/attendance', methods=['GET', 'POST'])
def manage_attendance():
    conn = get_db()
    cursor = conn.cursor()

    if request.method == 'POST':
        data = request.json or {}
        # Support single mark or batch list
        items = data if isinstance(data, list) else [data]
        updated_ids = []

        for item in items:
            att_id = item.get('id')
            batch_id = item.get('batch_id')
            emp_id = item.get('emp_id')
            status = item.get('status', 'Present')
            remarks = item.get('remarks', '')
            session_date = item.get('session_date')

            if att_id:
                cursor.execute('''
                    UPDATE training_attendance
                    SET status = ?, remarks = ?, marked_at = datetime('now')
                    WHERE id = ?
                ''', (status, remarks, att_id))
                updated_ids.append(att_id)
            elif batch_id and emp_id and session_date:
                # Find or insert
                existing = cursor.execute('''
                    SELECT id FROM training_attendance
                    WHERE batch_id = ? AND emp_id = ? AND session_date = ?
                ''', (batch_id, emp_id, session_date)).fetchone()
                if existing:
                    cursor.execute('''
                        UPDATE training_attendance
                        SET status = ?, remarks = ?, marked_at = datetime('now')
                        WHERE id = ?
                    ''', (status, remarks, existing[0]))
                    updated_ids.append(existing[0])
                else:
                    # Lookup emp
                    emp = cursor.execute('SELECT emp_no, name, working_area FROM employees WHERE id = ?', (emp_id,)).fetchone()
                    batch = cursor.execute('SELECT batch_code FROM training_batches WHERE id = ?', (batch_id,)).fetchone()
                    e_no = emp[0] if emp else ''
                    e_name = emp[1] if emp else ''
                    e_dept = f"GD {emp[2]} Machining" if emp else 'GD'
                    b_code = batch[0] if batch else 'BATCH'
                    cursor.execute('''
                        INSERT INTO training_attendance (
                            batch_id, batch_code, emp_id, emp_no, emp_name, department,
                            session_date, session_topic, status, marked_by, marked_at, remarks
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Dilip R (Master Trainer)', datetime('now'), ?)
                    ''', (batch_id, b_code, emp_id, e_no, e_name, e_dept, session_date, item.get('session_topic', 'Training Session'), status, remarks))
                    updated_ids.append(cursor.lastrowid)

        conn.commit()
        conn.close()
        return jsonify({"success": True, "updated_ids": updated_ids})

    # GET: Query attendance
    batch_id = request.args.get('batch_id')
    session_date = request.args.get('session_date')
    emp_no = request.args.get('emp_no')

    query = 'SELECT * FROM training_attendance WHERE 1=1'
    params = []

    if batch_id and batch_id != 'ALL':
        query += ' AND (batch_id = ? OR batch_code = ?)'
        params.extend([batch_id, str(batch_id)])
    if session_date:
        query += ' AND session_date = ?'
        params.append(session_date)
    if emp_no:
        query += ' AND UPPER(emp_no) = ?'
        params.append(emp_no.upper())

    query += ' ORDER BY session_date DESC, emp_name ASC'
    rows = cursor.execute(query, params).fetchall()
    results = [dict(r) for r in rows]
    conn.close()
    return jsonify(results)

@app.route('/api/attendance/summary')
def get_attendance_summary():
    conn = get_db()
    cursor = conn.cursor()
    batch_param = request.args.get('batch_id', '1')

    # Candidate-wise summary for batch
    rows = cursor.execute('''
        SELECT emp_id, emp_no, emp_name, department,
               COUNT(*) as total_sessions,
               SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as attended_sessions,
               SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) as absent_sessions
        FROM training_attendance
        WHERE batch_id = ? OR batch_code = ?
        GROUP BY emp_id, emp_no, emp_name, department
        ORDER BY emp_name ASC
    ''', (batch_param, str(batch_param))).fetchall()

    candidates = []
    total_present = 0
    total_records = 0

    for r in rows:
        d = dict(r)
        pct = round((d['attended_sessions'] / d['total_sessions'] * 100), 1) if d['total_sessions'] > 0 else 0
        d['attendance_pct'] = pct
        d['is_eligible'] = pct >= 80.0 # 80% attendance required as per Understanding Doc
        candidates.append(d)
        total_present += d['attended_sessions']
        total_records += d['total_sessions']

    overall_pct = round((total_present / total_records * 100), 1) if total_records > 0 else 94.4

    # List of unique session dates for batch
    session_rows = cursor.execute('''
        SELECT DISTINCT session_date, session_topic 
        FROM training_attendance 
        WHERE batch_id = ? OR batch_code = ?
        ORDER BY session_date ASC
    ''', (batch_param, str(batch_param))).fetchall()
    sessions = [dict(s) for s in session_rows]

    conn.close()
    return jsonify({
        "batch_id": batch_param,
        "overall_attendance_pct": overall_pct,
        "total_enrolled": len(candidates),
        "eligible_count": sum(1 for c in candidates if c['is_eligible']),
        "sessions": sessions,
        "candidates": candidates
    })

# ==========================================
# DEPARTMENT TPS NOMINATIONS / PROPOSALS
# ==========================================
@app.route('/api/department_nominations/stats')
def get_department_nominations_stats():
    conn = get_db()
    cursor = conn.cursor()

    rows = cursor.execute('''
        SELECT department,
               COUNT(*) as total_proposed,
               SUM(CASE WHEN status IN ('Enrolled in Batch', 'Training Completed') THEN 1 ELSE 0 END) as enrolled,
               SUM(CASE WHEN status = 'Training Completed' THEN 1 ELSE 0 END) as completed,
               SUM(CASE WHEN status = 'Proposed' THEN 1 ELSE 0 END) as pending_review
        FROM department_nominations
        GROUP BY department
        ORDER BY total_proposed DESC
    ''').fetchall()

    departments = []
    proposed = []
    enrolled = []
    completed = []
    pending = []

    for r in rows:
        departments.append(r['department'])
        proposed.append(r['total_proposed'])
        enrolled.append(r['enrolled'])
        completed.append(r['completed'])
        pending.append(r['pending_review'])

    total_all_proposed = sum(proposed)
    total_all_enrolled = sum(enrolled)
    total_all_completed = sum(completed)

    conn.close()
    return jsonify({
        "departments": departments,
        "proposed": proposed,
        "enrolled": enrolled,
        "completed": completed,
        "pending": pending,
        "total_proposed": total_all_proposed,
        "total_enrolled": total_all_enrolled,
        "total_completed": total_all_completed
    })

@app.route('/api/department_nominations', methods=['GET', 'POST'])
def manage_department_nominations():
    conn = get_db()
    cursor = conn.cursor()

    if request.method == 'POST':
        data = request.json or {}
        emp_no = str(data.get('emp_no', '')).strip().upper()
        emp_name = str(data.get('emp_name', '')).strip()
        department = data.get('department', 'GD Head Machining')
        designation = data.get('designation', 'Team Leader')
        proposed_level = data.get('proposed_level', 'Level 2 - TPS Practitioner')
        justification = data.get('justification', 'Proposed for next TPS competency batch')
        nominated_by = data.get('nominated_by', 'MANUKUMAR G (Section Manager)')

        # Match existing employee id
        matched = cursor.execute("SELECT id FROM employees WHERE UPPER(emp_no) = ?", (emp_no,)).fetchone()
        emp_id = matched[0] if matched else None

        cursor.execute('''
            INSERT INTO department_nominations (
                emp_id, emp_no, emp_name, department, designation, proposed_level,
                nominated_by, nomination_date, justification, status, batch_code
            ) VALUES (?, ?, ?, ?, ?, ?, ?, date('now'), ?, 'Proposed', 'Upcoming Q4 Batch')
        ''', (emp_id, emp_no, emp_name, department, designation, proposed_level, nominated_by, justification))
        conn.commit()
        new_id = cursor.lastrowid
        conn.close()
        return jsonify({"success": True, "id": new_id, "message": f"Employee {emp_name} ({emp_no}) nominated successfully!"})

    # GET: Query nominations
    dept = request.args.get('department')
    status = request.args.get('status')
    search = request.args.get('search')

    query = 'SELECT * FROM department_nominations WHERE 1=1'
    params = []

    if dept and dept != 'ALL':
        query += ' AND department = ?'
        params.append(dept)
    if status and status != 'ALL':
        query += ' AND status = ?'
        params.append(status)
    if search:
        query += ' AND (emp_name LIKE ? OR emp_no LIKE ? OR justification LIKE ?)'
        params.extend([f'%{search}%', f'%{search}%', f'%{search}%'])

    query += ' ORDER BY id DESC'
    rows = cursor.execute(query, params).fetchall()
    nominations = [dict(r) for r in rows]
    conn.close()
    return jsonify(nominations)

@app.route('/api/promotion_readiness/<int:emp_id>')
def check_promotion_readiness(emp_id):
    conn = get_db()
    cursor = conn.cursor()
    emp = cursor.execute('SELECT * FROM employees WHERE id = ?', (emp_id,)).fetchone()
    if not emp:
        conn.close()
        return jsonify({"error": "Not found"}), 404

    target_level = emp['target_level']
    gaps = []
    eligibility = "Eligible"

    if target_level == 2: # Practitioner
        if emp['training_status'] < 2:
            gaps.append({"item": "TPS Intermediate Training", "required": "Completed (100%)", "actual": "Pending", "met": False})
        else:
            gaps.append({"item": "TPS Intermediate Training", "required": "Completed (100%)", "actual": "Completed", "met": True})

        if emp['post_test_score'] < 70:
            gaps.append({"item": "Post-Training Test Score", "required": ">= 70%", "actual": f"{emp['post_test_score']}%", "met": False})
        else:
            gaps.append({"item": "Post-Training Test Score", "required": ">= 70%", "actual": f"{emp['post_test_score']}%", "met": True})

        if emp['assignment_status'] < 2:
            gaps.append({"item": "Action Learning (KOMARIGOTO & 21 KVP)", "required": "Submitted & Verified", "actual": "Not Submitted", "met": False})
        else:
            gaps.append({"item": "Action Learning (KOMARIGOTO & 21 KVP)", "required": "Submitted & Verified", "actual": "Submitted", "met": True})

        if emp['presentation_mgr'] < 2 or emp['presentation_vp'] < 2:
            gaps.append({"item": "Board Presentation to MGR & VP", "required": "Completed", "actual": "Pending Leadership Review", "met": False})
        else:
            gaps.append({"item": "Board Presentation to MGR & VP", "required": "Completed", "actual": "Completed", "met": True})

        if emp['kaizens_approved'] < 2:
            gaps.append({"item": "Approved Shop-Floor Kaizens", "required": ">= 2 Kaizens", "actual": f"{emp['kaizens_approved']} Kaizens", "met": False})
        else:
            gaps.append({"item": "Approved Shop-Floor Kaizens", "required": ">= 2 Kaizens", "actual": f"{emp['kaizens_approved']} Kaizens", "met": True})

    elif target_level == 3: # Champion / Adv Practitioner
        if emp['practitioner_certified'] == 0:
            gaps.append({"item": "TPS Practitioner Certification", "required": "Certified", "actual": "Not Certified", "met": False})
        else:
            gaps.append({"item": "TPS Practitioner Certification", "required": "Certified", "actual": "Certified", "met": True})

        if emp['jishuken_1'] == 0:
            gaps.append({"item": "Jishuken-1 Participation", "required": "Completed", "actual": "Pending", "met": False})
        else:
            gaps.append({"item": "Jishuken-1 Participation", "required": "Completed", "actual": "Completed", "met": True})

        if emp['jishuken_2'] == 0:
            gaps.append({"item": "Jishuken-2 Participation", "required": "Completed", "actual": "Pending", "met": False})
        else:
            gaps.append({"item": "Jishuken-2 Participation", "required": "Completed", "actual": "Completed", "met": True})

        if emp['champion_eval'] < 80:
            gaps.append({"item": "Master Trainer Evaluation", "required": ">= 80%", "actual": f"{emp['champion_eval']}%", "met": False})
        else:
            gaps.append({"item": "Master Trainer Evaluation", "required": ">= 80%", "actual": f"{emp['champion_eval']}%", "met": True})

        if emp['kaizens_approved'] < 5:
            gaps.append({"item": "Approved Shop-Floor Kaizens", "required": ">= 5 Kaizens", "actual": f"{emp['kaizens_approved']} Kaizens", "met": False})
        else:
            gaps.append({"item": "Approved Shop-Floor Kaizens", "required": ">= 5 Kaizens", "actual": f"{emp['kaizens_approved']} Kaizens", "met": True})

    unmet_count = sum(1 for g in gaps if not g['met'])
    if unmet_count == 0:
        eligibility = "Eligible for Promotion / Level Upgrade"
        status_color = "emerald"
    elif unmet_count <= 2:
        eligibility = "Partially Eligible (Action Plan Required)"
        status_color = "amber"
    else:
        eligibility = "Not Eligible (Major Gaps Pending)"
        status_color = "rose"

    conn.close()
    return jsonify({
        "emp_name": emp['name'],
        "emp_no": emp['emp_no'],
        "current_level": emp['current_level'],
        "target_level": target_level,
        "eligibility_status": eligibility,
        "status_color": status_color,
        "gaps": gaps
    })

if __name__ == '__main__':
    print("Starting TPS LMS Prototype on http://127.0.0.1:5000 ...")
    app.run(host='127.0.0.1', port=5000, debug=False)
