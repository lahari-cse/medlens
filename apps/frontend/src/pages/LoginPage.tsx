import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ShieldCheck, Lock } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-white font-sans">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-teal-500 flex items-center justify-center text-slate-950 mx-auto mb-3 shadow-lg">
            <Activity className="w-7 h-7 stroke-[2.5]" />
          </div>
          <h2 className="text-2xl font-bold font-outfit">MedLens Portal</h2>
          <p className="text-xs text-slate-400 mt-1">Clinical Information Intelligence Workspace</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-300 mb-1">Clinician Email</label>
            <input
              type="email"
              defaultValue="alex.rivera@medlens.health"
              className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:ring-2 focus:ring-teal-500 text-sm"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">Password</label>
            <input
              type="password"
              defaultValue="••••••••••••"
              className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:ring-2 focus:ring-teal-500 text-sm"
              required
            />
          </div>

          <div className="bg-teal-500/10 border border-teal-500/20 rounded-lg p-3 text-teal-300 text-[11px] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
            <span>Hackathon Demo Mode Enabled (Pre-authenticated)</span>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm transition-all shadow-md mt-2"
          >
            Access Clinical Dashboard
          </button>
        </form>
      </div>
    </div>
  );
};
