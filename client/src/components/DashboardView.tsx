import React from 'react';
import { DashboardStats, Employee } from '../types';
import {
  Users,
  GraduationCap,
  Award,
  Sparkles,
  TrendingUp,
  Clock,
  Factory,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface DashboardViewProps {
  stats: DashboardStats | null;
  onNavigateTab: (tab: any) => void;
  onSelectEmployee: (emp: Employee) => void;
  employees: Employee[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  onNavigateTab,
  onSelectEmployee,
  employees
}) => {
  if (!stats) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        <span className="ml-3 text-sm text-slate-600 font-medium">Loading telemetry...</span>
      </div>
    );
  }

  const trainedPct = Math.round((stats.trained_employees / (stats.total_employees || 1)) * 100);
  const totalCert = stats.practitioners_certified + stats.champions_certified;

  return (
    <div className="space-y-6">
      {/* Top Banner Overview */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 text-white rounded-2xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-red-600/30 border border-red-500/40 text-red-300 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Plant Telemetry & Live LMS Synchronizer</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              TPS Competency Development Matrix
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Toyota Industries Engine India GD Division: Systematic progression through 11 milestone stages, from Dojo classroom foundations to Jishuken autonomous leadership.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateTab('matrix')}
              className="bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow transition flex items-center space-x-1.5"
            >
              <span>View 78 TL Matrix</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigateTab('journey')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl transition"
            >
              11-Step Stepper
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total TLs */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase">Total TLs</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-900">{stats.total_employees}</div>
            <div className="text-[11px] font-medium text-slate-500 mt-0.5">GD Division Roster</div>
          </div>
        </div>

        {/* Dojo Trained */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase">Dojo Trained</span>
            <GraduationCap className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-blue-600">{stats.trained_employees}</div>
            <div className="text-[11px] font-medium text-slate-500 mt-0.5">
              {trainedPct}% Completion Rate
            </div>
          </div>
        </div>

        {/* Certified Practitioners & Champions */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase">Certified</span>
            <Award className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-emerald-600">{totalCert}</div>
            <div className="text-[11px] font-medium text-slate-500 mt-0.5">
              {stats.practitioners_certified} Pract. | {stats.champions_certified} Champ.
            </div>
          </div>
        </div>

        {/* Kaizens Approved */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase">Kaizens</span>
            <Sparkles className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-purple-600">{stats.total_kaizens_approved}</div>
            <div className="text-[11px] font-medium text-slate-500 mt-0.5">
              Of {stats.total_kaizens_submitted} Proposed
            </div>
          </div>
        </div>

        {/* Total Cost Savings */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase">Cost Savings</span>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black text-amber-600">
              ₹{(stats.total_cost_savings_inr / 100000).toFixed(1)}L
            </div>
            <div className="text-[11px] font-medium text-slate-500 mt-0.5">Amrut ROI Impact</div>
          </div>
        </div>

        {/* Shop Hours Saved */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase">Hours Saved</span>
            <Clock className="w-4 h-4 text-red-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-red-600">4.0 <span className="text-sm font-semibold">hrs/day</span></div>
            <div className="text-[11px] font-medium text-slate-500 mt-0.5">Gemba Productivity Gain</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Area Maturity & Competency Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Shop Area Breakdown */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Factory className="w-4 h-4 text-slate-600" />
                <span>Shop Floor Area Maturity (GD Division)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Competency and certification density across machining and assembly lines
              </p>
            </div>
            <span className="text-xs font-semibold px-2 py-1 bg-slate-100 rounded text-slate-600">
              {stats.area_stats.length} Shops
            </span>
          </div>

          <div className="space-y-3.5">
            {stats.area_stats.map((area) => {
              const certRate = Math.round((area.certified / (area.total || 1)) * 100);
              return (
                <div key={area.working_area} className="p-3 rounded-lg bg-slate-50 border border-slate-200/70 hover:bg-slate-100/70 transition">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-800 font-bold">{area.working_area}</span>
                    <div className="flex items-center space-x-3 text-slate-600">
                      <span>{area.total} Team Leaders</span>
                      <span className="font-bold text-emerald-600">
                        {area.certified} Certified
                      </span>
                      <span className="text-slate-400">|</span>
                      <span className="text-blue-600">Avg KPI: {area.avg_kpi}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full mt-2 overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(certRate, 5)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4-Level Maturity Funnel */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2 mb-1">
              <Award className="w-4 h-4 text-red-600" />
              <span>TPS 4-Tier Competency Funnel</span>
            </h2>
            <p className="text-xs text-slate-500 mb-5">
              Standardized qualification progression
            </p>

            <div className="space-y-3">
              {Object.entries(stats.level_stats).map(([lvlName, count], idx) => {
                const colors = [
                  { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', badge: 'bg-blue-600' },
                  { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-600' },
                  { bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700', badge: 'bg-purple-600' },
                  { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', badge: 'bg-amber-600' }
                ];
                const c = colors[idx] || colors[0];
                return (
                  <div key={lvlName} className={`p-3.5 rounded-xl border ${c.bg} flex items-center justify-between`}>
                    <div>
                      <div className={`text-xs font-bold ${c.text}`}>{lvlName}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {idx === 0 && 'Waste elimination & 5S'}
                        {idx === 1 && '3 Slips & 21 KVP Action Learning'}
                        {idx === 2 && 'Jishuken 1 & 2 Execution'}
                        {idx === 3 && 'Gemba Coach & Multi-shop Leader'}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block text-sm font-black text-white px-2.5 py-0.5 rounded-full ${c.badge}`}>
                        {count}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Featured TL Card */}
          {employees.length > 0 && (
            <div className="mt-5 p-4 rounded-xl bg-slate-900 text-white border border-slate-800">
              <div className="text-[10px] uppercase font-bold text-red-400 tracking-wider">Top Champion Candidate</div>
              <div className="text-sm font-bold mt-1 text-slate-100">{employees[0].name} ({employees[0].emp_no})</div>
              <div className="text-xs text-slate-400">{employees[0].working_area} • Level {employees[0].current_level} Certified</div>
              <button
                onClick={() => {
                  onSelectEmployee(employees[0]);
                  onNavigateTab('journey');
                }}
                className="mt-3 w-full bg-red-600 hover:bg-red-700 text-white text-xs font-semibold py-1.5 rounded-lg transition text-center"
              >
                Inspect 11-Step Journey
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
