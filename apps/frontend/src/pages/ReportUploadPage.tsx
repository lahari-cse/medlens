import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { api } from '../services/api';
import { Patient } from '../types';
import { Upload, FileText, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';

export const ReportUploadPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultPatientId = searchParams.get('patientId') || '';

  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(defaultPatientId);
  const [title, setTitle] = useState<string>('Comprehensive Lipid & Metabolic Panel');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getPatients().then(p => {
      setPatients(p);
      if (!selectedPatientId && p.length > 0) {
        setSelectedPatientId(p[0].id);
      }
    }).catch(console.error);
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) {
      setError('Please select a patient.');
      return;
    }
    setUploading(true);
    setError(null);

    try {
      const res = await api.uploadReport(selectedPatientId, title, file || undefined);
      navigate(`/reports/${res.report.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to upload report');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-clinical-bg">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white border border-clinical-border rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 font-outfit">Medical Report Processing Intake</h1>
              <p className="text-xs text-clinical-muted">Upload PDF or image reports for automated structured JSON extraction</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleUpload} className="space-y-6 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Target Patient Record *</label>
              <select
                value={selectedPatientId}
                onChange={e => setSelectedPatientId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-teal-500 font-medium"
              >
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.patientId}) — {p.age}yo {p.sex}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Document Title / Report Type *</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Complete Blood Count (CBC) with Differential"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Source Medical Document (Any file type: .txt, .pdf, .csv, .doc, .png, .jpg)</label>
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:border-teal-500 transition-colors bg-slate-50/50 cursor-pointer">
                <input
                  type="file"
                  accept="*"
                  onChange={e => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="fileUploadInput"
                />
                <label htmlFor="fileUploadInput" className="cursor-pointer block">
                  <FileText className="w-10 h-10 text-teal-600 mx-auto mb-2" />
                  <span className="font-bold text-slate-800 block text-sm">
                    {file ? file.name : 'Click to select or drop any report document (.txt, .pdf, .csv, .doc, images)'}
                  </span>
                  <span className="text-slate-400 text-[11px] block mt-1">
                    Accepts all file types (.txt, .csv, .pdf, .doc, .docx, .png, .jpg) • Maximum file size 50MB
                  </span>
                </label>
              </div>
            </div>

            <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 text-teal-900 text-xs flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold text-teal-900">Deterministic Multimodal Processing</strong>
                Extracted data will preserve exact reference ranges, unit definitions, and document page numbers.
              </div>
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
                disabled={uploading}
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg shadow-sm flex items-center gap-2 disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 ${uploading ? 'animate-spin' : ''}`} />
                {uploading ? 'Processing Document with AI...' : 'Upload & Process Document'}
              </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
};
