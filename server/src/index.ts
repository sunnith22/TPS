import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './db/connection.js';

import authRouter from './routes/auth.js';
import employeesRouter from './routes/employees.js';
import komarigotoRouter from './routes/komarigoto.js';
import certificationsRouter from './routes/certifications.js';
import trainingRouter from './routes/training.js';
import kaizenRouter from './routes/kaizen.js';
import kvpRouter from './routes/kvp.js';
import statsRouter from './routes/stats.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors({ origin: '*' }));
app.use(express.json());

// API v1 routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/employees', employeesRouter);
app.use('/api/v1/komarigoto', komarigotoRouter);
app.use('/api/v1/certifications', certificationsRouter);
app.use('/api/v1/training', trainingRouter);
app.use('/api/v1/kaizen', kaizenRouter);
app.use('/api/v1/kvp', kvpRouter);
app.use('/api/v1/stats', statsRouter);

// Health check and root info
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    backend: 'Node.js (Express)',
    storage: db.isPostgresConnected ? 'PostgreSQL 16 (Connected)' : 'Embedded Relational (Ready for PostgreSQL)',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (_req, res) => {
  res.json({
    system: 'Toyota Industries Engine India (TIEI)',
    module: 'TPS Competency Development & Learning Management System',
    backend: 'Node.js + Express',
    storage: db.isPostgresConnected ? 'PostgreSQL' : 'Embedded Adapter (PostgreSQL-Ready)',
    status: 'operational',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      stats: '/api/v1/stats/dashboard',
      employees: '/api/v1/employees',
      komarigoto: '/api/v1/komarigoto',
      certifications: '/api/v1/certifications',
      training: '/api/v1/training/batches',
      kaizen: '/api/v1/kaizen',
      kvp: '/api/v1/kvp'
    }
  });
});

// Initialize database & start server
const startServer = async () => {
  try {
    await db.init();
    app.listen(PORT, () => {
      console.log(`========================================================`);
      console.log(`🚀 TIEI TPS LMS Backend (Node.js + PostgreSQL)`);
      console.log(`📡 Listening on http://127.0.0.1:${PORT}`);
      console.log(`💾 Storage: ${db.isPostgresConnected ? 'PostgreSQL 16' : 'PostgreSQL Adapter Engine'}`);
      console.log(`========================================================`);
    });
  } catch (err: any) {
    console.error('Fatal error starting server:', err.message);
    process.exit(1);
  }
};

startServer();
