import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { SideBySideViewer } from '../components/SideBySideViewer';
import { EditFieldModal } from '../components/EditFieldModal';
import { SafetyDisclaimer } from '../components/SafetyDisclaimer';
import { api } from '../services/api';
import { MedicalReport, LabResult } from '../types';
import { Download, FileText, Printer, FileSpreadsheet, Code } from 'lucide-react';
import { exportToCSV, exportToJSON, exportToTXT, triggerPrintReport } from '../utils/exportUtils';

export const StructuredReportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<MedicalReport | null>(null);
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [editingLab, setEditingLab] = useState<LabResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showExportMenu, setShowExportMenu] = useState<boolean>(false);

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await api.getReportDetail(id);
      setReport(data.report);
      setLabResults(data.labs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleVerify = async (labId: string) => {
    try {
      await api.updateLabResult(labId, { verified: true, reason: 'Verified field against source document page' });
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleReject = async (labId: string) => {
    try {
      await api.updateLabResult(labId, { verified: false, rejectionNote: 'Rejected by user clinical review', reason: 'Field rejected' });
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveEdit = async (updates: any) => {
    if (!editingLab) return;
    try {
      await api.updateLabResult(editingLab.id, updates);
      setEditingLab(null);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportCSV = () => {
    if (!report) return;
    const rows = labResults.map(l => ({
      TestName: l.testName,
      Value: l.value,
      Unit: l.unit || '',
      ReferenceRange: l.referenceRange?.text || '',
      Status: l.status,
      Explanation: l.statusExplanation,
      Confidence: l.provenance.confidence,
      Verified: l.provenance.verified ? 'YES' : 'NO'
    }));
    exportToCSV(`${report.title.replace(/\s+/g, '_')}_labs.csv`, rows);
  };

  const handleExportJSON = () => {
    if (!report) return;
    exportToJSON(`${report.title.replace(/\s+/g, '_')}_record.json`, {
      report,
      extractedLabs: labResults
    });
  };

  const handleExportTXT = () => {
    if (!report) return;
    const divider = "========================================================================================";
    const subDivider = "----------------------------------------------------------------------------------------";
    
    let text = `${divider}\n`;
    text += `                      METROPOLITAN DIAGNOSTICS LABORATORY\n`;
    text += `              100 Health Sciences Plaza, Suite 400, Chicago, IL 60611\n`;
    text += `${divider}\n\n`;
    text += `DOCUMENT TITLE: ${report.title.toUpperCase()}\n`;
    text += `Report Date:     ${report.reportDate || 'Undated'}\n`;
    text += `Source File:     ${report.filename}\n\n`;
    text += `LABORATORY RESULTS & REFERENCE RANGES:\n${subDivider}\n`;
    text += `TEST NAME`.padEnd(28) + `RESULT`.padEnd(12) + `UNITS`.padEnd(10) + `REFERENCE RANGE`.padEnd(22) + `STATUS\n`;
    text += `${subDivider}\n`;

    labResults.forEach(l => {
      const name = (l.testName || '').padEnd(28);
      const val = (String(l.value || '')).padEnd(12);
      const unit = (l.unit || '').padEnd(10);
      const range = (l.referenceRange?.text || 'N/A').padEnd(22);
      const status = l.status || 'NORMAL';
      text += `${name}${val}${unit}${range}${status}\n`;
    });

    text += `\n${divider}\n*** END OF DIAGNOSTIC REPORT DOCUMENT ***\n`;
    exportToTXT(`${report.title.replace(/\s+/g, '_')}_clean_report.txt`, text);
  };

  if (loading || !report) {
    return (
      <div className="min-h-screen bg-clinical-bg">
        <Navbar />
        <div className="p-12 text-center text-slate-500">Loading structured report viewer...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-clinical-bg">
      <Navbar />

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Header with Export Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 font-outfit">{report.title}</h1>
            <p className="text-xs text-clinical-muted">Source Document: {report.filename} • Extracted Parameters: {labResults.length}</p>
          </div>

          {/* Export Button Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-1.5 space-y-1 text-xs">
                <button
                  onClick={() => { triggerPrintReport(); setShowExportMenu(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 hover:bg-teal-50 hover:text-teal-800 transition-colors text-left font-medium"
                >
                  <Printer className="w-4 h-4 text-teal-600" />
                  <span>Print / Export PDF</span>
                </button>
                <button
                  onClick={() => { handleExportCSV(); setShowExportMenu(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 hover:bg-teal-50 hover:text-teal-800 transition-colors text-left font-medium"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Export Lab Results (CSV)</span>
                </button>
                <button
                  onClick={() => { handleExportJSON(); setShowExportMenu(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 hover:bg-teal-50 hover:text-teal-800 transition-colors text-left font-medium"
                >
                  <Code className="w-4 h-4 text-blue-600" />
                  <span>Export Structured Record (JSON)</span>
                </button>
                <button
                  onClick={() => { handleExportTXT(); setShowExportMenu(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 hover:bg-teal-50 hover:text-teal-800 transition-colors text-left font-medium"
                >
                  <FileText className="w-4 h-4 text-amber-600" />
                  <span>Export Narrative Summary (TXT)</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <SafetyDisclaimer />

        <SideBySideViewer
          report={report}
          labResults={labResults}
          onVerify={handleVerify}
          onEdit={(lab) => setEditingLab(lab)}
          onReject={handleReject}
        />

        <EditFieldModal
          lab={editingLab}
          isOpen={Boolean(editingLab)}
          onClose={() => setEditingLab(null)}
          onSave={handleSaveEdit}
        />

      </main>
    </div>
  );
};
