import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Activity, RefreshCw, ShieldCheck, User, PlusCircle } from 'lucide-react';
import { api } from '../services/api';

interface Props {
  onDemoReset?: () => void;
}

export const Navbar: React.FC<Props> = ({ onDemoReset }) => {
  const [resetting, setResetting] = React.useState(false);
  const navigate = useNavigate();

  const handleResetDemo = async () => {
    setResetting(true);
    try {
      await api.resetDemoData();
      if (onDemoReset) onDemoReset();
      navigate('/dashboard');
    } catch (e) {
      console.error(e);
    } finally {
      setResetting(false);
    }
  };

  return (
    <header className="bg-white border-b border-clinical-border sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <Activity className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl tracking-tight text-slate-900 font-outfit">MedLens</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">Clinical Intelligence</span>
            </div>
            <p className="text-xs text-clinical-muted font-normal">Traceable Patient Information Intelligence System</p>
          </div>
        </Link>

        {/* Responsible AI Shield & Actions */}
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs text-slate-600 font-medium">
            <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
            <span>Deterministic Reference Engine • Provenance Tracked</span>
          </div>

          <button
            onClick={handleResetDemo}
            disabled={resetting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 text-teal-700 border border-teal-200 text-xs font-semibold hover:bg-teal-100 transition-colors disabled:opacity-50"
            title="Reset dataset to synthetic hackathon demo patients"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
            {resetting ? 'Resetting...' : 'Load Synthetic Demo Data'}
          </button>

          <Link
            to="/patients/new"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition-colors shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            Add Patient
          </Link>
        </div>

      </div>
    </header>
  );
};
