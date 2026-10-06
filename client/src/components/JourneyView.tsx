import React, { useState } from 'react';
import { Employee, UserContext } from '../types';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Award,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  FileText,
  PlayCircle
} from 'lucide-react';

interface JourneyViewProps {
  employee: Employee | null;
  userContext: UserContext;
  onUpdateMilestone: (field: string, value: any) => Promise<void>;
  onNavigateTab: (tab: any) => void;
}

export const JourneyView: React.FC<JourneyViewProps> = ({
  employee,
  userContext,
  onUpdateMilestone,
  onNavigateTab
}) => {
  const [updatingField, setUpdatingField] = useState<string | null>(null);
  const [editScore, setEditScore] = useState<number | null>(null);

  if (!employee) {
    return (
      <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
        <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">No Team Leader Selected</h3>
        <p className="text-xs text-slate-500 mt-1">Please select an employee from the header or skill matrix to view their 11-step journey.</p>
        <button
          onClick={() => onNavigateTab('matrix')}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition"
        >
          Go to Skill Matrix (78 TLs)
        </button>
      </div>
    );
  }

  const handleUpdate = async (field: string, value: any) => {
    try {
      setUpdatingField(field);
      await onUpdateMilestone(field, value);
    } finally {
      setUpdatingField(null);
    }
  };

  const steps = [
    {
      num: 1,
      title: 'Nomination by Shop Manager',
      category: 'Phase 1: Foundation',
      desc: 'Selected by Section Head for GD division TPS capability upgrading.',
      status: 'completed',
      badge: 'Completed',
      action: null
    },
    {
      num: 2,
      title: 'Pre-Assessment Test',
      category: 'Phase 1: Foundation',
      desc: 'Baseline diagnostic exam covering 5S, waste types, and takt time fundamentals.',
      status: employee.pre_test_score > 0 ? 'completed' : 'pending',
      badge: employee.pre_test_score > 0 ? `${employee.pre_test_score}% Score` : 'Pending',
      action: (
        <div className="flex items-center space-x-2 mt-2">
          <input
            type="number"
            min="0"
            max="100"
            defaultValue={employee.pre_test_score || 55}
            id="pre-score-input"
            className="w-20 px-2 py-1 text-xs border border-slate-300 rounded bg-white text-slate-800"
          />
          <button
            onClick={() => {
              const val = Number((document.getElementById('pre-score-input') as HTMLInputElement).value);
              handleUpdate('pre_test_score', val);
            }}
            disabled={updatingField === 'pre_test_score'}
            className="px-2.5 py-1 bg-slate-800 text-white rounded text-xs font-semibold hover:bg-slate-700 disabled:opacity-50"
          >
            Save Score
          </button>
        </div>
      )
    },
    {
      num: 3,
      title: '3-Day Dojo Classroom & Practical',
      category: 'Phase 1: Foundation',
      desc: 'Standardized work, 3 slips generation, cycle time study, and TPS simulation.',
      status: employee.training_status === 2 ? 'completed' : (employee.training_status === 1 ? 'in_progress' : 'pending'),
      badge: employee.training_status === 2 ? 'Completed (100%)' : (employee.training_status === 1 ? 'Scheduled' : 'Not Started'),
      action: (
        <div className="flex items-center space-x-2 mt-2">
          <button
            onClick={() => handleUpdate('training_status', employee.training_status === 2 ? 0 : 2)}
            disabled={updatingField === 'training_status'}
            className={`px-3 py-1 rounded text-xs font-semibold transition ${
              employee.training_status === 2
                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {employee.training_status === 2 ? 'Mark as Not Completed' : 'Mark Completed (3 Days)'}
          </button>
        </div>
      )
    },
    {
      num: 4,
      title: 'Post-Assessment Knowledge Test',
      category: 'Phase 1: Foundation',
      desc: 'Post-training evaluation requiring minimum 70% passing benchmark.',
      status: employee.post_test_score >= 70 ? 'completed' : (employee.post_test_score > 0 ? 'in_progress' : 'pending'),
      badge: employee.post_test_score > 0 ? `${employee.post_test_score}% (${employee.post_test_score >= 70 ? 'Pass' : 'Retest'})` : 'Pending',
      action: (
        <div className="flex items-center space-x-2 mt-2">
          <input
            type="number"
            min="0"
            max="100"
            defaultValue={employee.post_test_score || 85}
            id="post-score-input"
            className="w-20 px-2 py-1 text-xs border border-slate-300 rounded bg-white text-slate-800"
          />
          <button
            onClick={() => {
              const val = Number((document.getElementById('post-score-input') as HTMLInputElement).value);
              handleUpdate('post_test_score', val);
            }}
            disabled={updatingField === 'post_test_score'}
            className="px-2.5 py-1 bg-slate-800 text-white rounded text-xs font-semibold hover:bg-slate-700 disabled:opacity-50"
          >
            Update Score
          </button>
        </div>
      )
    },
    {
      num: 5,
      title: 'Gemba Komarigoto Identification',
      category: 'Phase 2: Action Learning',
      desc: 'Pinpointing concrete shop-floor pain points across Safety, Environment, Quality, Productivity, Cost.',
      status: employee.assignment_status >= 1 ? 'completed' : 'pending',
      badge: employee.assignment_status >= 1 ? `${employee.komarigoto_items?.length || 1} Challenges Logged` : 'Pending Assignment',
      action: (
        <button
          onClick={() => onNavigateTab('action_learning')}
          className="mt-2 text-xs font-semibold text-red-600 hover:text-red-700 flex items-center space-x-1"
        >
          <span>Open 9-Block Action Learning Board</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )
    },
    {
      num: 6,
      title: 'Standardized Work & 21 KVP Countermeasures',
      category: 'Phase 2: Action Learning',
      desc: 'Applying 21 Kaizen Viewpoints to engineer line balancing and waste reduction.',
      status: employee.assignment_status >= 2 ? 'completed' : (employee.assignment_status === 1 ? 'in_progress' : 'pending'),
      badge: employee.assignment_status >= 2 ? 'Assignment Submitted' : 'In Draft',
      action: (
        <button
          onClick={() => handleUpdate('assignment_status', employee.assignment_status >= 2 ? 1 : 2)}
          disabled={updatingField === 'assignment_status'}
          className="mt-2 px-3 py-1 bg-slate-800 text-white rounded text-xs font-semibold hover:bg-slate-700"
        >
          {employee.assignment_status >= 2 ? 'Revert to Draft' : 'Submit Assignment for Review'}
        </button>
      )
    },
    {
      num: 7,
      title: 'Shop Manager Presentation & Evaluation',
      category: 'Phase 3: Presentation & Defense',
      desc: 'Gemba defense in front of Section Head and Shop Manager.',
      status: employee.presentation_mgr === 2 ? 'completed' : 'pending',
      badge: employee.presentation_mgr === 2 ? 'Cleared / Passed' : 'Pending Review',
      action: (
        <button
          onClick={() => handleUpdate('presentation_mgr', employee.presentation_mgr === 2 ? 0 : 2)}
          disabled={updatingField === 'presentation_mgr'}
          className={`mt-2 px-3 py-1 rounded text-xs font-semibold transition ${
            employee.presentation_mgr === 2
              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
              : 'bg-emerald-600 text-white hover:bg-emerald-700'
          }`}
        >
          {employee.presentation_mgr === 2 ? 'Revoke Approval' : 'Manager Sign-off (Pass)'}
        </button>
      )
    },
    {
      num: 8,
      title: 'Executive VP Defense Presentation',
      category: 'Phase 3: Presentation & Defense',
      desc: 'High-level defense before Executive VP Antony John Sudhakar P.',
      status: employee.presentation_vp === 2 ? 'completed' : 'pending',
      badge: employee.presentation_vp === 2 ? 'VP Approved' : 'Pending VP Defense',
      action: (
        <button
          onClick={() => handleUpdate('presentation_vp', employee.presentation_vp === 2 ? 0 : 2)}
          disabled={updatingField === 'presentation_vp'}
          className={`mt-2 px-3 py-1 rounded text-xs font-semibold transition ${
            employee.presentation_vp === 2
              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
              : 'bg-purple-600 text-white hover:bg-purple-700'
          }`}
        >
          {employee.presentation_vp === 2 ? 'Revoke VP Sign-off' : 'VP Executive Approval (Pass)'}
        </button>
      )
    },
    {
      num: 9,
      title: 'Level 2 - TPS Practitioner Certification',
      category: 'Phase 4: Certification',
      desc: 'Official credential issuance with digital signature and QR verification.',
      status: employee.practitioner_certified === 1 ? 'completed' : 'pending',
      badge: employee.practitioner_certified === 1 ? 'Certified Practitioner' : 'Prerequisites Incomplete',
      action: employee.practitioner_certified === 1 ? (
        <button
          onClick={() => onNavigateTab('certifications')}
          className="mt-2 text-xs font-semibold text-emerald-700 hover:underline flex items-center space-x-1"
        >
          <Award className="w-3.5 h-3.5" />
          <span>View Official Certificate</span>
        </button>
      ) : (
        <button
          onClick={() => onNavigateTab('promotion')}
          className="mt-2 text-xs font-semibold text-red-600 hover:underline flex items-center space-x-1"
        >
          <span>Run Gap Analysis Engine</span>
        </button>
      )
    },
    {
      num: 10,
      title: 'Jishuken Project 1 & 2 Execution',
      category: 'Phase 5: Autonomous Mastery',
      desc: 'Autonomous cross-functional kaizen sprints across shop lines.',
      status: employee.jishuken_1 === 1 && employee.jishuken_2 === 1 ? 'completed' : (employee.jishuken_1 === 1 ? 'in_progress' : 'pending'),
      badge: `${employee.jishuken_1 === 1 ? 'J1 Done' : 'J1 Pending'} • ${employee.jishuken_2 === 1 ? 'J2 Done' : 'J2 Pending'}`,
      action: (
        <div className="flex items-center space-x-2 mt-2">
          <button
            onClick={() => handleUpdate('jishuken_1', employee.jishuken_1 === 1 ? 0 : 1)}
            className="px-2.5 py-1 bg-slate-800 text-white rounded text-xs font-semibold"
          >
            Toggle J1 ({employee.jishuken_1 === 1 ? 'Completed' : 'Pending'})
          </button>
          <button
            onClick={() => handleUpdate('jishuken_2', employee.jishuken_2 === 1 ? 0 : 1)}
            className="px-2.5 py-1 bg-slate-800 text-white rounded text-xs font-semibold"
          >
            Toggle J2 ({employee.jishuken_2 === 1 ? 'Completed' : 'Pending'})
          </button>
        </div>
      )
    },
    {
      num: 11,
      title: 'Level 3 - TPS Champion Defense & Certification',
      category: 'Phase 5: Autonomous Mastery',
      desc: 'Final defense before DMD and certification as plant-wide TPS Champion.',
      status: employee.champion_certified === 1 ? 'completed' : 'pending',
      badge: employee.champion_certified === 1 ? 'Certified Champion' : 'Pending Final Evaluation',
      action: (
        <div className="flex items-center space-x-2 mt-2">
          <button
            onClick={() => handleUpdate('presentation_dmd', employee.presentation_dmd === 2 ? 0 : 2)}
            className="px-2.5 py-1 bg-slate-800 text-white rounded text-xs font-semibold"
          >
            Toggle DMD Defense ({employee.presentation_dmd === 2 ? 'Cleared' : 'Pending'})
          </button>
        </div>
      )
    }
  ];

  const completedStepsCount = steps.filter((s) => s.status === 'completed').length;
  const progressPercent = Math.round((completedStepsCount / 11) * 100);

  return (
    <div className="space-y-6">
      {/* Selected Employee Profile Header */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-black text-slate-900">{employee.name}</h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              {employee.emp_no}
            </span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-700">
              Level {employee.current_level}
            </span>
          </div>
          <div className="flex items-center space-x-4 text-xs text-slate-500 mt-1">
            <span>Division: <strong className="text-slate-700">{employee.division}</strong></span>
            <span>Shop Area: <strong className="text-slate-700">{employee.working_area}</strong></span>
            <span>Designation: <strong className="text-slate-700">{employee.designation}</strong></span>
            <span>Manager: <strong className="text-slate-700">{employee.boss_name}</strong></span>
          </div>
        </div>

        {/* Overall Progress Gauge */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 min-w-[220px]">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
            <span>11-Step Progress</span>
            <span className="text-red-600">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-red-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {completedStepsCount} of 11 Milestones Cleared
          </div>
        </div>
      </div>

      {/* Stepper Timeline */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-6 flex items-center space-x-2">
          <PlayCircle className="w-5 h-5 text-red-600" />
          <span>Interactive 11-Stage Competency Roadmap</span>
        </h3>

        <div className="space-y-6 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-slate-200 before:z-0">
          {steps.map((step) => {
            const isCompleted = step.status === 'completed';
            const isInProgress = step.status === 'in_progress';

            return (
              <div key={step.num} className="relative z-10 flex items-start space-x-4 group">
                {/* Step Circle Badge */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition shadow-sm ${
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : isInProgress
                      ? 'bg-amber-500 text-white ring-4 ring-amber-100'
                      : 'bg-slate-100 text-slate-500 border border-slate-300'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : step.num}
                </div>

                {/* Step Content Card */}
                <div className="flex-1 bg-slate-50 rounded-xl p-4 border border-slate-200/80 hover:bg-slate-100/60 transition">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        {step.category}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">{step.title}</h4>
                    </div>
                    <div>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full inline-block ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : isInProgress
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {step.badge}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{step.desc}</p>

                  {/* Interactive Action Controls */}
                  {step.action && <div className="mt-3 pt-3 border-t border-slate-200">{step.action}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
