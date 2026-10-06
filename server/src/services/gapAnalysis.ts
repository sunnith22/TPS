import { EmployeeRecord } from '../db/connection.js';

export interface GapItem {
  item: string;
  required: string;
  actual: string;
  met: boolean;
}

export interface PromotionReadiness {
  emp_name: string;
  emp_no: string;
  current_level: number;
  target_level: number;
  eligibility_status: string;
  status_color: 'emerald' | 'amber' | 'rose';
  gaps: GapItem[];
}

export function calculatePromotionGap(emp: EmployeeRecord): PromotionReadiness {
  const gaps: GapItem[] = [];
  const currentLvl = emp.current_level;
  const targetLvl = emp.target_level || currentLvl + 1;

  if (targetLvl === 2) {
    // 1. Dojo Training
    const trainingMet = emp.training_status === 2;
    gaps.push({
      item: 'Dojo Training Attendance (3 Days)',
      required: 'Completed (100%)',
      actual: trainingMet ? 'Completed' : (emp.training_status === 1 ? 'Scheduled' : 'Not Started'),
      met: trainingMet
    });

    // 2. Post-test score
    const postMet = Number(emp.post_test_score) >= 70.0;
    gaps.push({
      item: 'Knowledge Assessment (Post-Test)',
      required: 'Score >= 70%',
      actual: `${Number(emp.post_test_score).toFixed(1)}%`,
      met: postMet
    });

    // 3. Komarigoto Assignment
    const assignMet = emp.assignment_status >= 2;
    gaps.push({
      item: 'Komarigoto Action Learning Assignment',
      required: 'Submitted & Approved',
      actual: emp.assignment_status === 3 ? 'Approved' : (emp.assignment_status === 2 ? 'Submitted' : (emp.assignment_status === 1 ? 'Draft' : 'Pending')),
      met: assignMet
    });

    // 4. Mgr Presentation
    const mgrMet = emp.presentation_mgr === 2;
    gaps.push({
      item: 'Division Manager Presentation',
      required: 'Passed / Cleared',
      actual: mgrMet ? 'Cleared' : 'Pending Review',
      met: mgrMet
    });

    // 5. VP Presentation
    const vpMet = emp.presentation_vp === 2;
    gaps.push({
      item: 'Executive VP Presentation',
      required: 'Passed / Cleared',
      actual: vpMet ? 'Cleared' : 'Pending Review',
      met: vpMet
    });
  } else if (targetLvl === 3) {
    const pCertMet = emp.practitioner_certified === 1;
    gaps.push({
      item: 'Level 2 Practitioner Certification',
      required: 'Certified',
      actual: pCertMet ? 'Certified' : 'Not Certified',
      met: pCertMet
    });

    const j1Met = emp.jishuken_1 === 1;
    gaps.push({
      item: 'Jishuken Project 1 (Autonomous Study)',
      required: 'Completed & Validated',
      actual: j1Met ? 'Completed' : 'Incomplete',
      met: j1Met
    });

    const j2Met = emp.jishuken_2 === 1;
    gaps.push({
      item: 'Jishuken Project 2 (Cross-functional Kaizen)',
      required: 'Completed & Validated',
      actual: j2Met ? 'Completed' : 'Incomplete',
      met: j2Met
    });

    const evalMet = Number(emp.champion_eval) >= 80.0;
    gaps.push({
      item: 'Champion Panel Assessment',
      required: 'Score >= 80%',
      actual: `${Number(emp.champion_eval).toFixed(1)}%`,
      met: evalMet
    });

    const dmdMet = emp.presentation_dmd === 2;
    gaps.push({
      item: 'Deputy Managing Director (DMD) Defense',
      required: 'Cleared',
      actual: dmdMet ? 'Cleared' : 'Pending',
      met: dmdMet
    });
  } else {
    // Level 4 Master
    const cCertMet = emp.champion_certified === 1;
    gaps.push({
      item: 'Level 3 Champion Certification',
      required: 'Certified',
      actual: cCertMet ? 'Certified' : 'Not Certified',
      met: cCertMet
    });

    const kaizenMet = emp.kaizens_approved >= 8;
    gaps.push({
      item: 'Amrut Kaizen Implementation Track Record',
      required: '>= 8 Approved Kaizens',
      actual: `${emp.kaizens_approved} Approved`,
      met: kaizenMet
    });

    const savingMet = Number(emp.cost_savings_inr) >= 200000.0;
    gaps.push({
      item: 'Cumulative Cost Savings Delivered',
      required: '>= ₹2,00,000 INR',
      actual: `₹${Number(emp.cost_savings_inr).toLocaleString()} INR`,
      met: savingMet
    });

    const kpiMet = Number(emp.kpi_score) >= 85.0;
    gaps.push({
      item: 'Gemba Leadership & Mentorship Rating',
      required: 'Rating >= 85%',
      actual: `${Number(emp.kpi_score).toFixed(1)}%`,
      met: kpiMet
    });
  }

  const totalReqs = gaps.length;
  const metCount = gaps.filter((g) => g.met).length;

  let eligibility = '';
  let statusColor: 'emerald' | 'amber' | 'rose' = 'rose';

  if (metCount === totalReqs) {
    eligibility = `ELIGIBLE FOR LEVEL ${targetLvl} CERTIFICATION`;
    statusColor = 'emerald';
  } else if (metCount >= totalReqs * 0.6) {
    eligibility = `IN PROGRESS (${metCount}/${totalReqs} MILESTONES MET)`;
    statusColor = 'amber';
  } else {
    eligibility = `NOT ELIGIBLE (${metCount}/${totalReqs} MILESTONES MET)`;
    statusColor = 'rose';
  }

  return {
    emp_name: emp.name,
    emp_no: emp.emp_no,
    current_level: emp.current_level,
    target_level: targetLvl,
    eligibility_status: eligibility,
    status_color: statusColor,
    gaps
  };
}
