import { Router, Request, Response } from 'express';
import { db } from '../db/connection.js';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const empIdStr = req.query.emp_id as string | undefined;
    const empId = empIdStr ? parseInt(empIdStr, 10) : undefined;
    const items = await db.getKomarigoto(empId);
    res.json(items);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { emp_id, challenge } = req.body;
    if (!emp_id || !challenge) {
      return res.status(400).json({ error: 'emp_id and challenge are required' });
    }

    const created = await db.createKomarigoto(req.body);

    // Update employee assignment status to at least Draft if 0
    const emp = await db.getEmployeeById(emp_id);
    if (emp && emp.assignment_status === 0) {
      await db.updateEmployeeJourney(emp_id, 'assignment_status', 1);
    }

    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const updated = await db.updateKomarigoto(id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Komarigoto item not found' });
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const deleted = await db.deleteKomarigoto(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Komarigoto item not found' });
    }
    res.json({ message: 'Komarigoto deleted successfully', id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
