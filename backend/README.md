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

3. **TIEI Employee Details API Sync & Ingestion Engine (`emp_sync.py`):**
   - Connects to internal TIEI HRMS/ERP Employee Details API endpoints or ingests Postman exports.
   - Maps API payload fields: `EMP_NO`, `EMP_NAME`, `EMP_BOSS`, `EMP_DEPT`, `ADD_OFFICE_MAILID`, `DEP_DEPTNAME`.
   - Safe Upsert: Preserves active TPS competency levels, test scores, certifications, and kaizen history.
   - Ingestion Endpoints:
     - `POST /api/employees/sync`: Remote API sync with configurable URL and Bearer Token.
     - `POST /api/employees/import`: Direct JSON payload upload/ingestion.
     - `GET /api/employees/sync/status`: Reports sync telemetry and counts.
   - CLI Tool (`sync_employees.py`): Run automated synchronization via command line or cron:
     ```bash
     python sync_employees.py --url https://tiei.internal/hr/api --token <BEARER_TOKEN>
     python sync_employees.py --file postman_export.json
     ```

4. **Dashboard & Telemetry REST API (`/api/stats`):**
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
