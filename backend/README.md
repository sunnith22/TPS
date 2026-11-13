# TPS LMS - Backend Architecture

## Toyota Industries Engine India (TIEI) - GD Division
### TPS Competency Development, Certification & Learning Management System

The backend is built with Python and Flask, delivering high-performance REST APIs, plant hierarchy access control, SQLite persistence, and static/template serving for the frontend.

---

### Key Capabilities

1. **Enterprise Plant Hierarchy & RBAC:**
   - 6-Tier Hierarchy: Manager (`MGR001`), Assistant Manager (`AM001`), Group Leader (`GL001`), Team Leader (`50031`), Graduate Apprentice Trainee (`60101`), Work Trainee (`70201`), and TPS Admin (`TPS001`).
   - Role-scoped data filters:
     - GAT / WT sees only their own assigned batch, personal attendance, personal 11-step journey milestones, and individual records.
     - TL / GL / AM / Manager sees aggregate telemetry, subordinates' progress, and department proposals.
     - TPS Admin (`TPS001`) has administrative rights to mark/update attendance across all batches.

2. **Database Engine & Persistence:**
   - SQLite engine (`tps_database.db`) storing 93 shop-floor associates, training batches, attendance registers, 21 Kaizen Viewpoints master, step evidence uploads, skill matrix, and Amrut Kaizen records.
   - Idempotent schema migration via `init_db.py`.

3. **REST API Endpoints:**
   - `POST /api/auth/login` - Authenticate via Employee ID and password.
   - `GET /api/auth/current_user` - Retrieve active session profile and permissions.
   - `POST /api/auth/logout` - Clear active user session.
   - `GET /api/dashboard/stats` - Executive dashboard metrics ( associates, completion rate, cost savings).
   - `GET /api/departments/proposals` - Department-wise TPS training candidate suggestions.
   - `GET /api/attendance` - Role-scoped attendance register by batch and date.
   - `POST /api/attendance` - Mark/record attendance (TPS Admin only).
   - `GET /api/training/batches` - Training batch schedule, dates, trainer, and enrolled members.
   - `GET /api/journey/steps` - 11-Step Toyota qualification journey with evidence status.
   - `POST /api/journey/evidence` - Upload evidence files/remarks for qualification steps.
   - `GET /api/kvp/master` - 21 Kaizen Viewpoints (Muri, Mura, Muda) checklist.
   - `POST /api/presentation/save` - Save 6-Block Toyota A3 presentation canvas.
   - `GET /api/skill_matrix` - Department skill level matrix (Levels 1 to 4).
   - `GET /api/kaizens` - Amrut Kaizen integration data and cost-benefit analysis.
   - `GET /api/certifications` - Official certification records and badges.
   - `GET /api/promotion/gap_analysis` - Level progression audit and readiness assessment.

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
