import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { MedicalTimeline } from '../components/MedicalTimeline';
import { SafetyDisclaimer } from '../components/SafetyDisclaimer';
import { api } from '../services/api';
import { Patient, TimelineEvent } from '../types';

export const TimelinePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [events, setEvents] = useState<TimelineEvent[]>([]);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api.getPatient(id),
      api.getTimeline(id)
    ]).then(([p, evts]) => {
      setPatient(p);
      setEvents(evts);
    }).catch(console.error);
  }, [id]);

  return (
    <div className="min-h-screen bg-clinical-bg flex flex-col">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar patient={patient || undefined} />

        <main className="flex-1 p-8 space-y-6 overflow-auto">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 font-outfit">Chronological Medical Timeline</h1>
            <p className="text-xs text-clinical-muted">Traceable history of medical reports, lab draws, and clinical events</p>
          </div>

          <SafetyDisclaimer />

          <MedicalTimeline events={events} />
        </main>
      </div>
    </div>
  );
};
