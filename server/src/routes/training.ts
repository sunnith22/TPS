import { Router, Request, Response } from 'express';
import { db } from '../db/connection.js';

const router = Router();

router.get('/batches', async (_req: Request, res: Response) => {
  try {
    const batches = await db.getTrainingBatches();
    res.json(batches);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/batches/:id/enroll', async (req: Request, res: Response) => {
  try {
    const batchId = parseInt(req.params.id, 10);
    const { emp_id } = req.body;
    if (!emp_id) {
      return res.status(400).json({ error: 'emp_id is required' });
    }

    const result = await db.enrollBatch(batchId, emp_id);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
