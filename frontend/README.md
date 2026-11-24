# TPS LMS - Frontend Architecture

## Toyota Industries Engine India (TIEI) - GD Division
### TPS Competency Development, Certification & Learning Management System

The frontend provides an enterprise, minimalist, responsive user interface specifically styled for Toyota Industries Engine India (TIEI). It aligns with TIEI official branding (Deep Toyota Blue `#002D62`, TIEI Cyan `#0072CE`, Precision Charcoal, Gemba Slate).

---

### Key User Interface Modules

1. **Authentication & Role-Based Workspaces:**
   - Single sign-on portal with realistic production credentials validation (Demo account picker removed).
   - Strict view isolation: associate workstations only display personal data; supervisor views display cell and team aggregates.

2. **Executive Telemetry Dashboard:**
   - Plant TPS capability metrics (Total Associates, Completion Rate, Certified Practitioners, Amrut Kaizen Cost Savings).
   - **Total GL's vs Certified GL's**: Group Leader certification tracking (8 Total GLs, 6 Certified - 75.0%).
   - **Total TL's vs Certified TL's**: Team Leader certification tracking across plant areas (78 Total TLs, 42 Certified - 53.8%).
   - **Department-Wise Competency (Dept Wise)**: Distribution of total associates vs certified practitioners across 8 plant departments.
   - **Month vs Month (Certified Associates in Each Month)**: Newly certified associates by month (Jan-Nov 2026) with cumulative trajectory.
   - **Training Proposals by Department**: Department-wise proposed, enrolled, and completed candidate distribution.

3. **Shop-Floor Training Attendance Register:**
   - Interactive attendance tracking by training batch and date.
   - TPS Coordinator exclusive permission to mark, update, and persist daily attendance.
   - Associate-restricted view showing only personal attendance records.

4. **Interactive 11-Step Toyota Qualification Journey:**
   - Full 11-step competency journey from Shop Manager Nomination to Yokoten Horizontal Deployment.
   - Evidence file upload modal with remarks for qualification verification.

5. **Toyota A3 1-Slide Management Presentation Canvas:**
   - Single-slide summary board for executive review.
   - 6-Block layout with interactive 21 Kaizen Viewpoints selector (Muri, Mura, Muda).
   - 1-Click Print / PDF export and Fullscreen mode.

6. **Department Skill Matrix & Promotion Audit:**
   - 4-Level competency tracking (L1 Knowledge, L2 Basic Practice, L3 Independent, L4 Trainer/Master).
   - Automated promotion readiness gap analysis engine comparing actual vs. required criteria.
