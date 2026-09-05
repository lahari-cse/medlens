import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { ReportComparator } from '../components/ReportComparator';
import { SafetyDisclaimer } from '../components/SafetyDisclaimer';
import { api } from '../services/api';
import { Patient, MedicalReport } from '../types';
import { GitCompare } from 'lucide-react';

export const ComparePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [report1, setReport1] = useState<string>('');
  const [report2, setReport2] = useState<string>('');
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api.getPatient(id),
      api.getReports(id)
    ]).then(([p, reps]) => {
      setPatient(p);
      setReports(reps);
      if (reps.length >= 2) {
        setReport1(reps[0].id);
        setReport2(reps[1].id);
        runComparison(reps[0].id, reps[1].id);
      }
    }).catch(console.error);
  }, [id]);

  const runComparison = async (r1Id: string, r2Id: string) => {
    if (!r1Id || !r2Id || r1Id === r2Id) return;
    setLoading(true);
    try {
      const res = await api.compareReports(r1Id, r2Id);
      setComparisonData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCompareClick = () => {
    runComparison(report1, report2);
  };

  return (
    <div className="min-h-screen bg-clinical-bg flex flex-col">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar patient={patient || undefined} />

        <main className="flex-1 p-8 space-y-6 overflow-auto">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 font-outfit">Longitudinal Report Comparison</h1>
            <p className="text-xs text-clinical-muted">Select two historic reports to compare lab parameters, numerical deltas, and reference range status</p>
          </div>

          <SafetyDisclaimer />

          {/* Report Selector Controls */}
          <div className="bg-white border border-clinical-border rounded-xl p-6 shadow-sm grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
            <div className="sm:col-span-5">
              <label className="block font-bold text-xs text-slate-700 mb-1">Baseline / Previous Report</label>
              <select
                value={report1}
                onChange={e => setReport1(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
              >
                {reports.map(r => (
                  <option key={r.id} value={r.id}>{r.title} ({r.reportDate || 'Undated'})</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-5">
              <label className="block font-bold text-xs text-slate-700 mb-1">Follow-Up / Current Report</label>
              <select
                value={report2}
                onChange={e => setReport2(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
              >
                {reports.map(r => (
                  <option key={r.id} value={r.id}>{r.title} ({r.reportDate || 'Undated'})</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <button
                onClick={handleCompareClick}
                disabled={loading || !report1 || !report2 || report1 === report2}
                className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <GitCompare className="w-4 h-4" />
                Compare
              </button>
            </div>
          </div>

          {comparisonData ? (
            <ReportComparator comparisonData={comparisonData} />
          ) : (
            <div className="bg-white border border-clinical-border rounded-xl p-12 text-center text-slate-500 text-xs">
              Select two distinct reports from the dropdown above to display side-by-side comparison tables.
            </div>
          )}

        </main>
      </div>
    </div>
  );
};
