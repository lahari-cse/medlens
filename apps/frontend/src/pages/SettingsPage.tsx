import React from 'react';
import { Navbar } from '../components/Navbar';
import { ShieldCheck, Cpu, Database, Key } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-clinical-bg">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-outfit">System Settings & Clinical Governance</h1>
          <p className="text-xs text-clinical-muted">Configure AI extraction thresholds, database connectivity, and security parameters</p>
        </div>

        <div className="bg-white border border-clinical-border rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex items-start gap-3 pb-4 border-b border-slate-100">
            <ShieldCheck className="w-6 h-6 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-base text-slate-900">Responsible AI Engine Governance</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Deterministic reference-range evaluation is strictly enforced in core Node.js application code. AI outputs are prohibited from diagnosing or prescribing.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
              <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
                <Cpu className="w-4 h-4 text-teal-600" />
                Google Gemini API Status
              </div>
              <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mt-1">
                Active (Gemini 1.5 Flash / Vision Engine)
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
              <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
                <Database className="w-4 h-4 text-teal-600" />
                Database Engine
              </div>
              <span className="text-[11px] font-mono text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 inline-block mt-1">
                Dual Mode: MongoDB Atlas / High-Performance Store
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
