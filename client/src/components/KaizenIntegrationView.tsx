import React, { useState, useEffect } from 'react';
import { Employee, KaizenRequest } from '../types';
import { calculateKaizenRate, submitKaizen } from '../api/client';
import {
  Wrench,
  Calculator,
  Plus,
  TrendingUp,
  Clock,
  Sparkles,
  FileCheck,
  CheckCircle2,
  DollarSign
} from 'lucide-react';

interface KaizenIntegrationViewProps {
  employee: Employee | null;
  kaizens: KaizenRequest[];
  onKaizenSubmitted: () => void;
}

export const KaizenIntegrationView: React.FC<KaizenIntegrationViewProps> = ({
  employee,
  kaizens,
  onKaizenSubmitted
}) => {
  // Calculator State
  const [calcMachine, setCalcMachine] = useState<string>('MILLING');
  const [calcMachHours, setCalcMachHours] = useState<number>(4);
  const [calcManHours, setCalcManHours] = useState<number>(8);
  const [calcMaterialCost, setCalcMaterialCost] = useState<number>(3500);

  const [calcResult, setCalcResult] = useState<{
    machine_rate_per_hr: number;
    machine_total: number;
    manpower_rate_per_hr: number;
    manpower_total: number;
    material_cost: number;
    grand_total: number;
  }>({
    machine_rate_per_hr: 35,
    machine_total: 140,
    manpower_rate_per_hr: 250,
    manpower_total: 2000,
    material_cost: 3500,
    grand_total: 5640
  });

  // Modal State for New Kaizen
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [newKaizen, setNewKaizen] = useState({
    work_name: '',
    category: 'Productivity',
    line: 'GD HEAD',
    machine: 'MILLING',
    machine_hours: 4,
    man_hours: 8,
    material_cost: 3500
  });

  useEffect(() => {
    recalcRates();
  }, [calcMachine, calcMachHours, calcManHours, calcMaterialCost]);

  const recalcRates = async () => {
    try {
      const data = await calculateKaizenRate({
        machine: calcMachine,
        machine_hours: calcMachHours,
        man_hours: calcManHours,
        material_cost: calcMaterialCost
      });
      setCalcResult(data);
    } catch (err) {
      // Fallback local calc
      const rates: Record<string, number> = {
        LATHE: 27,
        WELDING: 26,
        MILLING: 35,
        'SURFACE GRINDING': 30,
        BORING: 38,
        DRILLING: 22,
        'ASSEMBLY FIXTURE': 18
      };
      const rate = rates[calcMachine] || 25;
      const machTotal = calcMachHours * rate;
      const manTotal = calcManHours * 250;
      setCalcResult({
        machine_rate_per_hr: rate,
        machine_total: machTotal,
        manpower_rate_per_hr: 250,
        manpower_total: manTotal,
        material_cost: calcMaterialCost,
        grand_total: machTotal + manTotal + calcMaterialCost
      });
    }
  };

  const handleSubmitKaizen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;
    try {
      await submitKaizen({
        emp_id: employee.id,
        ...newKaizen
      });
      setIsModalOpen(false);
      onKaizenSubmitted();
    } catch (err: any) {
      alert(`Error submitting Kaizen: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-red-600 uppercase tracking-wider">
            <Wrench className="w-4 h-4" />
            <span>Amrut Kaizen System Integration</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-1">
            Gemba Kaizen Proposals & Machine Cost Engineering
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Synchronizing plant Kaizen submissions with TIEI standard machine hourly cost standards
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow transition flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Submit Kaizen to Amrut</span>
        </button>
      </div>

      {/* 2-Column: Live Machine Cost Calculator & Ingested Proposals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Machine Cost Rate Calculator */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-slate-800 font-bold text-base mb-1">
              <Calculator className="w-5 h-5 text-red-600" />
              <span>Machine Hourly Rate Calculator</span>
            </div>
            <p className="text-xs text-slate-500 mb-5">
              TIEI Standard Costing: Lathe ₹27/h, Welding ₹26/h, Milling ₹35/h, Manpower ₹250/h.
            </p>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Machine Type</label>
                <select
                  value={calcMachine}
                  onChange={(e) => setCalcMachine(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-red-500 bg-white"
                >
                  <option value="MILLING">Milling (₹35 / hr)</option>
                  <option value="LATHE">Lathe (₹27 / hr)</option>
                  <option value="WELDING">Welding (₹26 / hr)</option>
                  <option value="SURFACE GRINDING">Surface Grinding (₹30 / hr)</option>
                  <option value="BORING">Boring (₹38 / hr)</option>
                  <option value="DRILLING">Drilling (₹22 / hr)</option>
                  <option value="ASSEMBLY FIXTURE">Assembly Fixture (₹18 / hr)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Machine Hours</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={calcMachHours}
                    onChange={(e) => setCalcMachHours(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Man Hours (₹250/h)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={calcManHours}
                    onChange={(e) => setCalcManHours(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Material / Parts Cost (INR)</label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={calcMaterialCost}
                  onChange={(e) => setCalcMaterialCost(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          </div>

          {/* Calculator Output Card */}
          <div className="mt-6 p-4 rounded-xl bg-slate-900 text-white border border-slate-800 space-y-2">
            <div className="text-[10px] uppercase font-bold text-red-400 tracking-wider">Estimated Investment</div>
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Machine Cost ({calcMachHours}h @ ₹{calcResult.machine_rate_per_hr}/h):</span>
              <strong>₹{calcResult.machine_total.toLocaleString()}</strong>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Manpower Cost ({calcManHours}h @ ₹250/h):</span>
              <strong>₹{calcResult.manpower_total.toLocaleString()}</strong>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Material Cost:</span>
              <strong>₹{calcResult.material_cost.toLocaleString()}</strong>
            </div>
            <div className="pt-2 border-t border-slate-700 flex items-center justify-between">
              <span className="text-xs font-bold text-white">Total Implementation Cost:</span>
              <span className="text-base font-black text-amber-400">₹{calcResult.grand_total.toLocaleString()}</span>
            </div>
            <div className="text-[10px] text-emerald-400 font-semibold text-right">
              Projected Annual ROI: ₹{(calcResult.grand_total * 2.5).toLocaleString()} INR
            </div>
          </div>
        </div>

        {/* Ingested Kaizen Proposals Registry */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <FileCheck className="w-5 h-5 text-emerald-600" />
                  <span>Amrut Ingested Kaizen Proposals</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Synchronized continuous improvement records across GD lines
                </p>
              </div>
              <span className="text-xs font-bold px-2 py-1 bg-slate-100 rounded text-slate-700">
                {kaizens.length} Records
              </span>
            </div>

            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {kaizens.map((kz) => (
                <div key={kz.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100/50 transition">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-900">{kz.work_name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                          {kz.control_no}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        By <strong className="text-slate-700">{kz.emp_name}</strong> • Line: {kz.line} • Machine: {kz.machine}
                      </div>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      {kz.status}
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center space-x-3 text-slate-600">
                      <span>Mach: ₹{Number(kz.machine_cost).toLocaleString()}</span>
                      <span>• Man: ₹{Number(kz.man_hours_cost).toLocaleString()}</span>
                      <span>• Mat: ₹{Number(kz.material_cost).toLocaleString()}</span>
                    </div>
                    <div>
                      Total: <strong className="text-slate-900">₹{Number(kz.total_cost).toLocaleString()} INR</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Submit Kaizen Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4">Submit Kaizen to Amrut System</h3>
            <form onSubmit={handleSubmitKaizen} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Kaizen Work Name / Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Quick-Change Chuck Fixture on OP-100"
                  value={newKaizen.work_name}
                  onChange={(e) => setNewKaizen({ ...newKaizen, work_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Line / Process</label>
                  <input
                    type="text"
                    value={newKaizen.line}
                    onChange={(e) => setNewKaizen({ ...newKaizen, line: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Machine</label>
                  <select
                    value={newKaizen.machine}
                    onChange={(e) => setNewKaizen({ ...newKaizen, machine: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-red-500 bg-white"
                  >
                    <option value="MILLING">MILLING</option>
                    <option value="LATHE">LATHE</option>
                    <option value="WELDING">WELDING</option>
                    <option value="SURFACE GRINDING">SURFACE GRINDING</option>
                    <option value="BORING">BORING</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mach. Hours</label>
                  <input
                    type="number"
                    min="0"
                    value={newKaizen.machine_hours}
                    onChange={(e) => setNewKaizen({ ...newKaizen, machine_hours: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Man Hours</label>
                  <input
                    type="number"
                    min="0"
                    value={newKaizen.man_hours}
                    onChange={(e) => setNewKaizen({ ...newKaizen, man_hours: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Material (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={newKaizen.material_cost}
                    onChange={(e) => setNewKaizen({ ...newKaizen, material_cost: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-lg font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
                >
                  Confirm & Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
