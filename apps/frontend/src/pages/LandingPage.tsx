import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ShieldCheck, FileText, CheckCircle2, ArrowRight, GitCompare, AlertTriangle, Sparkles, Layers } from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-teal-950 text-white font-sans">
      
      {/* Top Bar */}
      <header className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center text-white shadow-lg">
            <Activity className="w-6 h-6" />
          </div>
          <span className="font-bold text-2xl font-outfit tracking-tight">MedLens</span>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/login" className="text-xs font-semibold text-slate-300 hover:text-white px-4 py-2">
            Sign In
          </Link>
          <Link to="/dashboard" className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition-all shadow-md">
            Launch Demo App
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold mb-8">
          <ShieldCheck className="w-4 h-4 text-teal-400" />
          <span>Explainable AI Clinical Information Intelligence System</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight font-outfit leading-tight mb-6 bg-gradient-to-r from-white via-slate-100 to-teal-200 bg-clip-text text-transparent">
          Transform Fragmented Medical Reports into Traceable Patient Intelligence
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed mb-10">
          MedLens organizes multimodal clinical documents into structured, human-verifiable patient records with zero reference range hallucinations, complete data provenance, and side-by-side report analysis.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/dashboard"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-teal-500 to-teal-400 text-slate-950 text-sm font-extrabold hover:brightness-110 transition-all shadow-lg flex items-center justify-center gap-2"
          >
            Open Clinical Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-slate-800/50 border border-slate-700/80 rounded-2xl p-6">
            <Layers className="w-8 h-8 text-teal-400 mb-4" />
            <h3 className="text-lg font-bold font-outfit mb-2">Deterministic Ref Engine</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Calculates lab status strictly from report-provided reference ranges. Never fabricates bounds. Returns NOT_DETERMINED when missing.
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/80 rounded-2xl p-6">
            <CheckCircle2 className="w-8 h-8 text-teal-400 mb-4" />
            <h3 className="text-lg font-bold font-outfit mb-2">Side-by-Side Reviewer</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Dual-panel interface matching source document pages directly against extracted JSON cards with instant Verify / Edit workflows.
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/80 rounded-2xl p-6">
            <GitCompare className="w-8 h-8 text-teal-400 mb-4" />
            <h3 className="text-lg font-bold font-outfit mb-2">Longitudinal Report Compare</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Compares historic lab reports to highlight numerical differences and status shifts without ungrounded diagnostic claims.
            </p>
          </div>

        </div>
      </section>

    </div>
  );
};
