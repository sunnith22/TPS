import React, { useState, useEffect } from 'react';
import {
  Employee,
  DashboardStats,
  KVPItem,
  Komarigoto,
  Certification,
  KaizenRequest,
  TrainingBatch,
  UserContext
} from './types';
import {
  getDashboardStats,
  getEmployees,
  getKvpMaster,
  getKomarigotoList,
  getCertifications,
  getKaizens,
  getTrainingBatches,
  getCurrentUser,
  switchRole,
  updateJourneyMilestone,
  createKomarigoto,
  updateKomarigoto,
  deleteKomarigoto
} from './api/client';

import { Header } from './components/Header';
import { Navigation, TabKey } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { JourneyView } from './components/JourneyView';
import { PresentationBoardView } from './components/PresentationBoardView';
import { SkillMatrixView } from './components/SkillMatrixView';
import { PromotionEngineView } from './components/PromotionEngineView';
import { KaizenIntegrationView } from './components/KaizenIntegrationView';
import { BatchesView } from './components/BatchesView';
import { CertificatesView } from './components/CertificatesView';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [loading, setLoading] = useState<boolean>(true);

  // Core Data States
  const [userContext, setUserContext] = useState<UserContext>({
    role: 'TPS_OFFICE',
    role_title: 'TPS Office Secretariat & Administrator',
    emp_no: 'TPS-ADMIN-01',
    name: 'TPS Promotion Secretariat',
    permissions: ['full_admin']
  });

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [kvpList, setKvpList] = useState<KVPItem[]>([]);
  const [komarigotoList, setKomarigotoList] = useState<Komarigoto[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [kaizens, setKaizens] = useState<KaizenRequest[]>([]);
  const [batches, setBatches] = useState<TrainingBatch[]>([]);

  // Initial Load
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [statsData, empsData, kvpData, komariData, certsData, kaizData, batchesData, userData] =
        await Promise.all([
          getDashboardStats().catch(() => null),
          getEmployees(),
          getKvpMaster().catch(() => []),
          getKomarigotoList().catch(() => []),
          getCertifications().catch(() => []),
          getKaizens().catch(() => []),
          getTrainingBatches().catch(() => []),
          getCurrentUser().catch(() => null)
        ]);

      if (statsData) setDashboardStats(statsData);
      setEmployees(empsData);
      if (empsData.length > 0) {
        setSelectedEmployee(empsData[0]);
      }
      setKvpList(kvpData);
      setKomarigotoList(komariData);
      setCertifications(certsData);
      setKaizens(kaizData);
      setBatches(batchesData);
      if (userData) setUserContext(userData);
    } catch (err: any) {
      console.error('Failed to load application data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (role: string) => {
    try {
      const updated = await switchRole(
        role,
        selectedEmployee?.emp_no,
        selectedEmployee?.name
      );
      setUserContext(updated);
    } catch (err) {
      console.error('Role switch failed:', err);
    }
  };

  const handleUpdateMilestone = async (field: string, value: any) => {
    if (!selectedEmployee) return;
    try {
      await updateJourneyMilestone(selectedEmployee.id, field, value);
      // Refresh employee list and stats
      const [updatedEmps, updatedStats] = await Promise.all([
        getEmployees(),
        getDashboardStats()
      ]);
      setEmployees(updatedEmps);
      setDashboardStats(updatedStats);
      const refreshedSelected = updatedEmps.find((e) => e.id === selectedEmployee.id);
      if (refreshedSelected) {
        setSelectedEmployee(refreshedSelected);
      }
    } catch (err: any) {
      alert(`Error updating milestone: ${err.message}`);
    }
  };

  const handleCreateKomarigoto = async (data: Partial<Komarigoto>) => {
    try {
      const created = await createKomarigoto(data);
      setKomarigotoList([created, ...komarigotoList]);
      // Refresh employees
      const updatedEmps = await getEmployees();
      setEmployees(updatedEmps);
      const refreshedSelected = updatedEmps.find((e) => e.id === selectedEmployee?.id);
      if (refreshedSelected) setSelectedEmployee(refreshedSelected);
    } catch (err: any) {
      alert(`Failed to save Komarigoto: ${err.message}`);
    }
  };

  const handleUpdateKomarigoto = async (id: number, data: Partial<Komarigoto>) => {
    try {
      const updated = await updateKomarigoto(id, data);
      setKomarigotoList(komarigotoList.map((k) => (k.id === id ? updated : k)));
    } catch (err: any) {
      alert(`Failed to update Komarigoto: ${err.message}`);
    }
  };

  const handleDeleteKomarigoto = async (id: number) => {
    try {
      await deleteKomarigoto(id);
      setKomarigotoList(komarigotoList.filter((k) => k.id !== id));
    } catch (err: any) {
      alert(`Failed to delete Komarigoto: ${err.message}`);
    }
  };

  const refreshCertifications = async () => {
    const certs = await getCertifications();
    setCertifications(certs);
    const updatedEmps = await getEmployees();
    setEmployees(updatedEmps);
    const updatedStats = await getDashboardStats();
    setDashboardStats(updatedStats);
  };

  const refreshKaizens = async () => {
    const data = await getKaizens();
    setKaizens(data);
    const updatedStats = await getDashboardStats();
    setDashboardStats(updatedStats);
  };

  const refreshBatches = async () => {
    const data = await getTrainingBatches();
    setBatches(data);
    const updatedStats = await getDashboardStats();
    setDashboardStats(updatedStats);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 font-sans text-slate-800">
      {/* Top Header */}
      <Header
        userContext={userContext}
        onRoleChange={handleRoleChange}
        selectedEmployee={selectedEmployee}
        employees={employees}
        onSelectEmployee={setSelectedEmployee}
      />

      {/* Navigation Bar */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        certifiedCount={certifications.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-24">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
            <p className="mt-4 text-xs font-semibold text-slate-500">
              Synchronizing with Toyota Production System Backend...
            </p>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardView
                stats={dashboardStats}
                onNavigateTab={setActiveTab}
                onSelectEmployee={setSelectedEmployee}
                employees={employees}
              />
            )}

            {activeTab === 'journey' && (
              <JourneyView
                employee={selectedEmployee}
                userContext={userContext}
                onUpdateMilestone={handleUpdateMilestone}
                onNavigateTab={setActiveTab}
              />
            )}

            {activeTab === 'action_learning' && (
              <PresentationBoardView
                employee={selectedEmployee}
                kvpList={kvpList}
                komarigotoList={komarigotoList}
                onCreateKomarigoto={handleCreateKomarigoto}
                onUpdateKomarigoto={handleUpdateKomarigoto}
                onDeleteKomarigoto={handleDeleteKomarigoto}
              />
            )}

            {activeTab === 'matrix' && (
              <SkillMatrixView
                employees={employees}
                selectedEmployee={selectedEmployee}
                onSelectEmployee={setSelectedEmployee}
                onNavigateTab={setActiveTab}
              />
            )}

            {activeTab === 'promotion' && (
              <PromotionEngineView
                employee={selectedEmployee}
                onNavigateTab={setActiveTab}
                onCertificateIssued={refreshCertifications}
              />
            )}

            {activeTab === 'kaizen' && (
              <KaizenIntegrationView
                employee={selectedEmployee}
                kaizens={kaizens}
                onKaizenSubmitted={refreshKaizens}
              />
            )}

            {activeTab === 'batches' && (
              <BatchesView
                batches={batches}
                employees={employees}
                selectedEmployee={selectedEmployee}
                onBatchUpdated={refreshBatches}
              />
            )}

            {activeTab === 'certifications' && (
              <CertificatesView certifications={certifications} />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Toyota Industries Engine India (TIEI) • TPS Competency Development & LMS
          </div>
          <div className="text-[11px] text-slate-400">
            Node.js + PostgreSQL Architecture • Standardized Work & 21 KVP System
          </div>
        </div>
      </footer>
    </div>
  );
};
