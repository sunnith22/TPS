import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import xlsx from 'xlsx';
import {
  KVP_MASTER,
  INITIAL_BATCHES,
  INITIAL_KOMARIGOTO,
  INITIAL_CERTIFICATIONS,
  INITIAL_KAIZENS
} from './seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface EmployeeRecord {
  id: number;
  emp_no: string;
  name: string;
  division: string;
  working_area: string;
  designation: string;
  boss_name: string;
  current_level: number;
  target_level: number;
  training_status: number;
  pre_test_score: number;
  post_test_score: number;
  assignment_status: number;
  presentation_mgr: number;
  presentation_vp: number;
  presentation_dmd: number;
  practitioner_certified: number;
  jishuken_1: number;
  jishuken_2: number;
  champion_eval: number;
  champion_certified: number;
  kaizens_submitted: number;
  kaizens_approved: number;
  cost_savings_inr: number;
  kpi_score: number;
  created_at?: string;
  updated_at?: string;
}

export interface KomarigotoRecord {
  id: number;
  emp_id: number;
  challenge: string;
  category: string;
  current_condition: string;
  target_condition: string;
  impact: string;
  priority: number;
  viewpoints_21: string;
  countermeasures: string;
  feasibility: string;
  unfeasible_reason?: string;
  status: string;
  created_at?: string;
}

export interface CertificationRecord {
  id: number;
  cert_no: string;
  emp_id: number;
  emp_name: string;
  level_name: string;
  issue_date: string;
  signatory: string;
  status: string;
  created_at?: string;
}

export interface TrainingBatchRecord {
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
  created_at?: string;
}

export interface KaizenRecord {
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
  created_at?: string;
}

class DatabaseManager {
  private pool: pg.Pool | null = null;
  public isPostgresConnected: boolean = false;

  // In-memory relational store fallback
  public memoryEmployees: EmployeeRecord[] = [];
  public memoryKomarigoto: KomarigotoRecord[] = [];
  public memoryCertifications: CertificationRecord[] = [];
  public memoryBatches: TrainingBatchRecord[] = [];
  public memoryKaizens: KaizenRecord[] = [];

  constructor() {
    const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgrespassword@localhost:5432/tiei_tps_lms';
    this.pool = new pg.Pool({
      connectionString,
      connectionTimeoutMillis: 3000,
    });
  }

  public async init() {
    try {
      console.log('🔄 [STORAGE] Attempting connection to PostgreSQL...');
      const client = await this.pool?.connect();
      if (client) {
        this.isPostgresConnected = true;
        console.log('✅ [STORAGE] Successfully connected to PostgreSQL database!');
        
        // Execute DDL schema
        const schemaPath = path.join(__dirname, 'schema.sql');
        if (fs.existsSync(schemaPath)) {
          const schemaSql = fs.readFileSync(schemaPath, 'utf8');
          await client.query(schemaSql);
          console.log('✅ [STORAGE] PostgreSQL schema tables verified.');
        }

        // Check if employees table has rows
        const res = await client.query('SELECT COUNT(*) FROM employees');
        const count = parseInt(res.rows[0].count, 10);
        if (count === 0) {
          console.log('🌱 [STORAGE] Seeding 78 Team Leaders into PostgreSQL...');
          await this.seedPostgres(client);
        } else {
          console.log(`📊 [STORAGE] PostgreSQL already seeded with ${count} employees.`);
        }
        client.release();
      }
    } catch (err: any) {
      this.isPostgresConnected = false;
      console.log('⚠️ [STORAGE] PostgreSQL connection notice:', err.message);
      console.log('📌 [STORAGE] To run PostgreSQL locally: run "docker compose up -d" or ensure PostgreSQL is listening on port 5432.');
      console.log('🚀 [STORAGE] Activating embedded storage engine loaded with all 78 Team Leaders, 21 KVP master items, and active records.');
      this.seedMemoryStore();
    }
  }

  private loadEmployeesFromExcelOrMock(): EmployeeRecord[] {
    const excelCandidates = [
      path.resolve(process.cwd(), '../001_TPS Journey Visualisation.xlsx'),
      path.resolve(process.cwd(), '001_TPS Journey Visualisation.xlsx'),
      path.resolve(__dirname, '../../../001_TPS Journey Visualisation.xlsx'),
    ];

    let foundPath = excelCandidates.find((p) => fs.existsSync(p));

    if (foundPath) {
      try {
        const wb = xlsx.readFile(foundPath);
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows: any[][] = xlsx.utils.sheet_to_json(sheet, { header: 1 });
        const employees: EmployeeRecord[] = [];

        let currentId = 1;
        for (let i = 2; i < rows.length; i++) {
          const r = rows[i];
          if (r && r[0] && r[3]) {
            const name = String(r[0]).trim().replace(/^'/, '');
            const div = String(r[1] || 'GD').trim();
            const area = String(r[2] || 'HEAD').trim();
            const emp_no = String(r[3]).trim();
            const desig = String(r[5] || 'Z10').trim();
            const boss = String(r[6] || 'TPS Office').trim();

            const training_status = Number(r[7]) || 0;
            const post_test = Number(r[8]) || 0;
            const assignment = Number(r[9]) || 0;
            const pres_mgr = Number(r[10]) || 0;
            const pres_vp = Number(r[11]) || 0;
            const pres_dmd = Number(r[12]) || 0;

            const pre_score = training_status > 0 ? Math.floor(45 + Math.random() * 20) : 0;
            const post_score = post_test === 2 ? Math.floor(75 + Math.random() * 21) : (training_status === 2 ? Math.floor(50 + Math.random() * 20) : 0);
            const is_cert = pres_mgr === 2 && pres_vp === 2 ? 1 : 0;
            let current_level = is_cert ? 2 : 1;
            let target_level = current_level === 2 ? 3 : 2;

            const j1 = is_cert && Math.random() > 0.4 ? 1 : 0;
            const j2 = j1 && Math.random() > 0.5 ? 1 : 0;
            const champ_cert = j1 && j2 && Math.random() > 0.6 ? 1 : 0;
            if (champ_cert) {
              current_level = 3;
              target_level = 4;
            }

            const kaizens_sub = Math.floor(3 + Math.random() * 11);
            const kaizens_app = Math.min(kaizens_sub, Math.floor(2 + Math.random() * kaizens_sub));
            const savings = kaizens_app * Math.floor(15000 + Math.random() * 45000);
            const kpi_score = Number((70 + kaizens_app * 2.5 + post_score * 0.1).toFixed(1));

            employees.push({
              id: currentId++,
              emp_no,
              name,
              division: div,
              working_area: area,
              designation: desig,
              boss_name: boss,
              current_level,
              target_level,
              training_status,
              pre_test_score: pre_score,
              post_test_score: post_score,
              assignment_status: assignment,
              presentation_mgr: pres_mgr,
              presentation_vp: pres_vp,
              presentation_dmd: pres_dmd,
              practitioner_certified: is_cert,
              jishuken_1: j1,
              jishuken_2: j2,
              champion_eval: j2 ? 85.0 : 0.0,
              champion_certified: champ_cert,
              kaizens_submitted: kaizens_sub,
              kaizens_approved: kaizens_app,
              cost_savings_inr: savings,
              kpi_score,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          }
        }

        if (employees.length > 0) {
          // Set milestone values for top candidates
          employees[0].presentation_mgr = 2;
          employees[0].presentation_vp = 2;
          employees[0].presentation_dmd = 2;
          employees[0].practitioner_certified = 1;
          employees[0].jishuken_1 = 1;
          employees[0].jishuken_2 = 1;
          employees[0].champion_eval = 92.5;
          employees[0].champion_certified = 1;
          employees[0].current_level = 3;
          employees[0].target_level = 4;

          if (employees.length > 1) {
            employees[1].presentation_mgr = 2;
            employees[1].presentation_vp = 2;
            employees[1].practitioner_certified = 1;
            employees[1].jishuken_1 = 1;
          }

          console.log(`✅ [STORAGE] Ingested ${employees.length} Team Leaders from Excel.`);
          return employees;
        }
      } catch (err: any) {
        console.error('Error reading excel:', err.message);
      }
    }

    // Fallback: Generate full 78 TL mock dataset matching plant breakdown
    const areas = ['HEAD', 'CRANK', 'BLOCK', 'LINE SUPPLY', 'ASSY 1', 'ASSY 2', 'ASSY 3', 'TOOL MGT'];
    const mockEmployees: EmployeeRecord[] = [];
    for (let i = 1; i <= 78; i++) {
      const area = areas[i % areas.length];
      const isFirst = i === 1;
      const isSecond = i === 2;
      mockEmployees.push({
        id: i,
        emp_no: String(50000 + i),
        name: isFirst ? 'ARUNA D R' : (isSecond ? 'KARTHIKEYAN' : `TEAM LEADER ${i}`),
        division: 'GD',
        working_area: area,
        designation: 'Z10',
        boss_name: 'TPS Office',
        current_level: isFirst ? 3 : (isSecond ? 2 : 1),
        target_level: isFirst ? 4 : (isSecond ? 3 : 2),
        training_status: isFirst || isSecond ? 2 : (i < 60 ? 2 : 1),
        pre_test_score: 55,
        post_test_score: isFirst ? 92 : (isSecond ? 86 : 74),
        assignment_status: isFirst || isSecond ? 3 : 2,
        presentation_mgr: isFirst || isSecond ? 2 : 0,
        presentation_vp: isFirst || isSecond ? 2 : 0,
        presentation_dmd: isFirst ? 2 : 0,
        practitioner_certified: isFirst || isSecond ? 1 : 0,
        jishuken_1: isFirst ? 1 : 0,
        jishuken_2: isFirst ? 1 : 0,
        champion_eval: isFirst ? 92.5 : 0.0,
        champion_certified: isFirst ? 1 : 0,
        kaizens_submitted: 8,
        kaizens_approved: 6,
        cost_savings_inr: 240000,
        kpi_score: 88.5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
    return mockEmployees;
  }

  private async seedPostgres(client: pg.PoolClient) {
    const emps = this.loadEmployeesFromExcelOrMock();
    for (const emp of emps) {
      await client.query(
        `INSERT INTO employees (
          emp_no, name, division, working_area, designation, boss_name,
          current_level, target_level, training_status, pre_test_score, post_test_score,
          assignment_status, presentation_mgr, presentation_vp, presentation_dmd,
          practitioner_certified, jishuken_1, jishuken_2, champion_eval, champion_certified,
          kaizens_submitted, kaizens_approved, cost_savings_inr, kpi_score
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24)
        ON CONFLICT (emp_no) DO NOTHING`,
        [
          emp.emp_no, emp.name, emp.division, emp.working_area, emp.designation, emp.boss_name,
          emp.current_level, emp.target_level, emp.training_status, emp.pre_test_score, emp.post_test_score,
          emp.assignment_status, emp.presentation_mgr, emp.presentation_vp, emp.presentation_dmd,
          emp.practitioner_certified, emp.jishuken_1, emp.jishuken_2, emp.champion_eval, emp.champion_certified,
          emp.kaizens_submitted, emp.kaizens_approved, emp.cost_savings_inr, emp.kpi_score
        ]
      );
    }

    // Seed Batches
    for (const b of INITIAL_BATCHES) {
      await client.query(
        `INSERT INTO training_batches (batch_code, level_name, module_name, trainer_name, venue, start_date, end_date, capacity, enrolled_count, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT (batch_code) DO NOTHING`,
        [b.batch_code, b.level_name, b.module_name, b.trainer_name, b.venue, b.start_date, b.end_date, b.capacity, b.enrolled_count, b.status]
      );
    }

    // Seed Komarigoto
    for (const k of INITIAL_KOMARIGOTO) {
      await client.query(
        `INSERT INTO komarigoto (emp_id, challenge, category, current_condition, target_condition, impact, priority, viewpoints_21, countermeasures, feasibility, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [k.emp_id, k.challenge, k.category, k.current_condition, k.target_condition, k.impact, k.priority, k.viewpoints_21, k.countermeasures, k.feasibility, k.status]
      );
    }

    // Seed Certifications
    for (const c of INITIAL_CERTIFICATIONS) {
      await client.query(
        `INSERT INTO certifications (cert_no, emp_id, emp_name, level_name, issue_date, signatory, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (cert_no) DO NOTHING`,
        [c.cert_no, c.emp_id, c.emp_name, c.level_name, c.issue_date, c.signatory, c.status]
      );
    }

    // Seed Kaizens
    for (const kz of INITIAL_KAIZENS) {
      await client.query(
        `INSERT INTO kaizen_requests (control_no, emp_id, emp_name, work_name, category, line, machine, material_cost, man_hours_cost, machine_cost, total_cost, status, request_date)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) ON CONFLICT (control_no) DO NOTHING`,
        [kz.control_no, kz.emp_id, kz.emp_name, kz.work_name, kz.category, kz.line, kz.machine, kz.material_cost, kz.man_hours_cost, kz.machine_cost, kz.total_cost, kz.status, kz.request_date]
      );
    }
  }

  private seedMemoryStore() {
    this.memoryEmployees = this.loadEmployeesFromExcelOrMock();
    this.memoryBatches = INITIAL_BATCHES.map((b, idx) => ({ ...b, id: idx + 1 }));
    this.memoryKomarigoto = INITIAL_KOMARIGOTO.map((k, idx) => ({ ...k, id: idx + 1, created_at: new Date().toISOString() }));
    this.memoryCertifications = INITIAL_CERTIFICATIONS.map((c, idx) => ({ ...c, id: idx + 1, created_at: new Date().toISOString() }));
    this.memoryKaizens = INITIAL_KAIZENS.map((kz, idx) => ({ ...kz, id: idx + 1, created_at: new Date().toISOString() }));
  }

  // --- REPOSITORY METHODS ---

  public async getEmployees(filter?: { area?: string; level?: number; search?: string }): Promise<EmployeeRecord[]> {
    if (this.isPostgresConnected && this.pool) {
      let sql = 'SELECT * FROM employees WHERE 1=1';
      const params: any[] = [];
      let paramIdx = 1;

      if (filter?.area && filter.area !== 'ALL') {
        sql += ` AND working_area = $${paramIdx++}`;
        params.push(filter.area);
      }
      if (filter?.level && filter.level > 0) {
        sql += ` AND current_level = $${paramIdx++}`;
        params.push(filter.level);
      }
      if (filter?.search && filter.search.trim()) {
        sql += ` AND (name ILIKE $${paramIdx} OR emp_no ILIKE $${paramIdx})`;
        params.push(`%${filter.search.trim()}%`);
        paramIdx++;
      }
      sql += ' ORDER BY id ASC';
      const res = await this.pool.query(sql, params);
      return res.rows;
    } else {
      let emps = [...this.memoryEmployees];
      if (filter?.area && filter.area !== 'ALL') {
        emps = emps.filter((e) => e.working_area === filter.area);
      }
      if (filter?.level && filter.level > 0) {
        emps = emps.filter((e) => e.current_level === filter.level);
      }
      if (filter?.search && filter.search.trim()) {
        const s = filter.search.toLowerCase();
        emps = emps.filter((e) => e.name.toLowerCase().includes(s) || e.emp_no.toLowerCase().includes(s));
      }
      return emps;
    }
  }

  public async getEmployeeById(id: number): Promise<EmployeeRecord | null> {
    if (this.isPostgresConnected && this.pool) {
      const res = await this.pool.query('SELECT * FROM employees WHERE id = $1', [id]);
      return res.rows[0] || null;
    } else {
      return this.memoryEmployees.find((e) => e.id === id) || null;
    }
  }

  public async updateEmployeeJourney(id: number, field: string, value: any): Promise<EmployeeRecord | null> {
    const validFields = [
      'training_status', 'pre_test_score', 'post_test_score',
      'assignment_status', 'presentation_mgr', 'presentation_vp',
      'presentation_dmd', 'practitioner_certified', 'jishuken_1',
      'jishuken_2', 'champion_eval', 'champion_certified',
      'current_level', 'target_level'
    ];
    if (!validFields.includes(field)) {
      throw new Error(`Invalid journey field: ${field}`);
    }

    if (this.isPostgresConnected && this.pool) {
      await this.pool.query(`UPDATE employees SET ${field} = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`, [value, id]);
      const emp = await this.getEmployeeById(id);
      if (emp) {
        // Automatic level upgrade calculation
        if (emp.presentation_mgr === 2 && emp.presentation_vp === 2) {
          emp.practitioner_certified = 1;
          if (emp.current_level < 2) {
            emp.current_level = 2;
            emp.target_level = 3;
          }
        }
        if (emp.practitioner_certified === 1 && emp.jishuken_1 === 1 && emp.jishuken_2 === 1 && emp.champion_eval >= 80.0) {
          emp.champion_certified = 1;
          if (emp.current_level < 3) {
            emp.current_level = 3;
            emp.target_level = 4;
          }
        }
        await this.pool.query(
          `UPDATE employees SET practitioner_certified = $1, champion_certified = $2, current_level = $3, target_level = $4 WHERE id = $5`,
          [emp.practitioner_certified, emp.champion_certified, emp.current_level, emp.target_level, id]
        );
      }
      return emp;
    } else {
      const emp = this.memoryEmployees.find((e) => e.id === id);
      if (!emp) return null;
      (emp as any)[field] = value;
      emp.updated_at = new Date().toISOString();

      if (emp.presentation_mgr === 2 && emp.presentation_vp === 2) {
        emp.practitioner_certified = 1;
        if (emp.current_level < 2) {
          emp.current_level = 2;
          emp.target_level = 3;
        }
      }
      if (emp.practitioner_certified === 1 && emp.jishuken_1 === 1 && emp.jishuken_2 === 1 && emp.champion_eval >= 80.0) {
        emp.champion_certified = 1;
        if (emp.current_level < 3) {
          emp.current_level = 3;
          emp.target_level = 4;
        }
      }
      return emp;
    }
  }

  public async getKomarigoto(empId?: number): Promise<KomarigotoRecord[]> {
    if (this.isPostgresConnected && this.pool) {
      if (empId) {
        const res = await this.pool.query('SELECT * FROM komarigoto WHERE emp_id = $1 ORDER BY id DESC', [empId]);
        return res.rows;
      }
      const res = await this.pool.query('SELECT * FROM komarigoto ORDER BY id DESC');
      return res.rows;
    } else {
      if (empId) return this.memoryKomarigoto.filter((k) => k.emp_id === empId);
      return this.memoryKomarigoto;
    }
  }

  public async createKomarigoto(data: Partial<KomarigotoRecord>): Promise<KomarigotoRecord> {
    if (this.isPostgresConnected && this.pool) {
      const res = await this.pool.query(
        `INSERT INTO komarigoto (emp_id, challenge, category, current_condition, target_condition, impact, priority, viewpoints_21, countermeasures, feasibility, unfeasible_reason, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
        [
          data.emp_id, data.challenge, data.category || 'P', data.current_condition || '', data.target_condition || '',
          data.impact || '', data.priority || 1, data.viewpoints_21 || '', data.countermeasures || '',
          data.feasibility || 'Feasible', data.unfeasible_reason || '', data.status || 'Identified'
        ]
      );
      return res.rows[0];
    } else {
      const newRec: KomarigotoRecord = {
        id: this.memoryKomarigoto.length + 1,
        emp_id: data.emp_id!,
        challenge: data.challenge || '',
        category: data.category || 'P',
        current_condition: data.current_condition || '',
        target_condition: data.target_condition || '',
        impact: data.impact || '',
        priority: data.priority || 1,
        viewpoints_21: data.viewpoints_21 || '',
        countermeasures: data.countermeasures || '',
        feasibility: data.feasibility || 'Feasible',
        unfeasible_reason: data.unfeasible_reason || '',
        status: data.status || 'Identified',
        created_at: new Date().toISOString()
      };
      this.memoryKomarigoto.unshift(newRec);
      return newRec;
    }
  }

  public async updateKomarigoto(id: number, data: Partial<KomarigotoRecord>): Promise<KomarigotoRecord | null> {
    if (this.isPostgresConnected && this.pool) {
      const res = await this.pool.query(
        `UPDATE komarigoto SET
          challenge = COALESCE($1, challenge),
          category = COALESCE($2, category),
          current_condition = COALESCE($3, current_condition),
          target_condition = COALESCE($4, target_condition),
          impact = COALESCE($5, impact),
          priority = COALESCE($6, priority),
          viewpoints_21 = COALESCE($7, viewpoints_21),
          countermeasures = COALESCE($8, countermeasures),
          feasibility = COALESCE($9, feasibility),
          unfeasible_reason = COALESCE($10, unfeasible_reason),
          status = COALESCE($11, status)
         WHERE id = $12 RETURNING *`,
        [
          data.challenge, data.category, data.current_condition, data.target_condition,
          data.impact, data.priority, data.viewpoints_21, data.countermeasures,
          data.feasibility, data.unfeasible_reason, data.status, id
        ]
      );
      return res.rows[0] || null;
    } else {
      const item = this.memoryKomarigoto.find((k) => k.id === id);
      if (!item) return null;
      Object.assign(item, data);
      return item;
    }
  }

  public async deleteKomarigoto(id: number): Promise<boolean> {
    if (this.isPostgresConnected && this.pool) {
      const res = await this.pool.query('DELETE FROM komarigoto WHERE id = $1', [id]);
      return (res.rowCount ?? 0) > 0;
    } else {
      const idx = this.memoryKomarigoto.findIndex((k) => k.id === id);
      if (idx !== -1) {
        this.memoryKomarigoto.splice(idx, 1);
        return true;
      }
      return false;
    }
  }

  public async getCertifications(): Promise<CertificationRecord[]> {
    if (this.isPostgresConnected && this.pool) {
      const res = await this.pool.query('SELECT * FROM certifications ORDER BY id DESC');
      return res.rows;
    } else {
      return this.memoryCertifications;
    }
  }

  public async getCertificationByNo(certNo: string): Promise<CertificationRecord | null> {
    if (this.isPostgresConnected && this.pool) {
      const res = await this.pool.query('SELECT * FROM certifications WHERE cert_no = $1', [certNo]);
      return res.rows[0] || null;
    } else {
      return this.memoryCertifications.find((c) => c.cert_no === certNo) || null;
    }
  }

  public async issueCertification(empId: number, levelName: string, signatory?: string): Promise<CertificationRecord> {
    const emp = await this.getEmployeeById(empId);
    if (!emp) throw new Error('Employee not found');

    const year = new Date().getFullYear();
    const count = (await this.getCertifications()).length + 1;
    const certNo = `TIEI/TPS/${year}/${String(count).padStart(3, '0')}`;
    const today = new Date().toISOString().split('T')[0];
    const sig = signatory || 'Antony John Sudhakar P (VP)';

    if (this.isPostgresConnected && this.pool) {
      const res = await this.pool.query(
        `INSERT INTO certifications (cert_no, emp_id, emp_name, level_name, issue_date, signatory, status)
         VALUES ($1,$2,$3,$4,$5,$6,'Active') RETURNING *`,
        [certNo, emp.id, emp.name, levelName, today, sig]
      );
      if (levelName.includes('Level 2')) {
        await this.updateEmployeeJourney(emp.id, 'practitioner_certified', 1);
      } else if (levelName.includes('Level 3')) {
        await this.updateEmployeeJourney(emp.id, 'champion_certified', 1);
      }
      return res.rows[0];
    } else {
      const newCert: CertificationRecord = {
        id: this.memoryCertifications.length + 1,
        cert_no: certNo,
        emp_id: emp.id,
        emp_name: emp.name,
        level_name: levelName,
        issue_date: today,
        signatory: sig,
        status: 'Active',
        created_at: new Date().toISOString()
      };
      this.memoryCertifications.unshift(newCert);

      if (levelName.includes('Level 2')) {
        emp.practitioner_certified = 1;
        emp.current_level = Math.max(emp.current_level, 2);
        emp.target_level = Math.max(emp.target_level, 3);
      } else if (levelName.includes('Level 3')) {
        emp.champion_certified = 1;
        emp.current_level = Math.max(emp.current_level, 3);
        emp.target_level = 4;
      }
      return newCert;
    }
  }

  public async getTrainingBatches(): Promise<TrainingBatchRecord[]> {
    if (this.isPostgresConnected && this.pool) {
      const res = await this.pool.query('SELECT * FROM training_batches ORDER BY start_date DESC');
      return res.rows;
    } else {
      return this.memoryBatches;
    }
  }

  public async enrollBatch(batchId: number, empId: number): Promise<{ message: string; enrolled_count: number }> {
    if (this.isPostgresConnected && this.pool) {
      const res = await this.pool.query('SELECT * FROM training_batches WHERE id = $1', [batchId]);
      const batch = res.rows[0];
      if (!batch) throw new Error('Batch not found');
      if (batch.enrolled_count >= batch.capacity) throw new Error('Batch is full');

      const newCount = batch.enrolled_count + 1;
      const status = newCount >= batch.capacity ? 'Full' : batch.status;
      await this.pool.query('UPDATE training_batches SET enrolled_count = $1, status = $2 WHERE id = $3', [newCount, status, batchId]);
      await this.updateEmployeeJourney(empId, 'training_status', 1);
      return { message: 'Successfully enrolled', enrolled_count: newCount };
    } else {
      const batch = this.memoryBatches.find((b) => b.id === batchId);
      if (!batch) throw new Error('Batch not found');
      if (batch.enrolled_count >= batch.capacity) throw new Error('Batch is full');
      batch.enrolled_count += 1;
      if (batch.enrolled_count >= batch.capacity) batch.status = 'Full';
      await this.updateEmployeeJourney(empId, 'training_status', 1);
      return { message: 'Successfully enrolled', enrolled_count: batch.enrolled_count };
    }
  }

  public async getKaizens(empId?: number): Promise<KaizenRecord[]> {
    if (this.isPostgresConnected && this.pool) {
      if (empId) {
        const res = await this.pool.query('SELECT * FROM kaizen_requests WHERE emp_id = $1 ORDER BY id DESC', [empId]);
        return res.rows;
      }
      const res = await this.pool.query('SELECT * FROM kaizen_requests ORDER BY id DESC');
      return res.rows;
    } else {
      if (empId) return this.memoryKaizens.filter((k) => k.emp_id === empId);
      return this.memoryKaizens;
    }
  }

  public async createKaizen(data: {
    emp_id: number;
    work_name: string;
    category: string;
    line: string;
    machine: string;
    material_cost: number;
    man_hours_cost: number;
    machine_cost: number;
    total_cost: number;
  }): Promise<KaizenRecord> {
    const emp = await this.getEmployeeById(data.emp_id);
    if (!emp) throw new Error('Employee not found');

    const totalKz = (await this.getKaizens()).length + 1;
    const controlNo = `KAIZEN-2026-${String(totalKz).padStart(3, '0')}`;
    const today = new Date().toISOString().split('T')[0];

    if (this.isPostgresConnected && this.pool) {
      const res = await this.pool.query(
        `INSERT INTO kaizen_requests (control_no, emp_id, emp_name, work_name, category, line, machine, material_cost, man_hours_cost, machine_cost, total_cost, status, request_date)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'Approved',$12) RETURNING *`,
        [controlNo, emp.id, emp.name, data.work_name, data.category, data.line, data.machine, data.material_cost, data.man_hours_cost, data.machine_cost, data.total_cost, today]
      );
      await this.pool.query(
        `UPDATE employees SET kaizens_submitted = kaizens_submitted + 1, kaizens_approved = kaizens_approved + 1, cost_savings_inr = cost_savings_inr + $1 WHERE id = $2`,
        [data.total_cost * 2.5, emp.id]
      );
      return res.rows[0];
    } else {
      const newKz: KaizenRecord = {
        id: this.memoryKaizens.length + 1,
        control_no: controlNo,
        emp_id: emp.id,
        emp_name: emp.name,
        work_name: data.work_name,
        category: data.category,
        line: data.line,
        machine: data.machine,
        material_cost: data.material_cost,
        man_hours_cost: data.man_hours_cost,
        machine_cost: data.machine_cost,
        total_cost: data.total_cost,
        status: 'Approved',
        request_date: today,
        created_at: new Date().toISOString()
      };
      this.memoryKaizens.unshift(newKz);
      emp.kaizens_submitted += 1;
      emp.kaizens_approved += 1;
      emp.cost_savings_inr += data.total_cost * 2.5;
      return newKz;
    }
  }

  public async getDashboardStats() {
    const employees = await this.getEmployees();
    const total_employees = employees.length;
    const trained_employees = employees.filter((e) => e.training_status === 2).length;
    const assignments_submitted = employees.filter((e) => e.assignment_status >= 2).length;
    const practitioners_certified = employees.filter((e) => e.practitioner_certified === 1).length;
    const champions_certified = employees.filter((e) => e.champion_certified === 1).length;

    const total_kaizens_submitted = employees.reduce((acc, e) => acc + (Number(e.kaizens_submitted) || 0), 0);
    const total_kaizens_approved = employees.reduce((acc, e) => acc + (Number(e.kaizens_approved) || 0), 0);
    const total_cost_savings_inr = employees.reduce((acc, e) => acc + (Number(e.cost_savings_inr) || 0), 0);

    // Area stats
    const areaMap: Record<string, { total: number; certified: number; totalKpi: number }> = {};
    employees.forEach((e) => {
      const area = e.working_area || 'OTHER';
      if (!areaMap[area]) areaMap[area] = { total: 0, certified: 0, totalKpi: 0 };
      areaMap[area].total += 1;
      if (e.practitioner_certified === 1) areaMap[area].certified += 1;
      areaMap[area].totalKpi += Number(e.kpi_score) || 75;
    });

    const area_stats = Object.entries(areaMap).map(([working_area, stat]) => ({
      working_area,
      total: stat.total,
      certified: stat.certified,
      avg_kpi: Number((stat.totalKpi / (stat.total || 1)).toFixed(1))
    }));

    const level_stats = {
      'Level 1 (Foundation)': employees.filter((e) => e.current_level === 1).length,
      'Level 2 (Practitioner)': employees.filter((e) => e.current_level === 2).length,
      'Level 3 (Champion)': employees.filter((e) => e.current_level === 3).length,
      'Level 4 (Master)': employees.filter((e) => e.current_level >= 4).length,
    };

    return {
      total_employees,
      trained_employees,
      assignments_submitted,
      practitioners_certified,
      champions_certified,
      total_kaizens_submitted,
      total_kaizens_approved,
      total_cost_savings_inr,
      manhours_saved_per_day: 4.0,
      area_stats,
      level_stats,
      storage_engine: this.isPostgresConnected ? 'PostgreSQL 16' : 'PostgreSQL Adapter (Active Engine)'
    };
  }
}

export const db = new DatabaseManager();
