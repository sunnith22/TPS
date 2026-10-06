import { Router, Request, Response } from 'express';
import { db } from '../db/connection.js';
import { calculatePromotionGap } from '../services/gapAnalysis.js';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const area = req.query.working_area as string | undefined;
    const levelStr = req.query.current_level as string | undefined;
    const search = req.query.search as string | undefined;

    const level = levelStr ? parseInt(levelStr, 10) : undefined;
    const employees = await db.getEmployees({ area, level, search });

    res.json(employees);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const emp = await db.getEmployeeById(id);
    if (!emp) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const [komarigoto, certifications, kaizens] = await Promise.all([
      db.getKomarigoto(emp.id),
      db.getCertifications().then((c) => c.filter((x) => x.emp_id === emp.id)),
      db.getKaizens(emp.id)
    ]);

    res.json({
      ...emp,
      komarigoto_items: komarigoto,
      certifications,
      kaizens
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/gap-analysis', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const emp = await db.getEmployeeById(id);
    if (!emp) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const gapResult = calculatePromotionGap(emp);
    res.json(gapResult);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/journey', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { field, value } = req.body;

    if (!field || value === undefined) {
      return res.status(400).json({ error: 'Both field and value are required' });
    }

    const updated = await db.updateEmployeeJourney(id, field, value);
    if (!updated) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json({
      message: `Successfully updated ${field}`,
      employee: updated.emp_no,
      current_level: updated.current_level,
      target_level: updated.target_level
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
