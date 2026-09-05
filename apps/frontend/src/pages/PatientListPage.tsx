import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { api } from '../services/api';
import { Patient } from '../types';
import { Link } from 'react-router-dom';
import { Search, PlusCircle, User, ChevronRight } from 'lucide-react';

export const PatientListPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    api.getPatients().then(setPatients).catch(console.error);
  }, []);

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.patientId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-clinical-bg">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 font-outfit">Patient Records Roster</h1>
            <p className="text-xs text-clinical-muted">Manage clinical patient profiles and active medical reports</p>
          </div>

          <Link
            to="/patients/new"
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-2 self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            Add New Patient Profile
          </Link>
        </div>

        {/* Search filter bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search patients by name or ID (e.g. Eleanor, PAT-8812)..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 shadow-sm"
          />
        </div>

        {/* Patients Table */}
        <div className="bg-white border border-clinical-border rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold">
                  <th className="p-4">PATIENT ID</th>
                  <th className="p-4">NAME</th>
                  <th className="p-4">AGE / SEX</th>
                  <th className="p-4">REPORTED SYMPTOMS</th>
                  <th className="p-4">EXISTING CONDITIONS</th>
                  <th className="p-4 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="p-4 font-mono font-bold text-teal-800">{p.patientId}</td>
                    <td className="p-4 font-bold text-slate-900">{p.name}</td>
                    <td className="p-4 text-slate-600">{p.age}yo {p.sex}</td>
                    <td className="p-4 text-slate-700">{p.symptoms.join(', ') || 'None'}</td>
                    <td className="p-4 text-slate-700">{p.existingConditions.join(', ') || 'None'}</td>
                    <td className="p-4 text-right">
                      <Link
                        to={`/patients/${p.id}`}
                        className="px-3 py-1.5 rounded-lg bg-teal-50 text-teal-700 font-semibold hover:bg-teal-100 transition-colors inline-flex items-center gap-1 text-xs"
                      >
                        Inspect Record
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
};
