import { Router, Request, Response } from 'express';
import { db } from '../db/connection.js';

const router = Router();

const MACHINE_HOURLY_RATES: Record<string, number> = {
  LATHE: 27.0,
  WELDING: 26.0,
  MILLING: 35.0,
  'SURFACE GRINDING': 30.0,
  BORING: 38.0,
  DRILLING: 22.0,
  'ASSEMBLY FIXTURE': 18.0,
  OTHER: 25.0
};

const MANPOWER_HOURLY_RATE = 250.0;

router.get('/machine-rates', (_req: Request, res: Response) => {
  res.json({
    machine_hourly_rates: MACHINE_HOURLY_RATES,
    manpower_hourly_rate: MANPOWER_HOURLY_RATE
  });
});

router.post('/calculate-rate', (req: Request, res: Response) => {
  const { machine = 'MILLING', machine_hours = 0, man_hours = 0, material_cost = 0 } = req.body;
  const rate = MACHINE_HOURLY_RATES[String(machine).toUpperCase()] || MACHINE_HOURLY_RATES.OTHER;

  const machTotal = Number((Number(machine_hours) * rate).toFixed(2));
  const manTotal = Number((Number(man_hours) * MANPOWER_HOURLY_RATE).toFixed(2));
  const matCost = Number(Number(material_cost).toFixed(2));
  const grandTotal = Number((machTotal + manTotal + matCost).toFixed(2));

  res.json({
    machine_rate_per_hr: rate,
    machine_total: machTotal,
    manpower_rate_per_hr: MANPOWER_HOURLY_RATE,
    manpower_total: manTotal,
    material_cost: matCost,
    grand_total: grandTotal
  });
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const empIdStr = req.query.emp_id as string | undefined;
    const empId = empIdStr ? parseInt(empIdStr, 10) : undefined;
    const kaizens = await db.getKaizens(empId);
    res.json(kaizens);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { emp_id, work_name, category = 'Productivity', line = 'GD HEAD', machine = 'MILLING', machine_hours = 0, man_hours = 0, material_cost = 0 } = req.body;
    if (!emp_id || !work_name) {
      return res.status(400).json({ error: 'emp_id and work_name are required' });
    }

    const rate = MACHINE_HOURLY_RATES[String(machine).toUpperCase()] || MACHINE_HOURLY_RATES.OTHER;
    const machCost = Number((Number(machine_hours) * rate).toFixed(2));
    const manCost = Number((Number(man_hours) * MANPOWER_HOURLY_RATE).toFixed(2));
    const matCost = Number(Number(material_cost).toFixed(2));
    const totalCost = Number((machCost + manCost + matCost).toFixed(2));

    const created = await db.createKaizen({
      emp_id,
      work_name,
      category,
      line,
      machine,
      material_cost: matCost,
      man_hours_cost: manCost,
      machine_cost: machCost,
      total_cost: totalCost
    });

    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
