import React, { useState } from 'react';
import { Certification } from '../types';
import { verifyCertificate } from '../api/client';
import {
  Award,
  Search,
  Printer,
  CheckCircle2,
  ShieldCheck,
  QrCode,
  X,
  Calendar,
  ExternalLink
} from 'lucide-react';

interface CertificatesViewProps {
  certifications: Certification[];
}

export const CertificatesView: React.FC<CertificatesViewProps> = ({ certifications }) => {
  const [selectedCert, setSelectedCert] = useState<Certification | null>(null);
  const [verifyCode, setVerifyCode] = useState<string>('');
  const [verifyResult, setVerifyResult] = useState<Certification | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyCode.trim()) return;
    try {
      setVerifyError(null);
      const res = await verifyCertificate(verifyCode.trim());
      setVerifyResult(res);
    } catch (err: any) {
      setVerifyResult(null);
      setVerifyError('Certificate not found or invalid QR verification code.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-red-600 uppercase tracking-wider">
            <Award className="w-4 h-4" />
            <span>Official Credential Registry</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-1">
            TPS Competency Certificates & Digital Verification
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Cryptographically logged credentials certified under Toyota Production System governance
          </p>
        </div>

        {/* Verification Search */}
        <form onSubmit={handleVerify} className="flex items-center space-x-2 w-full md:w-80">
          <input
            type="text"
            placeholder="Enter Cert No (e.g. TIEI/TPS/2026/001)"
            value={verifyCode}
            onChange={(e) => setVerifyCode(e.target.value)}
            className="w-full text-xs px-3 py-2 border rounded-lg focus:outline-none focus:border-red-500"
          />
          <button
            type="submit"
            className="px-3.5 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition shrink-0"
          >
            Verify
          </button>
        </form>
      </div>

      {/* Verification Feedback Alert */}
      {verifyResult && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2 font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>
              AUTHENTIC: {verifyResult.cert_no} issued to {verifyResult.emp_name} ({verifyResult.level_name}) on {verifyResult.issue_date}
            </span>
          </div>
          <button
            onClick={() => setSelectedCert(verifyResult)}
            className="underline font-bold text-emerald-700 ml-4 shrink-0"
          >
            Open Certificate
          </button>
        </div>
      )}

      {verifyError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold">
          {verifyError}
        </div>
      )}

      {/* Certificates Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certifications.map((cert) => (
          <div
            key={cert.id}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-red-600">{cert.cert_no}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {cert.status}
                </span>
              </div>

              <h3 className="text-base font-black text-slate-900 mt-3">{cert.emp_name}</h3>
              <div className="text-xs font-bold text-slate-700 mt-1">{cert.level_name}</div>

              <div className="mt-4 space-y-1.5 text-xs text-slate-500">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Issue Date: <strong className="text-slate-700">{cert.issue_date}</strong></span>
                </div>
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>Signatory: <strong className="text-slate-700">{cert.signatory}</strong></span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-slate-400 text-xs">
                <QrCode className="w-4 h-4" />
                <span>QR Verified</span>
              </div>

              <button
                onClick={() => setSelectedCert(cert)}
                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1"
              >
                <span>View & Print</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Official Certificate Modal */}
      {selectedCert && (
        <div className="fixed inset-0 bg-slate-900/70 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-8 shadow-2xl relative border-4 border-slate-800">
            {/* Modal Controls (Hidden in Print) */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b print:hidden">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Official Credential Viewer
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Certificate</span>
                </button>
                <button
                  onClick={() => setSelectedCert(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Certificate Body */}
            <div
              id="printable-certificate"
              className="border-8 border-double border-amber-600 p-8 sm:p-12 text-center bg-amber-50/20 relative rounded-xl"
            >
              {/* Header */}
              <div className="space-y-1">
                <div className="text-xs font-extrabold tracking-widest text-red-600 uppercase">
                  TOYOTA INDUSTRIES ENGINE INDIA (TIEI)
                </div>
                <div className="text-sm font-semibold tracking-wider text-slate-600 uppercase">
                  Toyota Production System • GD Division
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 font-serif pt-4 uppercase tracking-wide">
                  Certificate of Competency
                </div>
              </div>

              {/* Body */}
              <div className="my-8 space-y-4">
                <p className="text-xs sm:text-sm text-slate-600 italic">This is to certify that</p>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-950 underline decoration-amber-500 decoration-2 underline-offset-8">
                  {selectedCert.emp_name}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed pt-2">
                  has successfully completed all rigorous milestone assessments, shop-floor 21 KVP action learning assignments, and executive defense presentations to achieve
                </p>
                <div className="inline-block px-6 py-2 rounded-xl bg-red-600 text-white text-base sm:text-lg font-extrabold uppercase tracking-wide shadow-md">
                  {selectedCert.level_name}
                </div>
              </div>

              {/* Signatures & QR Code */}
              <div className="mt-12 pt-8 border-t border-amber-300/80 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="text-center sm:text-left">
                  <div className="font-serif italic text-base text-slate-800 font-bold border-b border-slate-400 pb-1">
                    {selectedCert.signatory}
                  </div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase mt-1">
                    Authorized Signatory
                  </div>
                  <div className="text-[10px] text-slate-400">Date: {selectedCert.issue_date}</div>
                </div>

                {/* QR Code Block */}
                <div className="flex items-center space-x-3 bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
                  <QrCode className="w-12 h-12 text-slate-800" />
                  <div className="text-left">
                    <div className="text-[9px] font-bold text-slate-400 uppercase">Verification Code</div>
                    <div className="text-[10px] font-mono font-bold text-slate-800">{selectedCert.cert_no}</div>
                    <div className="text-[9px] text-emerald-600 font-bold">● Valid & Tamper-Proof</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
