import React from 'react';
import {
  LayoutDashboard,
  GitFork,
  FileSpreadsheet,
  Users,
  Target,
  Wrench,
  CalendarCheck,
  Award
} from 'lucide-react';

export type TabKey =
  | 'dashboard'
  | 'journey'
  | 'action_learning'
  | 'matrix'
  | 'promotion'
  | 'kaizen'
  | 'batches'
  | 'certifications';

interface NavigationProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  certifiedCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  certifiedCount
}) => {
  const tabs: { key: TabKey; label: string; icon: React.ReactNode; badge?: string }[] = [
    { key: 'dashboard', label: 'Executive Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { key: 'journey', label: '11-Step Journey', icon: <GitFork className="w-4 h-4" /> },
    { key: 'action_learning', label: 'Action Learning (9-Block)', icon: <FileSpreadsheet className="w-4 h-4" /> },
    { key: 'matrix', label: 'Skill Matrix (78 TLs)', icon: <Users className="w-4 h-4" /> },
    { key: 'promotion', label: 'Promotion Gap Engine', icon: <Target className="w-4 h-4" /> },
    { key: 'kaizen', label: 'Amrut Kaizen & Cost Rates', icon: <Wrench className="w-4 h-4" /> },
    { key: 'batches', label: 'Dojo Batches', icon: <CalendarCheck className="w-4 h-4" /> },
    {
      key: 'certifications',
      label: 'Certifications',
      icon: <Award className="w-4 h-4" />,
      badge: certifiedCount > 0 ? String(certifiedCount) : undefined
    }
  ];

  return (
    <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2.5 no-scrollbar scroll-smooth">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => onTabChange(tab.key)}
                className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`ml-1 text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-red-800 text-white' : 'bg-red-100 text-red-600'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
