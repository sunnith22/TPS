import React, { useState } from 'react';
import { Employee, Komarigoto, KVPItem } from '../types';
import {
  FileSpreadsheet,
  Plus,
  Tag,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  Edit,
  Trash2,
  X,
  TrendingUp,
  ShieldAlert,
  Flame,
  Search
} from 'lucide-react';

interface PresentationBoardViewProps {
  employee: Employee | null;
  kvpList: KVPItem[];
  komarigotoList: Komarigoto[];
  onCreateKomarigoto: (data: Partial<Komarigoto>) => Promise<void>;
  onUpdateKomarigoto: (id: number, data: Partial<Komarigoto>) => Promise<void>;
  onDeleteKomarigoto: (id: number) => Promise<void>;
}

export const PresentationBoardView: React.FC<PresentationBoardViewProps> = ({
  employee,
  kvpList,
  komarigotoList,
  onCreateKomarigoto,
  onUpdateKomarigoto,
  onDeleteKomarigoto
}) => {
  const [activeTab, setActiveTab] = useState<'board' | 'kvp_matrix'>('board');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Komarigoto | null>(null);

  // Form state for creating/editing Komarigoto
  const [formData, setFormData] = useState({
    challenge: '',
    category: 'P',
    current_condition: '',
    target_condition: '',
    impact: '',
    priority: 1,
    viewpoints_21: '1,3,19',
    countermeasures: '',
    feasibility: 'Feasible',
    status: 'Identified'
  });

  const empChallenges = employee
    ? komarigotoList.filter((k) => k.emp_id === employee.id)
    : komarigotoList;

  const currentChallenge = selectedChallenge || empChallenges[0] || null;

  const handleOpenAddModal = () => {
    setFormData({
      challenge: '',
      category: 'P',
      current_condition: '',
      target_condition: '',
      impact: '',
      priority: 1,
      viewpoints_21: '1,3,19',
      countermeasures: '',
      feasibility: 'Feasible',
      status: 'Identified'
    });
    setIsModalOpen(true);
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;
    await onCreateKomarigoto({
      ...formData,
      emp_id: employee.id
    });
    setIsModalOpen(false);
  };

  const categoryLabels: Record<string, { label: string; color: string }> = {
    S: { label: 'Safety (Anzen)', color: 'bg-red-100 text-red-700 border-red-300' },
    E: { label: 'Environment (Kankyo)', color: 'bg-green-100 text-green-700 border-green-300' },
    Q: { label: 'Quality (Hinshitsu)', color: 'bg-blue-100 text-blue-700 border-blue-300' },
    P: { label: 'Productivity (Seisansei)', color: 'bg-purple-100 text-purple-700 border-purple-300' },
    C: { label: 'Cost (Genka)', color: 'bg-amber-100 text-amber-700 border-amber-300' }
  };

  return (
    <div className="space-y-6">
      {/* Subnavigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('board')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'board'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            9-Block Presentation Board
          </button>
          <button
            onClick={() => setActiveTab('kvp_matrix')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'kvp_matrix'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            21 Kaizen Viewpoints (KVP) Library
          </button>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="bg-red-600 hover:bg-red-700 text-white px-3.5 py-2 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Log New Komarigoto Challenge</span>
        </button>
      </div>

      {activeTab === 'board' ? (
        <div className="space-y-6">
          {/* Active Challenge Selector Pill Bar */}
          {empChallenges.length > 0 && (
            <div className="flex items-center space-x-2 overflow-x-auto pb-2">
              <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Challenges:</span>
              {empChallenges.map((k) => (
                <button
                  key={k.id}
                  onClick={() => setSelectedChallenge(k)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition border ${
                    currentChallenge?.id === k.id
                      ? 'bg-red-600 text-white border-red-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  [{k.category}] {k.challenge.substring(0, 32)}...
                </button>
              ))}
            </div>
          )}

          {/* 9-Block Presentation Board Container */}
          <div className="bg-slate-900 text-slate-100 p-6 rounded-2xl shadow-xl border border-slate-800">
            {/* Presentation Board Header */}
            <div className="border-b border-slate-700 pb-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-[10px] uppercase font-extrabold tracking-widest text-red-400">
                  Toyota Industries Engine India • Standardized Work Action Learning
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white mt-0.5">
                  TPS Practitioner 9-Block Presentation Board
                </h2>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-md font-semibold text-slate-300">
                  Target: 4.0 Hrs/Day Waste Elimination
                </span>
              </div>
            </div>

            {/* 3x3 Grid (9 Blocks) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Block 1: Personal Profile */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-red-400 flex items-center justify-between">
                    <span>Block 1</span>
                    <span>Profile</span>
                  </div>
                  <h3 className="text-sm font-bold text-white mt-1">Candidate Overview</h3>
                  <div className="space-y-1.5 text-xs text-slate-300 mt-3">
                    <div>Name: <strong className="text-white">{employee?.name || 'ARUNA D R'}</strong></div>
                    <div>Emp No: <span className="font-mono text-red-300">{employee?.emp_no || '50031'}</span></div>
                    <div>Division: <span className="text-slate-200">{employee?.division || 'GD'}</span></div>
                    <div>Current Level: <span className="text-emerald-400 font-bold">Level {employee?.current_level || 2}</span></div>
                    <div>Target Level: <span className="text-amber-400 font-bold">Level {employee?.target_level || 3}</span></div>
                  </div>
                </div>
                <div className="mt-3 text-[10px] text-slate-400 border-t border-slate-700/60 pt-2">
                  Mentor: {employee?.boss_name || 'TPS Office'}
                </div>
              </div>

              {/* Block 2: Shop Line & Machine */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-red-400 flex items-center justify-between">
                    <span>Block 2</span>
                    <span>Gemba Area</span>
                  </div>
                  <h3 className="text-sm font-bold text-white mt-1">Target Process</h3>
                  <div className="space-y-1.5 text-xs text-slate-300 mt-3">
                    <div>Line: <strong className="text-white">GD {employee?.working_area || 'HEAD'}</strong></div>
                    <div>Station: <span className="text-slate-200">OP-100 / OP-120 CNC Machining Bay</span></div>
                    <div>Process: <span className="text-slate-200">Rough Face Milling & Chamber Bore</span></div>
                    <div>Takt Time Target: <span className="text-red-300 font-bold">85 sec / engine</span></div>
                  </div>
                </div>
                <div className="mt-3 text-[10px] text-slate-400 border-t border-slate-700/60 pt-2">
                  Standardized Work Combination Sheet Active
                </div>
              </div>

              {/* Block 3: Komarigoto Definition */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-red-400 flex items-center justify-between">
                    <span>Block 3</span>
                    <span>Komarigoto</span>
                  </div>
                  <h3 className="text-sm font-bold text-white mt-1">Challenge Definition</h3>
                  <div className="mt-2 text-xs text-slate-200 font-medium leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/80">
                    {currentChallenge?.challenge || 'OP-100: T01 Tool Breakage loss on rough milling causing line stoppage.'}
                  </div>
                  <div className="mt-2 flex items-center space-x-2">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-red-600/30 text-red-300 border border-red-500/40">
                      Category: {currentChallenge?.category || 'P'} (Productivity)
                    </span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-600/30 text-blue-300 border border-blue-500/40">
                      Priority: {currentChallenge?.priority || 1}
                    </span>
                  </div>
                </div>
                <div className="mt-3 text-[10px] text-slate-400 border-t border-slate-700/60 pt-2">
                  Status: <strong className="text-emerald-400">{currentChallenge?.status || 'Implemented'}</strong>
                </div>
              </div>

              {/* Block 4: Current vs Target */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-red-400 flex items-center justify-between">
                    <span>Block 4</span>
                    <span>Gap Analysis</span>
                  </div>
                  <h3 className="text-sm font-bold text-white mt-1">Current vs Target State</h3>
                  <div className="mt-3 space-y-2 text-xs">
                    <div className="p-2 rounded bg-red-950/40 border border-red-900/50">
                      <div className="text-[10px] text-red-400 font-bold uppercase">Current Condition</div>
                      <div className="text-slate-200 mt-0.5 font-medium">
                        {currentChallenge?.current_condition || 'Actual 20 min tool change vs 5 min target'}
                      </div>
                    </div>
                    <div className="p-2 rounded bg-emerald-950/40 border border-emerald-900/50">
                      <div className="text-[10px] text-emerald-400 font-bold uppercase">Target Condition</div>
                      <div className="text-slate-200 mt-0.5 font-medium">
                        {currentChallenge?.target_condition || '5 min tool change (SMED quick change fixture)'}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-[10px] text-slate-400 border-t border-slate-700/60 pt-2">
                  Impact: {currentChallenge?.impact || 'Daily line takt time missed by 18%'}
                </div>
              </div>

              {/* Block 5: 21 Kaizen Viewpoints */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-red-400 flex items-center justify-between">
                    <span>Block 5</span>
                    <span>21 KVP Analysis</span>
                  </div>
                  <h3 className="text-sm font-bold text-white mt-1">Waste Viewpoints</h3>
                  <div className="mt-3 space-y-1.5">
                    {(currentChallenge?.viewpoints_21 || '1,3,19').split(',').map((idStr) => {
                      const kvp = kvpList.find((k) => k.id === Number(idStr.trim()));
                      if (!kvp) return null;
                      return (
                        <div key={kvp.id} className="text-xs p-1.5 rounded bg-slate-900/80 border border-slate-700/70">
                          <span className="font-bold text-red-400">#{kvp.id} [{kvp.category}]</span>
                          <span className="ml-1 text-slate-200">{kvp.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="mt-3 text-[10px] text-slate-400 border-t border-slate-700/60 pt-2">
                  Muri (Overburden) & Muda (Waiting) targeted
                </div>
              </div>

              {/* Block 6: Countermeasures */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-red-400 flex items-center justify-between">
                    <span>Block 6</span>
                    <span>Countermeasure</span>
                  </div>
                  <h3 className="text-sm font-bold text-white mt-1">Implementation Plan</h3>
                  <div className="mt-2 text-xs text-slate-200 font-medium leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/80">
                    {currentChallenge?.countermeasures || 'Implement pneumatic quick-change torque fixture & pre-setter gauge with visual color-coded guide.'}
                  </div>
                  <div className="mt-2 text-xs text-slate-300">
                    Feasibility: <span className="font-bold text-emerald-400">{currentChallenge?.feasibility || 'Feasible'}</span>
                  </div>
                </div>
                <div className="mt-3 text-[10px] text-slate-400 border-t border-slate-700/60 pt-2">
                  3 Slips Generation: Standardized Work Sheet Updated
                </div>
              </div>

              {/* Block 7: Tangible Effect & ROI */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-red-400 flex items-center justify-between">
                    <span>Block 7</span>
                    <span>Tangible Effect</span>
                  </div>
                  <h3 className="text-sm font-bold text-white mt-1">Quantified Benefit</h3>
                  <div className="mt-3 space-y-2 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-700/50 pb-1">
                      <span className="text-slate-400">Cycle Time Reduction:</span>
                      <strong className="text-emerald-400">15 min / change</strong>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-700/50 pb-1">
                      <span className="text-slate-400">Operator Fatigue (Muri):</span>
                      <strong className="text-blue-400">-40% Ergonomic Strain</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Annual Net Cost Savings:</span>
                      <strong className="text-amber-400">₹45,000 INR</strong>
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-[10px] text-slate-400 border-t border-slate-700/60 pt-2">
                  Verified with Amrut Kaizen Control Sheet
                </div>
              </div>

              {/* Block 8: Standardization & 5S */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-red-400 flex items-center justify-between">
                    <span>Block 8</span>
                    <span>Standardization</span>
                  </div>
                  <h3 className="text-sm font-bold text-white mt-1">5S & Maintenance</h3>
                  <div className="mt-3 space-y-1.5 text-xs text-slate-300">
                    <div>• Revised One-Point Lesson (OPL) displayed at OP-100</div>
                    <div>• Tool pre-setting rack shadow-board installed</div>
                    <div>• Daily TPM checklist updated for pneumatic seals</div>
                  </div>
                </div>
                <div className="mt-3 text-[10px] text-slate-400 border-t border-slate-700/60 pt-2">
                  Audited by Shop Trainer Dilip R
                </div>
              </div>

              {/* Block 9: Reflection & Next Step */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-red-400 flex items-center justify-between">
                    <span>Block 9</span>
                    <span>Self-Reflection</span>
                  </div>
                  <h3 className="text-sm font-bold text-white mt-1">Growth & Next Challenge</h3>
                  <div className="mt-2 text-xs text-slate-300 italic leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/80">
                    "Through 21 KVP analysis, I learned to look beyond the broken tool to the root causes in setup motion and human-machine balance."
                  </div>
                </div>
                <div className="mt-3 text-[10px] text-emerald-400 font-bold border-t border-slate-700/60 pt-2">
                  Recommended for Level 2 Certification Defense
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* 21 Kaizen Viewpoints Matrix Tab */
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="mb-6">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Layers className="w-5 h-5 text-red-600" />
              <span>Official 21 Kaizen Viewpoints (KVP) Library</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Classified according to the Toyota Production System 3M framework: Muri (Overburden), Mura (Unevenness), and Muda (Waste).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {kvpList.map((kvp) => {
              const categoryColor =
                kvp.category === 'Muri'
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : kvp.category === 'Mura'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : kvp.category === 'Muda'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-slate-50 text-slate-700 border-slate-200';

              return (
                <div key={kvp.id} className="p-4 rounded-xl border border-slate-200 hover:shadow-md transition bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-slate-800">KVP #{kvp.id}</span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${categoryColor}`}>
                      {kvp.category} • {kvp.subcategory}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 mt-2">{kvp.name}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{kvp.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal: Log New Komarigoto */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900">Log New Komarigoto Challenge</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Challenge Definition</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. OP-100: Excessive burrs on crank pin milling"
                  value={formData.challenge}
                  onChange={(e) => setFormData({ ...formData, challenge: e.target.value })}
                  className="w-full text-xs px-3 py-2 border rounded-lg focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category (S-E-Q-P-C)</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full text-xs px-3 py-2 border rounded-lg focus:outline-none focus:border-red-500"
                  >
                    <option value="S">Safety (Anzen)</option>
                    <option value="E">Environment (Kankyo)</option>
                    <option value="Q">Quality (Hinshitsu)</option>
                    <option value="P">Productivity (Seisansei)</option>
                    <option value="C">Cost (Genka)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
                    className="w-full text-xs px-3 py-2 border rounded-lg focus:outline-none focus:border-red-500"
                  >
                    <option value={1}>Priority 1 (Urgent)</option>
                    <option value={2}>Priority 2 (Standard)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Current Condition</label>
                  <input
                    type="text"
                    placeholder="e.g. 15% rework needed"
                    value={formData.current_condition}
                    onChange={(e) => setFormData({ ...formData, current_condition: e.target.value })}
                    className="w-full text-xs px-3 py-2 border rounded-lg focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Condition</label>
                  <input
                    type="text"
                    placeholder="e.g. 0% manual rework"
                    value={formData.target_condition}
                    onChange={(e) => setFormData({ ...formData, target_condition: e.target.value })}
                    className="w-full text-xs px-3 py-2 border rounded-lg focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Impact Description</label>
                <input
                  type="text"
                  placeholder="e.g. Cycle time lost 45 sec per component"
                  value={formData.impact}
                  onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
                  className="w-full text-xs px-3 py-2 border rounded-lg focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Associated 21 KVP IDs (comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. 1, 3, 19"
                  value={formData.viewpoints_21}
                  onChange={(e) => setFormData({ ...formData, viewpoints_21: e.target.value })}
                  className="w-full text-xs px-3 py-2 border rounded-lg focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Countermeasure</label>
                <textarea
                  rows={2}
                  placeholder="Describe proposed standardized work countermeasure..."
                  value={formData.countermeasures}
                  onChange={(e) => setFormData({ ...formData, countermeasures: e.target.value })}
                  className="w-full text-xs px-3 py-2 border rounded-lg focus:outline-none focus:border-red-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700"
                >
                  Save to Presentation Board
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
