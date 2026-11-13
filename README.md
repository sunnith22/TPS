# Toyota Industries Engine India (TIEI) - GD Division
## TPS Competency Development, Certification & Learning Management System

Enterprise full-stack live application designed for Toyota Production System (TPS) competency progression, 11-step qualification journey, shop-floor attendance management, 6-Block Toyota A3 presentation canvas, Amrut Kaizen integration, and official certification issuance across 78 Team Leaders and associates in GD Division.

---

### Project Architecture

The live application is organized into a clean decoupled **Backend** and **Frontend** architecture:

```
TPS/
├── backend/                  # Flask REST API, SQLite Persistence & Plant Hierarchy RBAC
│   ├── app.py                # Main backend server application & API routes
│   ├── init_db.py            # SQLite schema initialization and seed database migration
│   ├── tps_database.db       # Active SQLite database (93 employees, batches, attendance, KVP)
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
   - 6-Tier Hierarchy: Manager (`MGR001`), Assistant Manager (`AM001`), Group Leader (`GL001`), Team Leader (`50031`), Graduate Apprentice Trainee (`60101`), Work Trainee (`70201`), and TPS Admin (`TPS001`).
   - Role-scoped data filters:
     - Associate roles (GAT, WT) only view their own allocated batch, personal attendance records, and personal 11-step journey.
     - Supervisory roles (TL, GL, AM, Manager) view cell and section telemetry and subordinates' progress.
     - TPS Admin (`TPS001`) has administrative rights to mark and update daily attendance across all batches.

2. **Executive Telemetry & Suggestions Dashboard:**
   - Real-time shop-floor competency tracking for 78 Team Leaders across HEAD, CRANK, BLOCK, LINE SUPPLY, ASSY 1/2/3, TOOL MGT, MEG, and DC.
   - 75.6% Dojo training completion rate.
   - Cumulative cost savings tracker (₹2.24+ Cr delivered via Kaizen).
   - **Department Suggestions for TPS Training Graph**: Department-wise proposed candidates distribution.

3. **Shop-Floor Training Attendance Register:**
   - Real-time attendance tracking across training batches (BATCH-2026-001, BATCH-2026-002, BATCH-2026-003).
   - Batch roster modal displaying all enrolled team members and their shop-floor designations.

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

---

### Quick Start Guide

#### Prerequisites
- Python 3.10 or higher
- Web Browser (Chrome, Edge, Firefox)

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

### Default Credentials (Plant Personas)

| Role | Employee ID | Name | Working Area |
| :--- | :--- | :--- | :--- |
| **Manager** | `MGR001` | DEEPAK GUPTA | GD Section |
| **Group Leader** | `GL001` | BINDUKUMAR S | HEAD Line |
| **Team Leader** | `50031` | ARUNA D R | HEAD Line |
| **GAT Trainee** | `60101` | VINAY KUMAR | HEAD Line |
| **Work Trainee** | `70201` | PRADEEP M | HEAD Line |
| **TPS Admin** | `TPS001` | SURESH N | TPS Digital Office |

*Default password for all accounts: `password` (or `tiei123`)*
