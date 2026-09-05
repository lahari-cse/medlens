import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { AISummaryCard } from '../components/AISummaryCard';
import { api } from '../services/api';
import { Patient, AISummary } from '../types';

export const SummaryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [summary, setSummary] = useState<AISummary | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const loadData = async () => {
    if (!id) return;
    try {
      const [p, s] = await Promise.all([
        api.getPatient(id),
        api.getSummary(id)
      ]);
      setPatient(p);
      setSummary(s);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleGenerate = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const s = await api.generateSummary(id);
      setSummary(s);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-clinical-bg flex flex-col">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar patient={patient || undefined} />

        <main className="flex-1 p-8 space-y-6 overflow-auto">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 font-outfit">Patient-Friendly AI Summary</h1>
            <p className="text-xs text-clinical-muted">Factual information organization bounded strictly by documented lab reports</p>
          </div>

          <AISummaryCard
            summary={summary}
            onGenerate={handleGenerate}
            loading={loading}
          />
        </main>
      </div>
    </div>
  );
};
