export interface KVPItem {
  id: number;
  category: string;
  subcategory: string;
  name: string;
  desc: string;
}

export interface Komarigoto {
  id: number;
  emp_id: number;
  challenge: string;
  category: 'S' | 'E' | 'Q' | 'P' | 'C' | string;
  current_condition?: string;
  target_condition?: string;
  impact?: string;
  priority: number;
  viewpoints_21?: string;
  countermeasures?: string;
  feasibility: string;
  unfeasible_reason?: string;
  status: 'Identified' | 'In Progress' | 'Implemented' | 'Standardized' | string;
  created_at?: string;
}

export interface Certification {
  id: number;
  cert_no: string;
  emp_id: number;
  emp_name: string;
  level_name: string;
  issue_date: string;
  signatory: string;
  status: string;
}

export interface TrainingBatch {
  id: number;
  batch_code: string;
  level_name: string;
  module_name: string;
  trainer_name: string;
  venue: string;
  start_date: string;
  end_date: string;
  capacity: number;
  enrolled_count: number;
  status: string;
}

export interface KaizenRequest {
  id: number;
  control_no: string;
  emp_id: number;
  emp_name: string;
  work_name: string;
  category: string;
  line: string;
  machine: string;
  material_cost: number;
  man_hours_cost: number;
  machine_cost: number;
  total_cost: number;
  status: string;
  request_date: string;
}

export interface Employee {
  id: number;
  emp_no: string;
  name: string;
  division: string;
  working_area: string;
  designation: string;
  boss_name: string;
  current_level: number;
  target_level: number;
  training_status: number; // 0=Not Started, 1=Scheduled, 2=Completed
  pre_test_score: number;
  post_test_score: number;
  assignment_status: number; // 0=Pending, 1=Draft, 2=Submitted, 3=Approved
  presentation_mgr: number; // 0 or 2
  presentation_vp: number; // 0 or 2
  presentation_dmd: number; // 0 or 2
  practitioner_certified: number; // 0 or 1
  jishuken_1: number; // 0 or 1
  jishuken_2: number; // 0 or 1
  champion_eval: number;
  champion_certified: number; // 0 or 1
  kaizens_submitted: number;
  kaizens_approved: number;
  cost_savings_inr: number;
  kpi_score: number;
  komarigoto_items?: Komarigoto[];
  certifications?: Certification[];
  kaizens?: KaizenRequest[];
}

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
  status_color: 'emerald' | 'amber' | 'rose' | string;
  gaps: GapItem[];
}

export interface AreaStat {
  working_area: string;
  total: number;
  certified: number;
  avg_kpi: number;
}

export interface DashboardStats {
  total_employees: number;
  trained_employees: number;
  assignments_submitted: number;
  practitioners_certified: number;
  champions_certified: number;
  total_kaizens_submitted: number;
  total_kaizens_approved: number;
  total_cost_savings_inr: number;
  manhours_saved_per_day: number;
  area_stats: AreaStat[];
  level_stats: Record<string, number>;
}

export interface UserContext {
  role: 'TL' | 'MGR' | 'TRAINER' | 'TPS_OFFICE' | 'LEADERSHIP';
  role_title: string;
  emp_no: string;
  name: string;
  permissions: string[];
}
