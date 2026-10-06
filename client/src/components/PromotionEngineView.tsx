import React, { useState, useEffect } from 'react';
import { Employee, PromotionReadiness } from '../types';
import { getEmployeeGapAnalysis, issueCertificate } from '../api/client';
import {
  Target,
  CheckCircle2,
  XCircle,
  Award,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

interface PromotionEngineViewProps {
  employee: Employee | null;
  onNavigateTab: (tab: any) => void;
  onCertificateIssued: () => void;
}

export const PromotionEngineView: React.FC<PromotionEngineViewProps> = ({
  employee,
  onNavigateTab,
  onCertificateIssued
}) => {
  const [readiness, setReadiness] = useState<PromotionReadiness | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [issuing, setIssuing] = useState<boolean>(false);
  const [issueSuccess, setIssueSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (employee) {
      loadGapAnalysis(employee.id);
    }
  }, [employee]);

  const loadGapAnalysis = async (empId: number) => {
    try {
      setLoading(true);
      setIssueSuccess(null);
      const data = await getEmployeeGapAnalysis(empId);
      setReadiness(data);
    } catch (err: any) {
      console.error('Error fetching gap analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleIssueCertificate = async () => {
    if (!employee || !readiness) return;
    try {
      setIssuing(true);
      const levelName = readiness.target_level === 3
        ? 'Level 3 - TPS Champion'
        : 'Level 2 - TPS Practitioner';

      const cert = await issueCertificate({
        emp_id: employee.id,
        level_name: levelName,
        signatory: 'Antony John Sudhakar P (VP)'
      });

      setIssueSuccess(`Certificate ${cert.cert_no} issued successfully!`);
      onCertificateIssued();
      // Reload gap analysis
      await loadGapAnalysis(employee.id);
    } catch (err: any) {
      alert(`Failed to issue certificate: ${err.message}`);
    } finally {
      setIssuing(false);
    }
  };

  if (!employee) {
    return (
      <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
        <Target className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">Select a Team Leader</h3>
        <p className="text-xs text-slate-500 mt-1">Select an employee from the Skill Matrix to calculate promotion readiness.</p>
        <button
          onClick={() => onNavigateTab('matrix')}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition"
        >
          Open Skill Matrix
        </button>
      </div>
    );
  }

  const isEligible = readiness?.status_color === 'emerald';

  return (
    <div className="space-y-6">
      {/* Engine Overview Header */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-red-600 uppercase tracking-wider">
            <Target className="w-4 h-4" />
            <span>Automated Qualification Engine</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-1">
            Promotion Readiness: {employee.name} ({employee.emp_no})
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Evaluating gap between Level {employee.current_level} and Target Level {employee.target_level}
          </p>
        </div>

        {/* Readiness Badge */}
        {readiness && (
          <div className="flex items-center space-x-3">
            <div
              className={`px-4 py-2 rounded-xl border text-xs font-black uppercase tracking-wider ${
                readiness.status_color === 'emerald'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : readiness.status_color === 'amber'
                  ? 'bg-amber-50 text-amber-700 border-amber-300'
                  : 'bg-rose-50 text-rose-700 border-rose-300'
              }`}
            >
              {readiness.eligibility_status}
            </div>

            {isEligible && (
              <button
                onClick={handleIssueCertificate}
                disabled={issuing}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition flex items-center space-x-1.5"
              >
                <Award className="w-4 h-4" />
                <span>{issuing ? 'Issuing...' : 'Issue Official Certificate'}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Success Notification */}
      {issueSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{issueSuccess}</span>
          </div>
          <button
            onClick={() => onNavigateTab('certifications')}
            className="text-emerald-700 hover:underline flex items-center space-x-1"
          >
            <span>View Certificate Registry</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Gap Analysis Checklist */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-red-600" />
          <span>Prerequisite Compliance Checklist (Target Level {employee.target_level})</span>
        </h3>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Calculating prerequisite gaps...</div>
        ) : readiness ? (
          <div className="space-y-3">
            {readiness.gaps.map((gap, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  gap.met
                    ? 'bg-emerald-50/50 border-emerald-200/80 text-emerald-950'
                    : 'bg-rose-50/50 border-rose-200/80 text-rose-950'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="mt-0.5">
                    {gap.met ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-500" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{gap.item}</h4>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Required Standard: <strong className="text-slate-700">{gap.required}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 sm:text-right text-xs">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Current Record</div>
                    <div className={`font-bold ${gap.met ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {gap.actual}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      gap.met ? 'bg-emerald-200 text-emerald-800' : 'bg-rose-200 text-rose-800'
                    }`}
                  >
                    {gap.met ? 'MET' : 'GAP'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};
