import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { SafetyDisclaimer } from '../components/SafetyDisclaimer';
import { ProvenanceBadge } from '../components/ProvenanceBadge';
import { ConfidenceBadge } from '../components/ConfidenceBadge';
import { api } from '../services/api';
import { Patient, MedicalReport, LabResult } from '../types';
import { User, FileText, Pill, Stethoscope, AlertTriangle, ShieldCheck, Upload, ChevronRight, CheckCircle2 } from 'lucide-react';

export const PatientProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [labs, setLabs] = useState<LabResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      api.getPatient(id),
      api.getReports(id),
      api.getLabResults(id)
    ]).then(([p, r, l]) => {
      setPatient(p);
      setReports(r);
      setLabs(l);
    }).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  if (loading || !patient) {
    return (
      <div className="min-h-screen bg-clinical-bg">
        <Navbar />
        <div className="p-12 text-center text-slate-500">Loading patient profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-clinical-bg flex flex-col">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar patient={patient} />

        <main className="flex-1 p-8 space-y-8 overflow-auto">
          
          {/* Patient Header Block */}
          <div className="bg-white border border-clinical-border rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white font-bold text-xl flex items-center justify-center shadow-md font-outfit shrink-0">
                {patient.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-slate-900 font-outfit">{patient.name}</h1>
                  <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded border border-teal-200">
                    {patient.patientId}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {patient.age} years old • {patient.sex} • Profile Created: {new Date(patient.createdAt).toLocaleDateString()}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <ProvenanceBadge provenance={{ sourceType: 'USER_PROVIDED', confidence: 'HIGH', verified: true }} />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to={`/reports/upload?patientId=${patient.id}`}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5"
              >
                <Upload className="w-4 h-4" />
                Upload New Report
              </Link>
            </div>
          </div>

          <SafetyDisclaimer />

          {/* Structured Clinical Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Symptoms */}
            <div className="bg-white border border-clinical-border rounded-xl p-4 shadow-sm">
              <h3 className="font-bold text-xs uppercase text-slate-500 tracking-wider mb-3 flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-teal-600" />
                Reported Symptoms
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-800 font-medium">
                {patient.symptoms.map((s, i) => (
                  <li key={i} className="bg-slate-50 p-2 rounded border border-slate-200">
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            {/* Conditions */}
            <div className="bg-white border border-clinical-border rounded-xl p-4 shadow-sm">
              <h3 className="font-bold text-xs uppercase text-slate-500 tracking-wider mb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-teal-600" />
                Documented Conditions
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-800 font-medium">
                {patient.existingConditions.map((c, i) => (
                  <li key={i} className="bg-slate-50 p-2 rounded border border-slate-200">
                    {c}
                  </li>
                ))}
              </ul>
            </div>

            {/* Current Medications */}
            <div className="bg-white border border-clinical-border rounded-xl p-4 shadow-sm">
              <h3 className="font-bold text-xs uppercase text-slate-500 tracking-wider mb-3 flex items-center gap-2">
                <Pill className="w-4 h-4 text-teal-600" />
                Current Medications
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-800 font-medium">
                {patient.currentMedications.map((m, i) => (
                  <li key={i} className="bg-slate-50 p-2 rounded border border-slate-200">
                    {m}
                  </li>
                ))}
              </ul>
            </div>

            {/* Allergies */}
            <div className="bg-white border border-clinical-border rounded-xl p-4 shadow-sm">
              <h3 className="font-bold text-xs uppercase text-slate-500 tracking-wider mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Documented Allergies
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-800 font-medium">
                {patient.allergies.map((a, i) => (
                  <li key={i} className="bg-amber-50 p-2 rounded border border-amber-200 text-amber-900 font-semibold">
                    {a}
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Extracted Reports Section */}
          <div className="bg-white border border-clinical-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">Extracted Medical Reports ({reports.length})</h3>
                <p className="text-xs text-slate-500">Source documents with structured extraction results</p>
              </div>
              <Link to={`/reports/upload?patientId=${patient.id}`} className="text-xs font-semibold text-teal-700 hover:underline">
                + Upload Report
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reports.map(rep => {
                const repLabs = labs.filter(l => l.reportId === rep.id);
                return (
                  <div key={rep.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{rep.title}</h4>
                        <p className="text-xs text-slate-500">{rep.reportType} • File: {rep.filename}</p>
                        <p className="text-[11px] text-slate-400 mt-1">Date: {rep.reportDate || 'Undated'}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800 border">
                        {rep.status}
                      </span>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-xs text-slate-600 font-medium">{repLabs.length} Lab Results Extracted</span>
                      <Link
                        to={`/reports/${rep.id}`}
                        className="px-3 py-1 bg-teal-600 text-white rounded text-xs font-semibold hover:bg-teal-700 transition-colors flex items-center gap-1"
                      >
                        Side-by-Side Review
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};
