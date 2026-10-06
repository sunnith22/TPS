import axios from 'axios';
import {
  Employee,
  Komarigoto,
  Certification,
  TrainingBatch,
  KaizenRequest,
  KVPItem,
  PromotionReadiness,
  DashboardStats,
  UserContext
} from '../types';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth / Role API
export const switchRole = async (role: string, empNo?: string, name?: string): Promise<UserContext> => {
  const res = await api.post<UserContext>('/auth/role-switch', { role, emp_no: empNo, name });
  return res.data;
};

export const getCurrentUser = async (): Promise<UserContext> => {
  const res = await api.get<UserContext>('/auth/me');
  return res.data;
};

// Dashboard Stats API
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const res = await api.get<DashboardStats>('/stats/dashboard');
  return res.data;
};

// Employees API
export const getEmployees = async (
  area?: string,
  level?: number,
  search?: string
): Promise<Employee[]> => {
  const params: Record<string, any> = {};
  if (area && area !== 'ALL') params.working_area = area;
  if (level && level > 0) params.current_level = level;
  if (search && search.trim()) params.search = search.trim();

  const res = await api.get<Employee[]>('/employees', { params });
  return res.data;
};

export const getEmployeeById = async (id: number): Promise<Employee> => {
  const res = await api.get<Employee>(`/employees/${id}`);
  return res.data;
};

export const getEmployeeGapAnalysis = async (id: number): Promise<PromotionReadiness> => {
  const res = await api.get<PromotionReadiness>(`/employees/${id}/gap-analysis`);
  return res.data;
};

export const updateJourneyMilestone = async (
  id: number,
  field: string,
  value: number | string
): Promise<any> => {
  const res = await api.post(`/employees/${id}/journey`, { field, value });
  return res.data;
};

// Komarigoto API
export const getKomarigotoList = async (empId?: number): Promise<Komarigoto[]> => {
  const params = empId ? { emp_id: empId } : {};
  const res = await api.get<Komarigoto[]>('/komarigoto', { params });
  return res.data;
};

export const createKomarigoto = async (data: Partial<Komarigoto>): Promise<Komarigoto> => {
  const res = await api.post<Komarigoto>('/komarigoto', data);
  return res.data;
};

export const updateKomarigoto = async (id: number, data: Partial<Komarigoto>): Promise<Komarigoto> => {
  const res = await api.put<Komarigoto>(`/komarigoto/${id}`, data);
  return res.data;
};

export const deleteKomarigoto = async (id: number): Promise<any> => {
  const res = await api.delete(`/komarigoto/${id}`);
  return res.data;
};

// Certifications API
export const getCertifications = async (): Promise<Certification[]> => {
  const res = await api.get<Certification[]>('/certifications');
  return res.data;
};

export const verifyCertificate = async (certNo: string): Promise<Certification> => {
  const res = await api.get<Certification>(`/certifications/verify/${encodeURIComponent(certNo)}`);
  return res.data;
};

export const issueCertificate = async (data: { emp_id: number; level_name: string; signatory?: string }): Promise<Certification> => {
  const res = await api.post<Certification>('/certifications/issue', data);
  return res.data;
};

// Training API
export const getTrainingBatches = async (): Promise<TrainingBatch[]> => {
  const res = await api.get<TrainingBatch[]>('/training/batches');
  return res.data;
};

export const enrollTrainingBatch = async (batchId: number, empId: number): Promise<any> => {
  const res = await api.post(`/training/batches/${batchId}/enroll`, { emp_id: empId });
  return res.data;
};

// Kaizen API
export const getKaizens = async (empId?: number): Promise<KaizenRequest[]> => {
  const params = empId ? { emp_id: empId } : {};
  const res = await api.get<KaizenRequest[]>('/kaizen', { params });
  return res.data;
};

export const calculateKaizenRate = async (data: {
  machine: string;
  machine_hours: number;
  man_hours: number;
  material_cost: number;
}) => {
  const res = await api.post('/kaizen/calculate-rate', data);
  return res.data;
};

export const submitKaizen = async (data: {
  emp_id: number;
  work_name: string;
  category: string;
  line: string;
  machine: string;
  machine_hours: number;
  man_hours: number;
  material_cost: number;
}): Promise<KaizenRequest> => {
  const res = await api.post<KaizenRequest>('/kaizen', data);
  return res.data;
};

// KVP API
export const getKvpMaster = async (): Promise<KVPItem[]> => {
  const res = await api.get<KVPItem[]>('/kvp');
  return res.data;
};
