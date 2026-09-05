import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { ConflictCard, ClarificationCard } from '../components/ConflictCard';
import { SafetyDisclaimer } from '../components/SafetyDisclaimer';
import { api } from '../services/api';
import { Patient, Conflict, ClarificationQuestion } from '../types';
import { AlertTriangle, HelpCircle } from 'lucide-react';

export const ConflictsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [clarifications, setClarifications] = useState<ClarificationQuestion[]>([]);

  const loadData = async () => {
    if (!id) return;
    try {
      const [p, res] = await Promise.all([
        api.getPatient(id),
        api.getConflicts(id)
      ]);
      setPatient(p);
      setConflicts(res.conflicts);
      setClarifications(res.clarificationQuestions);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleResolve = async (conflictId: string) => {
    await api.resolveConflict(conflictId, 'Verified and reconciled by clinician');
    loadData();
  };

  return (
    <div className="min-h-screen bg-clinical-bg flex flex-col">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar patient={patient || undefined} />

        <main className="flex-1 p-8 space-y-8 overflow-auto">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 font-outfit">Conflict Detection & Clarification Engine</h1>
            <p className="text-xs text-clinical-muted">Flags potential inconsistencies across patient intake, lab reports, and prescriptions</p>
          </div>

          <SafetyDisclaimer />

          {/* Section 1: Potential Inconsistencies */}
          <div className="space-y-4">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Detected Inconsistencies ({conflicts.length})
            </h3>
            {conflicts.length > 0 ? (
              <div className="space-y-4">
                {conflicts.map(c => (
                  <ConflictCard key={c.id} conflict={c} onResolve={handleResolve} />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-clinical-border rounded-xl p-8 text-center text-slate-500 text-xs">
                No active clinical inconsistencies detected for this patient record.
              </div>
            )}
          </div>

          {/* Section 2: Contextual Clarification Questions */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-teal-600" />
              Contextual Clarification Questions ({clarifications.length})
            </h3>
            {clarifications.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {clarifications.map(q => (
                  <ClarificationCard key={q.id} question={q} />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-clinical-border rounded-xl p-8 text-center text-slate-500 text-xs">
                All document dates, lab units, and reference range metadata are complete.
              </div>
            )}
          </div>

        </main>
      </div>
    </div>
  );
};
