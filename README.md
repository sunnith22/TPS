# Toyota Industries Engine India (TIEI) - GD Division
## TPS Competency Development, Certification & Learning Management System

Enterprise full-stack web application designed for Toyota Production System (TPS) competency progression, 11-step qualification journey, gemba action learning (9-Block Presentation Board), Amrut Kaizen integration, and official certification issuance across 78 Team Leaders in GD Division.

---

### Tech Stack

- **Frontend (`client/`):**
  - **Framework:** React 18 with TypeScript & Vite
  - **Styling:** Tailwind CSS (Toyota theme: Crimson Red, Charcoal, Gemba slate)
  - **Icons:** Lucide React
  - **API Client:** Axios
  - **Port:** `http://localhost:3000`

- **Backend (`server/`):**
  - **Runtime & Framework:** Node.js (v22) + Express + TypeScript (`tsx`)
  - **Storage:** PostgreSQL 16 (`pg` pool) with DDL schema migration
  - **Resilience Engine:** Adaptive storage adapter with automatic Excel ingestion fallback
  - **Port:** `http://127.0.0.1:8000`

---

### Key System Capabilities

1. **Executive Telemetry & Dashboard:**
   - 78 Team Leaders tracked across HEAD, CRANK, BLOCK, LINE SUPPLY, ASSY 1/2/3, TOOL MGT, MEG, DC.
   - 75.6% Dojo training completion rate.
   - Cumulative cost savings tracker (₹1.46+ Cr delivered via Kaizen).
   - Gemba productivity gains (4.0 hours/day waste elimination).

2. **Interactive 11-Step Competency Journey:**
   - Step 1: Nomination by Shop Manager
   - Step 2: Pre-Assessment Knowledge Diagnostic
   - Step 3: 3-Day Classroom & Practical Dojo Training
   - Step 4: Post-Assessment Test (Target &ge; 70%)
   - Step 5: Gemba Komarigoto Problem Identification
   - Step 6: Standardized Work (3 Slips) & 21 KVP Countermeasures
   - Step 7: Shop Manager Defense Presentation & Sign-off
   - Step 8: Executive VP Defense Presentation (Antony John Sudhakar P)
   - Step 9: Level 2 - TPS Practitioner Certification Awarded
   - Step 10: Jishuken Projects 1 & 2 Execution
   - Step 11: Level 3 - TPS Champion Defense & Certification

3. **Digital 9-Block Presentation Board & 21 KVP Library:**
   - Reproduction of the official TIEI 9-Block board (Candidate Profile, Gemba Area, Komarigoto, Current vs Target, 21 KVP, Countermeasures, Tangible Effect, Standardization 5S, Reflection).
   - Full 21 Kaizen Viewpoints categorized under Muri (Overburden), Mura (Unevenness), and Muda (Waste).
   - Komarigoto challenge logger with S-E-Q-P-C classification.

4. **GD Division Skill Matrix (78 Team Leaders):**
   - Ingested directly from `001_TPS Journey Visualisation.xlsx`.
   - Real-time search, filter by shop area and qualification tier (Level 1-4).

5. **Automated Promotion Gap Analysis Engine:**
   - Real-time audit against prerequisite criteria.
   - One-click official certificate issuance upon milestone clearance.

6. **Amrut Kaizen Integration & Machine Cost Engineering:**
   - Live costing based on TIEI standard hourly rates:
     - Milling: ₹35 / hr
     - Lathe: ₹27 / hr
     - Welding: ₹26 / hr
     - Surface Grinding: ₹30 / hr
     - Boring: ₹38 / hr
     - Drilling: ₹22 / hr
     - Assembly Fixture: ₹18 / hr
     - Manpower: ₹250 / hr
   - Proposals registry and annual ROI calculation.

7. **Official Credential Registry & Printable Certificates:**
   - Gold-embossed high-resolution certificates with authorized signatory.
   - Dynamic QR Code for instant tamper-proof authentication.

---

### Quick Start Guide

#### Option 1: Run Full Stack with One Click (Windows)
Double-click `run_fullstack.bat` in the root folder.
This opens both the Node.js backend (`http://127.0.0.1:8000`) and React frontend (`http://localhost:3000`).

#### Option 2: Run Backend and Frontend Manually

**1. Start Backend:**
```bash
cd server
npm install
npm run dev
```

**2. Start Frontend:**
```bash
cd client
npm install
npm run dev
```

#### Option 3: PostgreSQL Database
To run a local PostgreSQL instance via Docker:
```bash
cd server
docker compose up -d
```
The server will automatically connect to PostgreSQL on port 5432, run `schema.sql`, and seed the 78 Team Leaders.
*Note: If PostgreSQL is not running, the application's adaptive engine automatically activates with all 78 Team Leaders and 21 KVP items loaded, ensuring immediate local execution without stoppage.*
