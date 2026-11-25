# Toyota Industries Engine India (TIEI) - GD Division
## TPS Competency Development, Certification & Learning Management System

Enterprise full-stack live application designed for Toyota Production System (TPS) competency progression, 11-step qualification journey, shop-floor attendance management, 6-Block Toyota A3 presentation canvas, Amrut Kaizen integration, and official certification issuance across Team Leaders, Group Leaders, and associates in GD Division.

---

### Project Architecture

The live application is organized into a clean decoupled **Backend** and **Frontend** architecture:

```
TPS/
├── backend/                  # Flask REST API, SQLite Persistence & Plant Hierarchy RBAC
│   ├── app.py                # Main backend server application & API routes
│   ├── init_db.py            # SQLite schema initialization and seed database migration
│   ├── tps_database.db       # Active SQLite database (96 employees, batches, attendance, KVP)
│   ├── requirements.txt      # Python dependencies (Flask, openpyxl, python-dotenv)
│   ├── run_backend.bat       # Dedicated launcher for backend API server
│   └── README.md             # Backend architecture & REST API documentation
├── frontend/                 # Enterprise Responsive Single-Page Application (SPA)
│   ├── templates/
│   │   └── index.html        # UI views (Dashboard, Attendance, Journey, A3 Canvas, Skill Matrix)
│   ├── static/
│   │   ├── img/
│   │   │   └── tiei_logo.png # Official TIEI brand logo
│   │   └── uploads/          # Evidence documents & qualification uploads (.gitkeep)
│   └── README.md             # Frontend architecture & UI component documentation
├── run.py                    # Unified application runner
├── run.bat                   # 1-Click launcher script for Windows production
├── .gitignore                # Production ignore rules
└── README.md                 # Production deployment documentation
```

---

### Key System Capabilities

1. **Enterprise Plant Hierarchy & RBAC:**
   - Hierarchy: Manager (`MGR001`), Assistant Manager (`AM001`), Group Leader (`GL001`), Team Leader (`50031`), Associate Engineer (`70201`), Master Trainer (`TRN001`), and TPS Coordinator (`TPS001`).
   - Role-scoped data filters:
     - Associate Engineers (`AE`) only view their own allocated batch, personal attendance records, and personal 11-step journey.
     - Supervisory roles (TL, GL, AM, Manager) view cell and section telemetry and subordinates' progress.
     - **TPS Coordinator** (`TPS001`) has exclusive administrative authority to mark and verify attendance across all training batches.

2. **Executive Telemetry & Dashboard Visualizations:**
   - **Total GL's vs Certified GL's**: Group Leader certification tracking (8 Total GLs, 6 Certified - 75.0%).
   - **Total TL's vs Certified TL's**: Team Leader certification tracking across plant areas (78 Total TLs, 42 Certified - 53.8%).
   - **Department-Wise Competency (Dept Wise)**: Distribution of total associates vs certified practitioners across 8 plant departments.
   - **Month vs Month (Certified Associates in Each Month)**: Newly certified associates by month (Jan-Nov 2026) with cumulative trajectory.
   - **Training Proposals by Department**: Department-wise proposed, enrolled, and completed candidate distribution.

3. **Shop-Floor Training Attendance Register:**
   - Real-time attendance tracking across training batches (BATCH-2026-Q3-01, BATCH-2026-Q3-02, BATCH-2026-Q3-03).
   - Batch roster modal displaying all enrolled team members and their shop-floor designations.
   - Restricted marking permissions exclusively for TPS Coordinator.

4. **Interactive 11-Step Toyota Qualification Journey:**
   - Full 11-step competency journey from Shop Manager Nomination to Yokoten Horizontal Deployment.
   - Modal with evidence file upload and remarks for qualification step verification.

5. **Toyota A3 1-Slide Executive Presentation Canvas:**
   - Single-slide summary board for executive and HOD review.
   - 6-Block layout:
     - Block 1: Worksite Problem (Komarigoto) & Selected 21 Kaizen Viewpoints
     - Block 2: Root Cause Analysis (5-Why Investigation)
     - Block 3: Implemented Countermeasure (Kaizen)
     - Block 4: Tangible Results & Horizontal Deployment (Yokoten)
     - Block 5: Standardized Work (3 Slips: Capacity Sheet, Combination Sheet, Work Instruction)
     - Block 6: Sign-off & Competency Certification Status
   - Interactive 21 Kaizen Viewpoints selector (Muri, Mura, Muda) with dynamic counter.
   - 1-Click Print / PDF export and Fullscreen mode.

6. **Department Skill Matrix & Promotion Audit:**
   - 4-Level competency tracking (L1 Knowledge, L2 Basic Practice, L3 Independent, L4 Trainer/Master).
   - Automated promotion readiness gap analysis engine comparing actual vs. required criteria.

7. **TIEI Employee Details API Integration & Safe Ingestion:**
   - Live synchronization with internal TIEI HRMS / ERP Employee APIs.
   - Exact Postman schema ingestion:
     - `EMP_NO` &rarr; `emp_no` (5-digit plant badge format, e.g. `09069`)
     - `EMP_NAME` &rarr; `name` (Full associate name, e.g. `PRASANNA B V`)
     - `EMP_BOSS` &rarr; `reports_to_emp_no` & hierarchical supervisor line
     - `EMP_DEPT` &rarr; `dept_code` (Department numeric identifier, e.g. `396`)
     - `DEP_DEPTNAME` &rarr; `working_area` (Plant section, e.g. `PRODUCTION SUPPORT-AUTO`)
     - `ADD_OFFICE_MAILID` &rarr; `email` (Company email, supports strings or empty `{}`)
   - Safe Upsert Guarantee: Updating employee details never overwrites TPS journey progress, test scores, certifications, or Kaizen logs.
   - Backend-Driven Connection:
     - **Backend Configuration**: Set TIEI_EMP_API_URL and optional TIEI_EMP_API_KEY in ackend/config.py or ackend/.env.
     - **Startup Auto-Sync**: The backend automatically connects to the API on startup and populates/updates employee records.
     - **Background Scheduler**: A background daemon periodically refreshes employee records every 4 hours without any user intervention.
     - **Dynamic Login Resolution**: If an employee logs in with a new badge ID or email not yet cached locally, the backend queries the API in real time.
     - **CLI Synchronization Tool**: Run anytime via python backend/sync_employees.py (or specify --file data.json / --url <URL>).
   - Multi-Identifier Login: Associates can log in using their badge number (`09069`, `9069`), email address (`prasanna.bv@tiei.toyota-industries.com`), or employee name.

---

### Quick Start Guide

#### Prerequisites
- Python 3.10 or higher
- Modern Web Browser (Chrome, Edge, Firefox)

#### 1-Click Startup (Windows)
Double click `run.bat` or run:
```cmd
run.bat
```

#### Manual Startup
```bash
# 1. Install dependencies
pip install -r backend/requirements.txt

# 2. Launch live application
python run.py
```
Open your browser to: **`http://127.0.0.1:5000`**

---

### Standard Plant Personas (Sign In)

| Role | Employee ID | Name | Department / Working Area |
| :--- | :--- | :--- | :--- |
| **Section Manager** | `MGR001` | DEEPAK GUPTA | GD Section |
| **Assistant Manager** | `AM001` | GOVINDA R | HEAD & CRANK |
| **Group Leader** | `GL001` | BINDUKUMAR S | HEAD Line |
| **Team Leader** | `50031` | ARUNA D R | HEAD Line |
| **Associate Engineer** | `70201` | RAMESH K | HEAD Line |
| **Master Trainer** | `TRN001` | DILIP R | TPS DOJO / TRAINING |
| **TPS Coordinator** | `TPS001` | RAKSHITH PRABHU | TPS COORDINATION OFFICE |

*Default password: `password` (or `tiei123`)*
