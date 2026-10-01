# Toyota Production System (TPS) Competency & Learning Management System

> **TIEI — Toyota Industries Engine India**  
> **Manufacturing Excellence Group • TPS Office**

An enterprise web application prototype designed to digitally manage the complete lifecycle of Toyota Production System (TPS) competency development, shop-floor Kaizen integration, skill matrices, and promotion readiness.

---

## 🌟 Key Features

1. **Executive Dashboard & Plant TPS Maturity:**
   - Real-time operational telemetry tracking 78 Team Leaders across GD Division shops.
   - Interactive Chart.js visualizations for Shop-floor TPS Maturity (GD Head, Crank, Block, Line Supply) and 4-Level Competency progression.
   - Cumulative approved Kaizen cost savings and verified ROI.

2. **11-Step Standardized Employee Journey (`000_Flow.xlsx`):**
   - End-to-end milestone tracker: Nomination & Training $\rightarrow$ Pre/Post Tests $\rightarrow$ Action Learning Assignment $\rightarrow$ MGR/VP Presentations $\rightarrow$ Level 2 Practitioner Certification $\rightarrow$ Jishuken 1 & 2 $\rightarrow$ Master Trainer Evaluation $\rightarrow$ Level 3 Champion Certification $\rightarrow$ Mentor Deployment.
   - Interactive milestone simulation and real-time database updates.

3. **Action Learning Presentation Board (`TPS Presentation Board_REV.xlsx`):**
   - Full 9-block digital layout (Sheets 3.1 - 3.9).
   - **Section 3.1: Worksite KOMARIGOTO (Challenges):** Categorized by **S-E-Q-P-C** (*Safety, Environment, Quality, Productivity, Cost*), tracking target vs. actual metrics, and priority.
   - **Section 3.2 & 3.3: 21 Kaizen View Points (21 KVP):** Interactive inspection matrix covering **Muri** (#1–3), **Mura** (#4–5), **Muda** (#6–20), and Gemba environment (#21).
   - **Section 3.6: Own Outlook:** Reflective learnings and revised daily worksite observation fields.

4. **Department Skill Matrix & Heatmap:**
   - Filterable by Shop Area (Head, Crank, Block, Line Supply) and Competency Level.
   - Live competency badges (*Certified, In Progress, Eligible, Locked*).

5. **Kaizen & "Amrut" System Integration:**
   - Read-only ingestion of approved Kaizens, cost savings, and machine fabrication run costs (Lathe ₹27/hr, Welding ₹26/hr, Bending ₹18/hr, Milling ₹14/hr, Drilling ₹12/hr, etc.).

6. **Automated Promotion Readiness & Gap Analysis Engine:**
   - Evaluates employee compliance against the next TPS Competency Level criteria.
   - Highlights exact **MET** vs. **UNMET GAP** badges with action plans.

7. **Official Digital Certificate Generator:**
   - Generates an official, print-ready **Certificate of Competency** with certificate serial numbers, authorized signatures, and verification QR code.

8. **Role Switcher & RBAC:**
   - Easily simulate views for **Team Leader**, **Section Manager / HoD**, **Master Trainer**, **TPS Office Admin**, and **Plant VP / DMD**.

---

## 🛠️ Technology Stack

- **Backend:** Python 3, Flask, SQLite3
- **Frontend:** HTML5, Tailwind CSS (CDN), FontAwesome 6, Chart.js
- **Architecture:** Responsive Single-Page Application (SPA) with RESTful API endpoints

---

## 🚀 Getting Started

### Prerequisites
- Python 3.8 or higher
- `pip install -r requirements.txt`

### Running the Application

1. **Option 1 (One-click on Windows):**
   Double-click `run_prototype.bat`

2. **Option 2 (Terminal):**
   ```bash
   cd prototype
   python init_db.py   # Initializes SQLite database with 78 team leaders
   python app.py       # Starts the server on http://127.0.0.1:5000
   ```

3. Open your browser and navigate to:
   ```
   http://127.0.0.1:5000
   ```
