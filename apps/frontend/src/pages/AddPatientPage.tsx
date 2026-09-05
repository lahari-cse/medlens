import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { api } from '../services/api';
import { UserPlus, CheckCircle2 } from 'lucide-react';

export const AddPatientPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [age, setAge] = useState<number>(45);
  const [sex, setSex] = useState<'Male' | 'Female' | 'Other'>('Female');
  const [symptoms, setSymptoms] = useState('');
  const [conditions, setConditions] = useState('');
  const [allergies, setAllergies] = useState('');
  const [medications, setMedications] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const p = await api.createPatient({
        name,
        age: Number(age),
        sex,
        symptoms: symptoms.split(',').map(s => s.trim()).filter(Boolean),
        existingConditions: conditions.split(',').map(c => c.trim()).filter(Boolean),
        allergies: allergies.split(',').map(a => a.trim()).filter(Boolean),
        currentMedications: medications.split(',').map(m => m.trim()).filter(Boolean),
        additionalNotes: notes
      });
      navigate(`/patients/${p.id}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-clinical-bg">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white border border-clinical-border rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 font-outfit">Patient Information Intake</h1>
              <p className="text-xs text-clinical-muted">Register patient metadata and baseline intake information</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Full Patient Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Clara Oswald"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Age *</label>
                <input
                  type="number"
                  required
                  value={age}
                  onChange={e => setAge(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Biological Sex *</label>
              <select
                value={sex}
                onChange={e => setSex(e.target.value as any)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Current Symptoms (comma-separated)</label>
              <input
                type="text"
                value={symptoms}
                onChange={e => setSymptoms(e.target.value)}
                placeholder="e.g. Shortness of breath, Joint stiffness"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Existing Conditions (comma-separated)</label>
              <input
                type="text"
                value={conditions}
                onChange={e => setConditions(e.target.value)}
                placeholder="e.g. Hypertension, Type 2 Diabetes"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Current Medications (comma-separated)</label>
              <input
                type="text"
                value={medications}
                onChange={e => setMedications(e.target.value)}
                placeholder="e.g. Metformin 500mg, Atorvastatin 20mg"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Documented Allergies (comma-separated)</label>
              <input
                type="text"
                value={allergies}
                onChange={e => setAllergies(e.target.value)}
                placeholder="e.g. Penicillin, Latex"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Additional Clinical Notes</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                placeholder="Clinical observations or intake details..."
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg shadow-sm flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Register Patient Record
              </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
};
