import React, { useState, useMemo } from 'react';
import { Employee } from '../types';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowUpDown,
  Award,
  ChevronRight,
  Sparkles,
  Target
} from 'lucide-react';

interface SkillMatrixViewProps {
  employees: Employee[];
  selectedEmployee: Employee | null;
  onSelectEmployee: (emp: Employee) => void;
  onNavigateTab: (tab: any) => void;
}

export const SkillMatrixView: React.FC<SkillMatrixViewProps> = ({
  employees,
  selectedEmployee,
  onSelectEmployee,
  onNavigateTab
}) => {
  const [selectedArea, setSelectedArea] = useState<string>('ALL');
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const shopAreas = useMemo(() => {
    const set = new Set<string>();
    employees.forEach((e) => {
      if (e.working_area) set.add(e.working_area);
    });
    return ['ALL', ...Array.from(set)];
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      if (selectedArea !== 'ALL' && emp.working_area !== selectedArea) return false;
      if (selectedLevel !== 'ALL' && String(emp.current_level) !== selectedLevel) return false;
      if (searchTerm.trim()) {
        const s = searchTerm.toLowerCase();
        if (!emp.name.toLowerCase().includes(s) && !emp.emp_no.toLowerCase().includes(s)) {
          return false;
        }
      }
      return true;
    });
  }, [employees, selectedArea, selectedLevel, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Control Header & Filters */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center space-x-2">
              <Users className="w-5 h-5 text-red-600" />
              <span>GD Division Skill Matrix (78 Team Leaders)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive shop floor qualification roster synchronized from Excel source
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name or emp no..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-500 mr-1 flex items-center space-x-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Shop Area:</span>
          </span>
          {shopAreas.map((area) => (
            <button
              key={area}
              onClick={() => setSelectedArea(area)}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                selectedArea === area
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {area}
            </button>
          ))}

          <span className="text-slate-300 mx-2">|</span>

          <span className="text-xs font-bold text-slate-500 mr-1">Level:</span>
          {['ALL', '1', '2', '3'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                selectedLevel === lvl
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {lvl === 'ALL' ? 'All Levels' : `Level ${lvl}`}
            </button>
          ))}
        </div>
      </div>

      {/* 78 TLs Interactive Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Emp No</th>
                <th className="py-3 px-4">Team Leader Name</th>
                <th className="py-3 px-4">Shop Area</th>
                <th className="py-3 px-4">Current Level</th>
                <th className="py-3 px-4">Dojo Training</th>
                <th className="py-3 px-4">Post-Test</th>
                <th className="py-3 px-4">Mgr Defense</th>
                <th className="py-3 px-4">VP Defense</th>
                <th className="py-3 px-4">Kaizens</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.map((emp, index) => {
                const isSelected = selectedEmployee?.id === emp.id;
                const isCertified = emp.practitioner_certified === 1;

                return (
                  <tr
                    key={emp.id}
                    className={`hover:bg-slate-50/80 transition ${
                      isSelected ? 'bg-red-50/40 font-medium' : ''
                    }`}
                  >
                    <td className="py-3 px-4 text-slate-400 font-mono">{index + 1}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">{emp.emp_no}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{emp.name}</div>
                      <div className="text-[10px] text-slate-400">GD • {emp.designation}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">{emp.working_area}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          emp.current_level >= 3
                            ? 'bg-purple-100 text-purple-800'
                            : emp.current_level === 2
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        Level {emp.current_level}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {emp.training_status === 2 ? (
                        <span className="text-emerald-600 font-bold flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Completed</span>
                        </span>
                      ) : emp.training_status === 1 ? (
                        <span className="text-amber-600 font-semibold flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Scheduled</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">Pending</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-semibold ${emp.post_test_score >= 70 ? 'text-slate-800' : 'text-slate-400'}`}>
                        {emp.post_test_score > 0 ? `${emp.post_test_score}%` : '-'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {emp.presentation_mgr === 2 ? (
                        <span className="text-emerald-600 font-bold text-[11px] bg-emerald-50 px-1.5 py-0.5 rounded">Pass</span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Pending</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {emp.presentation_vp === 2 ? (
                        <span className="text-purple-600 font-bold text-[11px] bg-purple-50 px-1.5 py-0.5 rounded">Pass</span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Pending</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800">{emp.kaizens_approved}</span>
                      <span className="text-slate-400">/{emp.kaizens_submitted}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            onSelectEmployee(emp);
                            onNavigateTab('journey');
                          }}
                          className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[11px] font-semibold transition"
                        >
                          Journey
                        </button>
                        <button
                          onClick={() => {
                            onSelectEmployee(emp);
                            onNavigateTab('promotion');
                          }}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-[11px] font-semibold transition"
                        >
                          Gap Engine
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Statistics */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500">
          <div>
            Showing <strong className="text-slate-800">{filteredEmployees.length}</strong> of{' '}
            <strong className="text-slate-800">{employees.length}</strong> Team Leaders
          </div>
          <div className="flex items-center space-x-4 mt-2 sm:mt-0 font-medium">
            <span>Dojo Trained: <strong className="text-blue-600">{employees.filter((e) => e.training_status === 2).length}</strong></span>
            <span>Level 2+ Practitioners: <strong className="text-emerald-600">{employees.filter((e) => e.current_level >= 2).length}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
