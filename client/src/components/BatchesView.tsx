import React, { useState } from 'react';
import { TrainingBatch, Employee } from '../types';
import { enrollTrainingBatch } from '../api/client';
import { CalendarCheck, Users, MapPin, Clock, Plus, CheckCircle2 } from 'lucide-react';

interface BatchesViewProps {
  batches: TrainingBatch[];
  employees: Employee[];
  selectedEmployee: Employee | null;
  onBatchUpdated: () => void;
}

export const BatchesView: React.FC<BatchesViewProps> = ({
  batches,
  employees,
  selectedEmployee,
  onBatchUpdated
}) => {
  const [enrollingId, setEnrollingId] = useState<number | null>(null);
  const [selectedBatchForEnroll, setSelectedBatchForEnroll] = useState<TrainingBatch | null>(null);
  const [selectedEmpId, setSelectedEmpId] = useState<number>(selectedEmployee?.id || employees[0]?.id || 1);

  const handleEnroll = async (batchId: number) => {
    try {
      setEnrollingId(batchId);
      await enrollTrainingBatch(batchId, selectedEmpId);
      alert('Team Leader successfully enrolled into TPS Dojo training batch!');
      setSelectedBatchForEnroll(null);
      onBatchUpdated();
    } catch (err: any) {
      alert(`Enrollment failed: ${err.message}`);
    } finally {
      setEnrollingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-red-600 uppercase tracking-wider">
            <CalendarCheck className="w-4 h-4" />
            <span>TPS Dojo Training Center</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-1">
            Training Batch Rosters & Dojo Schedules
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Interactive cohort enrollment for 3-Day Classroom & Shop Floor Practical Programs
          </p>
        </div>
      </div>

      {/* Batches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {batches.map((b) => {
          const isFull = b.enrolled_count >= b.capacity;
          const pct = Math.round((b.enrolled_count / (b.capacity || 1)) * 100);

          return (
            <div key={b.id} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-500">{b.batch_code}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isFull
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {isFull ? 'Full' : b.status}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mt-2">{b.level_name}</h3>
                <div className="text-xs font-semibold text-red-600 mt-0.5">{b.module_name}</div>

                <div className="mt-4 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center space-x-2">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>Trainer: <strong className="text-slate-800">{b.trainer_name}</strong></span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Venue: <strong className="text-slate-800">{b.venue}</strong></span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Dates: <strong className="text-slate-800">{b.start_date} to {b.end_date}</strong></span>
                  </div>
                </div>

                {/* Capacity Progress Bar */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Enrollment Capacity</span>
                    <span>{b.enrolled_count} / {b.capacity} TLs</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isFull ? 'bg-rose-500' : 'bg-red-600'
                      }`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <button
                  disabled={isFull}
                  onClick={() => setSelectedBatchForEnroll(b)}
                  className={`w-full py-2 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                    isFull
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700 text-white shadow-sm'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>{isFull ? 'Cohort Full' : 'Enroll Candidate'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Enrollment Modal */}
      {selectedBatchForEnroll && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">
              Enroll into {selectedBatchForEnroll.batch_code}
            </h3>
            <p className="text-xs text-slate-500 mt-1">{selectedBatchForEnroll.module_name}</p>

            <div className="mt-4">
              <label className="block text-xs font-bold text-slate-700 mb-1">Select Team Leader</label>
              <select
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(Number(e.target.value))}
                className="w-full text-xs px-3 py-2 border rounded-lg focus:outline-none focus:border-red-500 bg-white"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.emp_no}) - {emp.working_area}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-6 flex items-center justify-end space-x-2">
              <button
                onClick={() => setSelectedBatchForEnroll(null)}
                className="px-4 py-2 border rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleEnroll(selectedBatchForEnroll.id)}
                disabled={enrollingId === selectedBatchForEnroll.id}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700"
              >
                {enrollingId === selectedBatchForEnroll.id ? 'Enrolling...' : 'Confirm Enrollment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
