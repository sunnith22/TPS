# TPS LMS - Frontend Architecture

## Toyota Industries Engine India (TIEI) - GD Division
### TPS Competency Development, Certification & Learning Management System

The frontend provides an enterprise, minimalist, responsive user interface specifically styled for Toyota Industries Engine India (TIEI). It aligns with TIEI official branding (Deep Toyota Blue `#002D62`, TIEI Cyan `#0072CE`, Precision Charcoal, Gemba Slate).

---

### Key User Interface Modules

1. **Authentication & Role-Based Workspaces:**
   - Single sign-on portal with real-time credentials validation.
   - Quick role preview switchers for testing plant hierarchy personas (Manager, TL, GAT, WT, TPS Admin).
   - Strict view isolation: associate workstations only display personal data; supervisor views display cell and team aggregates.

2. **Executive Telemetry Dashboard:**
   - Plant TPS capability metrics (Total Associates, Completion Rate, Certified Practitioners, Amrut Kaizen Cost Savings).
   - Chart.js visual telemetry:
     - Shop-floor TPS Maturity by Working Area (GD Head, Crank, Block, Assembly, Supply).
     - Competency Progression Pipeline (Level 1 Foundation through Level 4 Master).
     - **Department Suggestions for TPS Training Graph**: Department-wise proposed candidates distribution.

3. **Shop-Floor Training Attendance Register:**
   - Interactive attendance tracking by training batch and date.
   - TPS Admin exclusive permission to mark, update, and persist daily attendance.
   - Associate-restricted view showing only personal attendance records.

4. **Interactive 11-Step Toyota Qualification Journey:**
   - Step 1: Shop Manager Nomination
   - Step 2: Pre-Assessment Knowledge Diagnostic
   - Step 3: 3-Day Classroom & Practical Dojo Training
   - Step 4: Post-Assessment Test (Target &ge; 70%)
   - Step 5: Gemba Komarigoto Problem Identification
   - Step 6: Standardized Work (3 Slips) & 21 KVP Countermeasures
   - Step 7: Shop Manager Defense Presentation & Sign-off
   - Step 8: Production Kaizen Implementation
   - Step 9: Amrut Kaizen System Integration
   - Step 10: Official Level 2 Practitioner Certification
   - Step 11: Continuous Mentorship & Horizontal Deployment (Yokoten)
   - Real-time file upload modal with remarks for auditing qualification evidence.

5. **Toyota A3 1-Slide Management Presentation Canvas:**
   - Single-slide summary board for executive review.
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
