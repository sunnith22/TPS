import { Router, Request, Response } from 'express';
import { db } from '../db/connection.js';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const certs = await db.getCertifications();
    res.json(certs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/verify/:certNo', async (req: Request, res: Response) => {
  try {
    const certNo = decodeURIComponent(req.params.certNo);
    const cert = await db.getCertificationByNo(certNo);
    if (!cert) {
      return res.status(404).json({ error: 'Certificate not found or invalid' });
    }
    res.json(cert);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/issue', async (req: Request, res: Response) => {
  try {
    const { emp_id, level_name, signatory } = req.body;
    if (!emp_id || !level_name) {
      return res.status(400).json({ error: 'emp_id and level_name are required' });
    }

    const cert = await db.issueCertification(emp_id, level_name, signatory);
    res.status(201).json(cert);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
