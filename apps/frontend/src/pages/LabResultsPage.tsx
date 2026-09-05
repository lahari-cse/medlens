import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { ProvenanceBadge } from '../components/ProvenanceBadge';
import { ConfidenceBadge } from '../components/ConfidenceBadge';
import { EditFieldModal } from '../components/EditFieldModal';
import { SafetyDisclaimer } from '../components/SafetyDisclaimer';
import { api } from '../services/api';
import { Patient, LabResult } from '../types';
import { TestTube, CheckCircle2, Edit3, XCircle, AlertCircle, Search, Filter } from 'lucide-react';

export const LabResultsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [editingLab, setEditingLab] = useState<LabResult | null>(null);
  const [search, setSearch] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  const loadData = async () => {
    if (!id) return;
    try {
      const [p, labs] = await Promise.all([
        api.getPatient(id),
        api.getLabResults(id)
      ]);
      setPatient(p);
      setLabResults(labs);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleVerify = async (labId: string) => {
    await api.updateLabResult(labId, { verified: true, reason: 'Verified in lab summary table' });
    loadData();
  };

  const handleSaveEdit = async (updates: any) => {
    if (!editingLab) return;
    await api.updateLabResult(editingLab.id, updates);
    setEditingLab(null);
    loadData();
  };

  const categories = Array.from(new Set(labResults.map(l => l.category || 'General')));

  const filteredLabs = labResults.filter(l => {
    const matchesSearch = l.testName.toLowerCase().includes(search.toLowerCase());
    const matchesCat = filterCategory === 'ALL' || (l.category || 'General') === filterCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen bg-clinical-bg flex flex-col">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar patient={patient || undefined} />

        <main className="flex-1 p-8 space-y-6 overflow-auto">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 font-outfit">Laboratory Results Register</h1>
              <p className="text-xs text-clinical-muted">Structured quantitative test parameters with deterministic status evaluation</p>
            </div>
          </div>

          <SafetyDisclaimer />

          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 bg-white border border-clinical-border rounded-xl p-4 shadow-sm">
            <div className="sm:col-span-8 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search lab tests (e.g. Hemoglobin, Glucose, Cholesterol)..."
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div className="sm:col-span-4">
              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white"
              >
                <option value="ALL">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Table */}
          <div className="bg-white border border-clinical-border rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold">
                    <th className="p-4">TEST PARAMETER</th>
                    <th className="p-4">RESULT VALUE</th>
                    <th className="p-4">DOCUMENT REFERENCE RANGE</th>
                    <th className="p-4">DETERMINISTIC STATUS</th>
                    <th className="p-4">PROVENANCE & CONFIDENCE</th>
                    <th className="p-4 text-right">HUMAN ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredLabs.map(lab => (
                    <tr key={lab.id} className="hover:bg-slate-50">
                      <td className="p-4 font-bold text-slate-900">{lab.testName}</td>
                      <td className="p-4 font-bold text-teal-900">{lab.value} {lab.unit || ''}</td>
                      <td className="p-4 text-slate-600 font-mono text-[11px]">
                        {lab.referenceRange?.text || (lab.status === 'NOT_DETERMINED' ? 'Not Provided in Report' : '-')}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded font-bold border text-[10px] ${
                          lab.status === 'NOT_DETERMINED'
                            ? 'bg-slate-100 text-slate-700 border-slate-300'
                            : lab.status === 'NORMAL'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}>
                          {lab.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <ProvenanceBadge provenance={lab.provenance} showPage={false} />
                          <div>
                            <ConfidenceBadge confidence={lab.provenance.confidence} />
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingLab(lab)}
                            className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-100"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleVerify(lab.id)}
                            disabled={lab.provenance.verified}
                            className={`px-3 py-1 rounded text-xs font-semibold ${
                              lab.provenance.verified
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-teal-600 text-white hover:bg-teal-700'
                            }`}
                          >
                            {lab.provenance.verified ? 'Verified' : 'Verify'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <EditFieldModal
            lab={editingLab}
            isOpen={Boolean(editingLab)}
            onClose={() => setEditingLab(null)}
            onSave={handleSaveEdit}
          />

        </main>
      </div>
    </div>
  );
};
