import { Router, Request, Response } from 'express';

const router = Router();

const ROLE_CONFIGS: Record<string, { title: string; permissions: string[] }> = {
  TL: {
    title: 'Team Leader (Gemba Practitioner)',
    permissions: ['view_own_journey', 'submit_komarigoto', 'submit_kaizen', 'view_training']
  },
  MGR: {
    title: 'Shop Manager / Section Head',
    permissions: ['approve_presentation', 'view_area_matrix', 'evaluate_readiness', 'view_reports']
  },
  TRAINER: {
    title: 'TPS Dojo Master Trainer',
    permissions: ['manage_batches', 'grade_assessments', 'conduct_jishuken', 'view_roster']
  },
  TPS_OFFICE: {
    title: 'TPS Office Secretariat & Administrator',
    permissions: ['full_admin', 'issue_certifications', 'sync_amrut', 'master_reports', 'manage_all']
  },
  LEADERSHIP: {
    title: 'Executive Leadership (VP / DMD)',
    permissions: ['executive_dashboard', 'vp_approval', 'dmd_defense', 'strategic_roi']
  }
};

router.post('/role-switch', (req: Request, res: Response) => {
  const { role = 'TPS_OFFICE', emp_no = '50031', name = 'ARUNA D R' } = req.body;
  const cfg = ROLE_CONFIGS[role] || ROLE_CONFIGS.TPS_OFFICE;
  res.json({
    role,
    role_title: cfg.title,
    emp_no,
    name,
    permissions: cfg.permissions
  });
});

router.get('/me', (_req: Request, res: Response) => {
  const cfg = ROLE_CONFIGS.TPS_OFFICE;
  res.json({
    role: 'TPS_OFFICE',
    role_title: cfg.title,
    emp_no: 'TPS-ADMIN-01',
    name: 'TPS Promotion Secretariat',
    permissions: cfg.permissions
  });
});

export default router;
