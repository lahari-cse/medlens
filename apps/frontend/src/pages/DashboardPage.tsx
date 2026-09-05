import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { SafetyDisclaimer } from '../components/SafetyDisclaimer';
import { api } from '../services/api';
import { Patient, MedicalReport, Conflict, AuditLog } from '../types';
import { Users, FileText, CheckCircle2, AlertTriangle, ChevronRight, Activity, Clock, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const p = await api.getPatients();
      setPatients(p);

      // Collect reports, conflicts, audit logs across demo patients
      const allReports: MedicalReport[] = [];
      const allConflicts: Conflict[] = [];

      for (const pat of p) {
        const reps = await api.getReports(pat.id);
        allReports.push(...reps);

        const conf = await api.getConflicts(pat.id);
        allConflicts.push(...conf.conflicts);
      }

      setReports(allReports);
      setConflicts(allConflicts);

      const logs = await api.getAuditLogs();
      setAuditLogs(logs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const totalPatients = patients.length;
  const totalReports = reports.length;
  const reportsProcessed = reports.filter(r => r.status === 'EXTRACTED' || r.status === 'VERIFIED').length;
  const pendingConflicts = conflicts.filter(c => !c.resolved).length;

  return (
    <div className="min-h-screen bg-clinical-bg">
      <Navbar onDemoReset={loadDashboardData} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-teal-700 bg-teal-50 px-2.5 py-1 rounded border border-teal-200">
              Synthetic Demo Dataset Connected
            </span>
            <h1 className="text-2xl font-bold text-slate-900 font-outfit mt-1.5">Clinical Dashboard</h1>
            <p className="text-xs text-clinical-muted">Systemwide overview of patients, extracted reports, conflicts, and verification activities.</p>
          </div>

          <Link
            to="/patients/new"
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-2 self-start md:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            Register New Patient
          </Link>
        </div>

        <SafetyDisclaimer />

        {/* 5 Core Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          <div className="bg-white border border-clinical-border rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">Total Patients</span>
              <Users className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 font-outfit">{totalPatients}</div>
            <p className="text-[10px] text-slate-400 mt-1">Synthetic active profiles</p>
          </div>

          <div className="bg-white border border-clinical-border rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">Total Reports</span>
              <FileText className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 font-outfit">{totalReports}</div>
            <p className="text-[10px] text-slate-400 mt-1">Uploaded document files</p>
          </div>

          <div className="bg-white border border-clinical-border rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">Reports Processed</span>
              <Activity className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 font-outfit">{reportsProcessed}</div>
            <p className="text-[10px] text-emerald-600 mt-1">Extracted to JSON</p>
          </div>

          <div className="bg-white border border-clinical-border rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">Items for Verification</span>
              <CheckCircle2 className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-amber-700 font-outfit">3</div>
            <p className="text-[10px] text-amber-600 mt-1">Low confidence / unverified</p>
          </div>

          <div className="bg-white border border-clinical-border rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">Potential Conflicts</span>
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-2xl font-bold text-rose-700 font-outfit">{pendingConflicts}</div>
            <p className="text-[10px] text-rose-600 mt-1">Inconsistencies flagged</p>
          </div>

        </div>

        {/* Two-Column Grid: Patient Roster & Recent Verification Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: Patients & Recent Reports */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white border border-clinical-border rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base text-slate-900">Synthetic Demo Patients</h3>
                <Link to="/patients" className="text-xs font-semibold text-teal-700 hover:underline">View All Patients</Link>
              </div>

              <div className="space-y-3">
                {patients.map(p => (
                  <Link
                    key={p.id}
                    to={`/patients/${p.id}`}
                    className="block bg-slate-50 border border-slate-200 rounded-xl p-4 hover:border-teal-400 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900">{p.name}</h4>
                          <span className="text-[11px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border">{p.patientId}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {p.age}yo {p.sex} • Symptoms: {p.symptoms.join(', ') || 'None'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded border border-teal-200">
                          Inspect Record
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Recent Audit Verification Activity */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-clinical-border rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-teal-600" />
                  Recent Verification Activity
                </h3>
              </div>

              <div className="space-y-3">
                {auditLogs.slice(0, 5).map(log => (
                  <div key={log.id} className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900">{log.userName}</span>
                      <span className="text-[10px] font-mono text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-slate-700">Action: <strong className="text-teal-800">{log.action}</strong> on {log.targetObject}</p>
                    <p className="text-[11px] text-slate-500 mt-1 italic">{log.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
};
