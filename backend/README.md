# TPS LMS - Backend Architecture

## Toyota Industries Engine India (TIEI) - GD Division
### TPS Competency Development, Certification & Learning Management System

The backend is built with Python and Flask, delivering high-performance REST APIs, plant hierarchy access control, SQLite persistence, and static/template serving for the frontend.

---

### Key Capabilities

1. **Enterprise Plant Hierarchy & RBAC:**
   - Hierarchy: Manager (`MGR001`), Assistant Manager (`AM001`), Group Leader (`GL001`), Team Leader (`50031`), Associate Engineer (`70201`), Master Trainer (`TRN001`), and TPS Coordinator (`TPS001`).
   - Role-scoped data filters:
     - Associate Engineers (`AE`) see only their own assigned batch, personal attendance, personal 11-step journey milestones, and individual records.
     - Supervisory roles (TL, GL, AM, Manager) see aggregate telemetry, subordinates' progress, and department proposals.
     - **TPS Coordinator** (`TPS001`) has administrative authority to mark and verify attendance across all batches.

2. **Database Engine & Persistence:**
   - SQLite engine (`tps_database.db`) storing 96 shop-floor associates, training batches, attendance registers, 21 Kaizen Viewpoints master, step evidence uploads, skill matrix, and Amrut Kaizen records.
   - Idempotent schema migration via `init_db.py`.

3. **Backend-Driven TIEI Employee API Engine (emp_sync.py & config.py):**
   - Connects directly to internal TIEI HRMS/ERP Employee Details API completely from backend.
   - Maps API payload fields: EMP_NO, EMP_NAME, EMP_BOSS, EMP_DEPT, ADD_OFFICE_MAILID, DEP_DEPTNAME.
   - Safe Upsert: Preserves active TPS competency levels, test scores, certifications, and kaizen history.
   - **Configuration (ackend/config.py / .env)**:
     - Set TIEI_EMP_API_URL to your Postman endpoint URL.
     - Optional TIEI_EMP_API_KEY for Bearer token.
   - **Startup & Background Automation**:
     - Automatically synchronizes employee database on server startup.
     - Background daemon thread refreshes employee records every 4 hours without frontend interaction.
     - Real-time lookup: If an unknown employee ID logs in, backend automatically fetches them from API.
   - **CLI Tool (sync_employees.py)**:
     `ash
     python sync_employees.py
     python sync_employees.py --url https://tiei.internal/hr/api --token <BEARER_TOKEN>
     python sync_employees.py --file postman_export.json
     ``

4. **PostgreSQL Enterprise Database Layer (database.py & init_postgres.py):**
   - Dual-Mode Persistence: Connects to PostgreSQL (10.82.126.44:5432) in production, with automatic graceful fallback to SQLite (	ps_database.db).
   - Query translation: Automatically handles cross-database query syntax and dict cursors.
   - Initializer & Migration Tool (init_postgres.py):
     - Automatically creates the new target database on the PostgreSQL server.
     - Creates all 7 relational tables (employees, step_evidence, 	raining_attendance, department_nominations, komarigoto, certifications, 	raining_batches).
     - Migrates all 96 existing associates and plant records from SQLite into PostgreSQL.
     - Saves connection settings into ackend/.env.

5. **Dashboard & Telemetry REST API (`/api/stats`):**
   - `dept_stats`: Department-wise total associates vs certified practitioners across 8 departments.
   - `gl_stats`: Total GLs vs Certified GLs (8 GLs total, 6 certified - 75.0%).
   - `tl_stats`: Total TLs vs Certified TLs (78 TLs total, 42 certified - 53.8%) with plant area breakdown.
   - `month_stats`: Month vs Month newly certified associates with cumulative trajectory (Jan-Nov 2026).

---

### Running the Backend

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Initialize database (optional, pre-seeded database included)
python init_db.py

# 3. Launch backend server
python app.py
```
Default Server URL: `http://127.0.0.1:5000`
