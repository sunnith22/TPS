export interface KVPItem {
  id: number;
  category: string;
  subcategory: string;
  name: string;
  desc: string;
}

export const KVP_MASTER: KVPItem[] = [
  { id: 1, category: "Muri", subcategory: "Cycle Time", name: "Average cycle time more than Takt time", desc: "Line bottleneck where operator cycle exceeds designated takt time" },
  { id: 2, category: "Muri", subcategory: "Mistake Proofing", name: "Poor Pokayoke setting", desc: "Inadequate sensors, limits, or fool-proofing causing operator strain" },
  { id: 3, category: "Muri", subcategory: "Ergonomics", name: "Poor ergonomics", desc: "Heavy lifting, awkward posture, or repetitive stress causing physical fatigue" },
  { id: 4, category: "Mura", subcategory: "Variability", name: "Each model has different cycle time", desc: "Fluctuating work content between variant batches creating line imbalance" },
  { id: 5, category: "Mura", subcategory: "Obstacles", name: "Various Obstacles While working", desc: "Intermittent disruptions, chip entanglement, missing tools" },
  { id: 6, category: "Muda", subcategory: "Repair", name: "Repair / Rework process", desc: "Secondary manual rework, filing, weld touch-up or defect correction" },
  { id: 7, category: "Muda", subcategory: "Overproduction", name: "Advance production", desc: "Making parts before required by downstream process or exceeding batch limit" },
  { id: 8, category: "Muda", subcategory: "Processing", name: "Double Job / Over inspection", desc: "Redundant visual checks, duplicate handling, over-tightened specs" },
  { id: 9, category: "Muda", subcategory: "Conveyance", name: "Long distance of transportation", desc: "Excessive travel distance between machining stations or storage" },
  { id: 10, category: "Muda", subcategory: "Conveyance", name: "Many conveyance methods per route", desc: "Mixing carts, tuggers, forklifts, and manual carry on a single route" },
  { id: 11, category: "Muda", subcategory: "Stock", name: "Over necessary stock", desc: "Excessive WIP buffers, raw materials, or finished engine blocks in aisles" },
  { id: 12, category: "Muda", subcategory: "Motion", name: "Many times of returning", desc: "Operator walking back and forth to retrieve parts, tools, or gages" },
  { id: 13, category: "Muda", subcategory: "Motion", name: "Many working position change", desc: "Frequent repositioning, bending, stretching, or reaching beyond envelope" },
  { id: 14, category: "Muda", subcategory: "Motion", name: "Part area larger than working area", desc: "Parts bin layout forces unnatural reaching or extended walking" },
  { id: 15, category: "Muda", subcategory: "Motion", name: "Poor work posture", desc: "Stooping, squatting, or working with raised arms" },
  { id: 16, category: "Muda", subcategory: "Motion", name: "Double handling", desc: "Putting down a part and picking it up again instead of direct transfer" },
  { id: 17, category: "Muda", subcategory: "Motion", name: "Change Direction of Part", desc: "Rotating or reorienting parts multiple times before fixture loading" },
  { id: 18, category: "Muda", subcategory: "Waiting", name: "Process interference", desc: "Waiting for upstream station or logistics delivery" },
  { id: 19, category: "Muda", subcategory: "Waiting", name: "Poor relation between man - machine time", desc: "Operator standing idle watching machine run auto cycle" },
  { id: 20, category: "Muda", subcategory: "Waiting", name: "Average cycle time less than Takt time", desc: "Starving line or idle wait due to uneven workload allocation" },
  { id: 21, category: "Others", subcategory: "Environment", name: "Others (Gemba 5S & Environment)", desc: "Lighting, noise, oil mist, chip accumulation, general worksite improvements" }
];

export const INITIAL_BATCHES = [
  {
    batch_code: "BATCH-2026-Q3-01",
    level_name: "Level 2 - TPS Practitioner",
    module_name: "Standardized Work 3 Slips & 21 KVP",
    trainer_name: "Dilip R (Master Trainer)",
    venue: "TIEI TPS Dojo Room A",
    start_date: "2026-10-15",
    end_date: "2026-10-17",
    capacity: 20,
    enrolled_count: 18,
    status: "Scheduled"
  },
  {
    batch_code: "BATCH-2026-Q3-02",
    level_name: "Level 3 - Advanced Practitioner",
    module_name: "Value Stream Mapping & MIFC",
    trainer_name: "Rakshith Prabhu (Senior Trainer)",
    venue: "Plant Simulation Lab",
    start_date: "2026-10-22",
    end_date: "2026-10-24",
    capacity: 15,
    enrolled_count: 12,
    status: "Scheduled"
  },
  {
    batch_code: "BATCH-2026-Q3-03",
    level_name: "Level 1 - TPS Foundation",
    module_name: "5S, Waste Identification & Safety",
    trainer_name: "Govinda (Lead Assessor)",
    venue: "Shop Floor Training Bay 2",
    start_date: "2026-11-05",
    end_date: "2026-11-06",
    capacity: 25,
    enrolled_count: 25,
    status: "Full"
  }
];

export const INITIAL_KOMARIGOTO = [
  {
    emp_id: 1,
    challenge: "OP-100: T01 Tool Breakage loss on rough milling",
    category: "P",
    current_condition: "Actual 20min/change vs Target 5min",
    target_condition: "5 min/change",
    impact: "Daily line takt time missed by 18%",
    priority: 1,
    viewpoints_21: "1,3,19",
    countermeasures: "Implement pneumatic quick-change torque fixture & pre-setter gauge",
    feasibility: "Feasible",
    status: "Implemented"
  },
  {
    emp_id: 1,
    challenge: "OP-120: Coolant splash causing operator slipping & floor mess",
    category: "S",
    current_condition: "Oil residue on walkway, cleaning 4x per shift",
    target_condition: "Zero spill, dry floor condition",
    impact: "Safety near-miss hazard & 5S score dropped",
    priority: 1,
    viewpoints_21: "3,21",
    countermeasures: "Fabricate polycarbonate splash guard with return drain gutter",
    feasibility: "Feasible",
    status: "Standardized"
  },
  {
    emp_id: 1,
    challenge: "Crank Pin Chamfer Double Handling & Burrs",
    category: "Q",
    current_condition: "Manual file deburring required for 15% components",
    target_condition: "Zero manual rework at station",
    impact: "Rework bottleneck of 45 sec/part",
    priority: 2,
    viewpoints_21: "6,8,16",
    countermeasures: "Automate brush deburr cycle inside machining envelope",
    feasibility: "Feasible",
    status: "In Progress"
  },
  {
    emp_id: 1,
    challenge: "Line Supply: Excessive buffer inventory between Machining & Assembly",
    category: "C",
    current_condition: "65 WIP engine blocks stored in aisle",
    target_condition: "Standard buffer <= 8 blocks (Kanban limit)",
    impact: "Capital blocked, floor space congestion",
    priority: 1,
    viewpoints_21: "7,11,14",
    countermeasures: "Establish 2-bin gravity feed roller chute with electronic sensor alert",
    feasibility: "Feasible",
    status: "Implemented"
  }
];

export const INITIAL_CERTIFICATIONS = [
  {
    cert_no: "TIEI/TPS/2026/001",
    emp_id: 1,
    emp_name: "ARUNA D R",
    level_name: "Level 2 - TPS Practitioner",
    issue_date: "2026-06-15",
    signatory: "Antony John Sudhakar P (VP)",
    status: "Active"
  },
  {
    cert_no: "TIEI/TPS/2026/002",
    emp_id: 1,
    emp_name: "ARUNA D R",
    level_name: "Level 3 - TPS Champion",
    issue_date: "2026-09-10",
    signatory: "Mohammed Rasool Mulla (HOD)",
    status: "Active"
  },
  {
    cert_no: "TIEI/TPS/2026/003",
    emp_id: 2,
    emp_name: "KARTHIKEYAN",
    level_name: "Level 2 - TPS Practitioner",
    issue_date: "2026-07-20",
    signatory: "Antony John Sudhakar P (VP)",
    status: "Active"
  }
];

export const INITIAL_KAIZENS = [
  {
    control_no: "KAIZEN-2026-089",
    emp_id: 1,
    emp_name: "ARUNA D R",
    work_name: "Pneumatic Quick-Change Tool Fixture",
    category: "Productivity",
    line: "GD HEAD",
    machine: "MILLING",
    material_cost: 4500.0,
    man_hours_cost: 1800.0,
    machine_cost: 1200.0,
    total_cost: 7500.0,
    status: "Approved",
    request_date: "2026-08-12"
  },
  {
    control_no: "KAIZEN-2026-094",
    emp_id: 1,
    emp_name: "ARUNA D R",
    work_name: "Polycarbonate Splash Guard with Drain",
    category: "Safety",
    line: "GD HEAD",
    machine: "SURFACE GRINDING",
    material_cost: 2800.0,
    man_hours_cost: 950.0,
    machine_cost: 600.0,
    total_cost: 4350.0,
    status: "Approved",
    request_date: "2026-08-25"
  },
  {
    control_no: "KAIZEN-2026-102",
    emp_id: 2,
    emp_name: "KARTHIKEYAN",
    work_name: "Gravity Roller Chute for Cylinder Head Transfer",
    category: "Productivity",
    line: "GD HEAD",
    machine: "WELDING",
    material_cost: 6200.0,
    man_hours_cost: 2400.0,
    machine_cost: 1800.0,
    total_cost: 10400.0,
    status: "Approved",
    request_date: "2026-09-02"
  },
  {
    control_no: "KAIZEN-2026-110",
    emp_id: 4,
    emp_name: "KIRAN GOWDA",
    work_name: "Ergonomic Magnetic Tool Retractor",
    category: "Moral improvement",
    line: "GD CRANK",
    machine: "LATHE",
    material_cost: 1500.0,
    man_hours_cost: 600.0,
    machine_cost: 400.0,
    total_cost: 2500.0,
    status: "Under Review",
    request_date: "2026-09-28"
  }
];
