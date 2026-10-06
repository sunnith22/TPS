import { Router, Request, Response } from 'express';
import { KVP_MASTER } from '../db/seedData.js';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json(KVP_MASTER);
});

export default router;
