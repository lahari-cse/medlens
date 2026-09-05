import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { AuditLogTable } from '../components/AuditLogTable';
import { SafetyDisclaimer } from '../components/SafetyDisclaimer';
import { api } from '../services/api';
import { Patient, AuditLog } from '../types';

export const AuditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api.getPatient(id),
      api.getAuditLogs(id)
    ]).then(([p, l]) => {
      setPatient(p);
      setLogs(l);
    }).catch(console.error);
  }, [id]);

  return (
    <div className="min-h-screen bg-clinical-bg flex flex-col">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar patient={patient || undefined} />

        <main className="flex-1 p-8 space-y-6 overflow-auto">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 font-outfit">Audit History & Provenance Trail</h1>
            <p className="text-xs text-clinical-muted">Complete timeline of report uploads, AI JSON extractions, and user verification edits</p>
          </div>

          <SafetyDisclaimer />

          <AuditLogTable logs={logs} />
        </main>
      </div>
    </div>
  );
};
