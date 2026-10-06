import React from 'react';
import { UserContext, Employee } from '../types';
import { ShieldCheck, UserCheck, ChevronDown, Award, Factory, Users } from 'lucide-react';

interface HeaderProps {
  userContext: UserContext;
  onRoleChange: (role: string) => void;
  selectedEmployee: Employee | null;
  employees: Employee[];
  onSelectEmployee: (emp: Employee) => void;
}

export const Header: React.FC<HeaderProps> = ({
  userContext,
  onRoleChange,
  selectedEmployee,
  employees,
  onSelectEmployee,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Division */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 rounded bg-red-600 font-bold text-white text-xl tracking-tighter shadow-sm">
              T
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base sm:text-lg tracking-wide text-white">
                  TOYOTA
                </span>
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-red-600/30 text-red-400 border border-red-500/30">
                  TIEI
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">| GD Division</span>
              </div>
              <p className="text-xs text-slate-400 font-medium truncate max-w-[200px] sm:max-w-none">
                TPS Competency Development & Learning Management System
              </p>
            </div>
          </div>

          {/* Active Employee Quick Selector & Role Switcher */}
          <div className="flex items-center space-x-3">
            {/* Active TL Selector */}
            <div className="hidden md:flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <Users className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-400">Selected TL:</span>
              <select
                value={selectedEmployee?.id || ''}
                onChange={(e) => {
                  const emp = employees.find((x) => x.id === Number(e.target.value));
                  if (emp) onSelectEmployee(emp);
                }}
                className="bg-slate-900 text-xs font-medium text-slate-200 border border-slate-700 rounded px-2 py-1 focus:outline-none focus:border-red-500"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.emp_no}) - {emp.working_area}
                  </option>
                ))}
              </select>
            </div>

            {/* Role Switcher Dropdown */}
            <div className="flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <ShieldCheck className="w-4 h-4 text-red-400" />
              <div className="text-left hidden lg:block">
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Active Role</div>
                <div className="text-xs font-semibold text-slate-200">{userContext.role_title}</div>
              </div>
              <select
                value={userContext.role}
                onChange={(e) => onRoleChange(e.target.value)}
                className="bg-slate-900 text-xs font-semibold text-red-300 border border-slate-700 rounded px-2 py-1 focus:outline-none focus:border-red-500 cursor-pointer"
              >
                <option value="TL">Team Leader (ARUNA D R)</option>
                <option value="MGR">Shop Manager (GD Head)</option>
                <option value="TRAINER">TPS Dojo Master Trainer</option>
                <option value="TPS_OFFICE">TPS Office (Admin)</option>
                <option value="LEADERSHIP">Executive Leadership (VP/DMD)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
