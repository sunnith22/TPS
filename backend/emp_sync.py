"""
TIEI Employee API Ingestion & Synchronization Engine
Integrates external TIEI HRMS / ERP Employee APIs into TPS Database.

Field Mapping:
- EMP_NO             -> employees.emp_no
- EMP_NAME           -> employees.name
- EMP_BOSS           -> employees.reports_to_emp_no
- EMP_DEPT           -> employees.dept_code
- ADD_OFFICE_MAILID  -> employees.email
- DEP_DEPTNAME       -> employees.working_area
"""

import sqlite3
import json
import urllib.request
import urllib.error
import ssl
from datetime import datetime

def ensure_sync_columns(conn):
    """Ensure email, dept_code, and last_synced_at exist in employees table."""
    cursor = conn.cursor()
    cursor.execute("PRAGMA table_info(employees)")
    cols = [row[1] for row in cursor.fetchall()]

    if 'email' not in cols:
        cursor.execute("ALTER TABLE employees ADD COLUMN email TEXT")
    if 'dept_code' not in cols:
        cursor.execute("ALTER TABLE employees ADD COLUMN dept_code TEXT")
    if 'last_synced_at' not in cols:
        cursor.execute("ALTER TABLE employees ADD COLUMN last_synced_at TEXT")
    conn.commit()

def sanitize_employee_record(item):
    """
    Validates and normalizes incoming TIEI API payload.
    Handles empty records, dict emails like {}, and formats employee IDs.
    """
    if not isinstance(item, dict):
        return None

    emp_no = str(item.get('EMP_NO') or item.get('emp_no') or '').strip()
    if not emp_no or emp_no.lower() in ('null', 'none', '{}'):
        return None  # Skip metadata or header objects lacking EMP_NO

    name = str(item.get('EMP_NAME') or item.get('name') or '').strip().upper()
    if not name:
        name = f"ASSOCIATE {emp_no}"

    boss_emp_no = str(item.get('EMP_BOSS') or item.get('reports_to') or '').strip()
    if boss_emp_no.lower() in ('null', 'none', '{}'):
        boss_emp_no = None

    dept_code = str(item.get('EMP_DEPT') or item.get('dept_code') or '').strip()
    if dept_code.lower() in ('null', 'none', '{}'):
        dept_code = None

    dept_name = str(item.get('DEP_DEPTNAME') or item.get('dept_name') or item.get('working_area') or '').strip()
    if not dept_name or dept_name.lower() in ('null', 'none', '{}'):
        dept_name = "PRODUCTION"

    # ADD_OFFICE_MAILID can be string or empty dict {}
    raw_email = item.get('ADD_OFFICE_MAILID') or item.get('email')
    email = ""
    if isinstance(raw_email, str):
        email = raw_email.strip().lower()

    return {
        "emp_no": emp_no,
        "name": name,
        "reports_to_emp_no": boss_emp_no,
        "dept_code": dept_code,
        "working_area": dept_name,
        "email": email
    }

def sync_employees_data(conn, records, source_label="API"):
    """
    Safely upserts employees into local database:
    - Existing records: preserves current_level, certifications, kaizens, scores.
    - New records: inserts with default role 'AE', level 1, password 'tiei123'.
    - Resolves boss names automatically.
    """
    ensure_sync_columns(conn)
    cursor = conn.cursor()

    if not isinstance(records, list):
        if isinstance(records, dict) and 'data' in records:
            records = records['data']
        else:
            raise ValueError("Employee API response must be a JSON array or have a 'data' array")

    now_iso = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    sanitized = []
    boss_lookup = {}
    for r in records:
        clean = sanitize_employee_record(r)
        if clean:
            sanitized.append(clean)
            boss_lookup[clean['emp_no']] = clean['name']

    # Also pull existing employee names into boss_lookup
    existing_emps = cursor.execute("SELECT emp_no, name, hierarchy_role FROM employees").fetchall()
    existing_roles = {}
    for row in existing_emps:
        boss_lookup[row[0]] = row[1]
        existing_roles[row[0]] = row[2]

    # Detect supervisor candidates from records (if people report to them)
    boss_counts = {}
    for s in sanitized:
        b_no = s['reports_to_emp_no']
        if b_no:
            boss_counts[b_no] = boss_counts.get(b_no, 0) + 1

    inserted = 0
    updated = 0

    for s in sanitized:
        emp_no = s['emp_no']
        name = s['name']
        boss_no = s['reports_to_emp_no']
        working_area = s['working_area']
        dept_code = s['dept_code']
        email = s['email']

        # Determine boss name string
        boss_name = None
        if boss_no and boss_no in boss_lookup:
            boss_name = f"{boss_lookup[boss_no]} (#{boss_no})"
        elif boss_no:
            boss_name = f"Reporting to #{boss_no}"

        # Check if already exists in DB (checks exact, zero-stripped, and zero-padded variants)
        variants = [emp_no]
        if emp_no.isdigit():
            stripped_v = emp_no.lstrip('0')
            if stripped_v:
                variants.append(stripped_v)
            variants.append(emp_no.zfill(5))
        variants = list(set(variants))
        placeholders = ','.join(['?'] * len(variants))
        exists = cursor.execute(f"SELECT id, hierarchy_role, hierarchy_rank, boss_name, email FROM employees WHERE emp_no IN ({placeholders})", variants).fetchone()

        if exists:
            # Safe Update: DO NOT touch TPS scores, levels, or certifications!
            emp_id = exists[0]
            existing_role = exists[1]
            existing_boss_name = exists[3]
            existing_email = exists[4]

            final_boss_name = boss_name or existing_boss_name
            final_email = email or existing_email

            cursor.execute("""
                UPDATE employees SET
                    emp_no = ?,
                    name = ?,
                    working_area = ?,
                    dept_code = ?,
                    email = ?,
                    reports_to_emp_no = COALESCE(?, reports_to_emp_no),
                    boss_name = COALESCE(?, boss_name),
                    last_synced_at = ?
                WHERE id = ?
            """, (emp_no, name, working_area, dept_code, final_email, boss_no, final_boss_name, now_iso, emp_id))
            updated += 1
        else:
            # Infer hierarchy role if new
            role = "AE"
            rank = 5
            designation = "Associate Engineer (AE)"
            if boss_counts.get(emp_no, 0) >= 10:
                role = "GL"
                rank = 3
                designation = "Group Leader"
            elif boss_counts.get(emp_no, 0) >= 1:
                role = "TL"
                rank = 4
                designation = "Team Leader"

            cursor.execute("""
                INSERT INTO employees (
                    emp_no, name, division, working_area, dept_code, email,
                    designation, boss_name, reports_to_emp_no,
                    hierarchy_role, hierarchy_rank, gender,
                    current_level, target_level, training_status,
                    pre_test_score, post_test_score, assignment_status,
                    presentation_mgr, presentation_vp, presentation_dmd,
                    practitioner_certified, jishuken_1, jishuken_2,
                    champion_eval, champion_certified,
                    kaizens_submitted, kaizens_approved, cost_savings_inr, kpi_score,
                    password, avatar, last_synced_at
                ) VALUES (
                    ?, ?, ?, ?, ?, ?,
                    ?, ?, ?,
                    ?, ?, 'Male',
                    1, 2, 0,
                    0, 0, 0,
                    0, 0, 0,
                    0, 0, 0,
                    0, 0,
                    0, 0, 0, 70.0,
                    'tiei123',
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
                    ?
                )
            """, (
                emp_no, name, "GD", working_area, dept_code, email,
                designation, boss_name or "TIEI Management", boss_no,
                role, rank, now_iso
            ))
            inserted += 1

    conn.commit()
    return {
        "success": True,
        "source": source_label,
        "synced_at": now_iso,
        "total_received": len(records),
        "valid_processed": len(sanitized),
        "new_inserted": inserted,
        "updated": updated
    }

def fetch_and_sync_from_api(conn, api_url, auth_header=None, custom_headers=None, timeout=30):
    """
    Connects to an external HTTP/HTTPS TIEI Employee API endpoint and ingests records.
    """
    headers = {
        "User-Agent": "TIEI-TPS-App/2.0",
        "Accept": "application/json"
    }

    if auth_header:
        # If user supplies 'Bearer xxx' or just token 'xxx'
        if not auth_header.lower().startswith(('bearer ', 'basic ', 'token ')):
            headers["Authorization"] = f"Bearer {auth_header.strip()}"
        else:
            headers["Authorization"] = auth_header.strip()

    if custom_headers and isinstance(custom_headers, dict):
        headers.update(custom_headers)

    req = urllib.request.Request(api_url, headers=headers, method="GET")
    
    # Safe SSL context that handles corporate internal certificates if necessary
    ctx = ssl.create_default_context()
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=timeout) as response:
            status_code = response.getcode()
            if status_code != 200:
                raise RuntimeError(f"TIEI Employee API returned status {status_code}")
            raw_body = response.read().decode('utf-8')
            records = json.loads(raw_body)
            return sync_employees_data(conn, records, source_label=api_url)
    except urllib.error.HTTPError as e:
        error_msg = e.read().decode('utf-8', errors='ignore')
        raise RuntimeError(f"HTTP Error {e.code} connecting to API: {error_msg or e.reason}")
    except urllib.error.URLError as e:
        raise RuntimeError(f"Connection failed to '{api_url}': {e.reason}")
