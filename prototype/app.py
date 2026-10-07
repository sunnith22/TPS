import sqlite3
import os
import json
import random
from flask import Flask, render_template, jsonify, request

app = Flask(__name__, template_folder='templates', static_folder='static')
DB_PATH = os.path.join(os.path.dirname(__file__), 'tps_database.db')
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'static', 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

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

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/viewpoints_21')
def get_viewpoints():
    return jsonify(KVP_MASTER)

@app.route('/api/stats')
def get_stats():
    conn = get_db()
    cursor = conn.cursor()

    total_emps = cursor.execute('SELECT COUNT(*) FROM employees').fetchone()[0]
    trained_emps = cursor.execute('SELECT COUNT(*) FROM employees WHERE training_status >= 2').fetchone()[0]
    assignments_sub = cursor.execute('SELECT COUNT(*) FROM employees WHERE assignment_status >= 1').fetchone()[0]
    practitioner_certs = cursor.execute('SELECT COUNT(*) FROM employees WHERE practitioner_certified = 1').fetchone()[0]
    champion_certs = cursor.execute('SELECT COUNT(*) FROM employees WHERE champion_certified = 1').fetchone()[0]
    
    # Kaizen and cost metrics
    kaizen_totals = cursor.execute('''
        SELECT SUM(kaizens_submitted), SUM(kaizens_approved), SUM(cost_savings_inr) 
        FROM employees
    ''').fetchone()
    total_kaizens_sub = kaizen_totals[0] or 0
    total_kaizens_app = kaizen_totals[1] or 0
    total_savings = kaizen_totals[2] or 0

    # Area distribution
    area_rows = cursor.execute('''
        SELECT working_area, 
               COUNT(*) as total,
               SUM(CASE WHEN practitioner_certified = 1 THEN 1 ELSE 0 END) as certified,
               AVG(kpi_score) as avg_kpi
        FROM employees 
        GROUP BY working_area
    ''').fetchall()
    area_stats = [dict(r) for r in area_rows]

    # Level distribution
    level_rows = cursor.execute('''
        SELECT current_level, COUNT(*) as count 
        FROM employees 
        GROUP BY current_level
    ''').fetchall()
    level_stats = {r['current_level']: r['count'] for r in level_rows}

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
        "manhours_saved_per_day": 4.0, # From the approved digitalization form
        "area_stats": area_stats,
        "level_stats": level_stats
    })

@app.route('/api/employees')
def get_employees():
    area = request.args.get('area')
    search = request.args.get('search')
    level = request.args.get('level')
    
    conn = get_db()
    cursor = conn.cursor()
    query = 'SELECT * FROM employees WHERE 1=1'
    params = []
    
    if area and area != 'ALL':
        query += ' AND working_area = ?'
        params.append(area)
    if level and level != 'ALL':
        query += ' AND current_level = ?'
        params.append(int(level))
    if search:
        query += ' AND (name LIKE ? OR emp_no LIKE ? OR boss_name LIKE ?)'
        params.extend([f'%{search}%', f'%{search}%', f'%{search}%'])
        
    query += ' ORDER BY id ASC'
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
    
    emp_dict = dict(emp)
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
        # Also auto create cert record if not exists
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
    
    # Also update employee assignment status to 'Draft' or 'Submitted'
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
