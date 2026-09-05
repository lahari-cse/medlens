import React, { useState } from 'react';
import { MedicalReport, LabResult } from '../types';
import { ProvenanceBadge } from './ProvenanceBadge';
import { ConfidenceBadge } from './ConfidenceBadge';
import { FileText, CheckCircle2, Edit3, XCircle, AlertCircle, ZoomIn, ZoomOut, Layers } from 'lucide-react';

interface Props {
  report: MedicalReport;
  labResults: LabResult[];
  onVerify: (labId: string) => void;
  onEdit: (lab: LabResult) => void;
  onReject: (labId: string) => void;
}

export const SideBySideViewer: React.FC<Props> = ({
  report,
  labResults,
  onVerify,
  onEdit,
  onReject
}) => {
  const [selectedPage, setSelectedPage] = useState<number>(1);
  const [zoom, setZoom] = useState<number>(100);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* LEFT PANEL: Document Source Preview */}
      <div className="lg:col-span-6 bg-white border border-clinical-border rounded-xl shadow-sm overflow-hidden flex flex-col h-[750px]">
        {/* Document Header Controls */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600" />
            <div>
              <h3 className="font-bold text-sm text-slate-900 truncate max-w-[240px]">{report.filename}</h3>
              <p className="text-[11px] text-slate-500">Document Source • {report.fileType.toUpperCase()} ({report.pageCount} Pages)</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 text-xs text-slate-600 font-medium">
              <button
                onClick={() => setZoom(prev => Math.max(70, prev - 15))}
                className="p-1 hover:bg-slate-100 rounded"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 text-[11px] font-mono">{zoom}%</span>
              <button
                onClick={() => setZoom(prev => Math.min(150, prev + 15))}
                className="p-1 hover:bg-slate-100 rounded"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-1">
              {Array.from({ length: report.pageCount }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setSelectedPage(p)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors ${
                    selectedPage === p
                      ? 'bg-teal-600 text-white'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Page {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Simulated High-Fidelity Clinical Report Document View */}
        <div className="flex-1 bg-slate-200/70 p-6 overflow-auto custom-scrollbar flex justify-center items-start">
          <div
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
            className="w-[520px] bg-white border border-slate-300 shadow-xl rounded-sm p-8 text-slate-800 text-xs font-mono transition-transform duration-200"
          >
            {/* Document Printed Header */}
            <div className="border-b-2 border-slate-800 pb-4 mb-6 flex justify-between items-start">
              <div>
                <h2 className="text-base font-bold tracking-tight text-slate-900 uppercase">METROPOLITAN DIAGNOSTICS LAB</h2>
                <p className="text-[10px] text-slate-600">100 Health Sciences Plaza, Suite 400</p>
                <p className="text-[10px] text-slate-600">CLIA License #: 99D0812903 • Phone: (800) 555-0199</p>
              </div>
              <div className="text-right">
                <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 font-bold rounded border text-[10px]">
                  PAGE {selectedPage} OF {report.pageCount}
                </span>
                <p className="text-[10px] text-slate-500 mt-1">Date: {report.reportDate || '2026-08-01'}</p>
              </div>
            </div>

            {/* Document Patient Info Block */}
            <div className="bg-slate-50 border border-slate-200 p-3 rounded mb-6 grid grid-cols-2 gap-2 text-[11px]">
              <div><span className="font-semibold text-slate-600">REPORT TITLE:</span> {report.title}</div>
              <div><span className="font-semibold text-slate-600">PATIENT ID:</span> PAT-8812</div>
              <div><span className="font-semibold text-slate-600">SPECIMEN ID:</span> SPEC-2026-8891</div>
              <div><span className="font-semibold text-slate-600">ORDERING PHYS:</span> Dr. Alex Rivera, MD</div>
            </div>

            {/* Report Printed Tables */}
            <div className="mb-6">
              <h4 className="font-bold text-slate-900 border-b border-slate-300 pb-1 mb-2 text-xs">LABORATORY RESULTS & REFERENCE RANGES</h4>
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="border-b border-slate-400 text-slate-600">
                    <th className="py-1">TEST NAME</th>
                    <th className="py-1">RESULT</th>
                    <th className="py-1">UNITS</th>
                    <th className="py-1">REFERENCE RANGE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {labResults.length > 0 ? (
                    labResults.map((lab, i) => (
                      <tr key={i} className={`hover:bg-teal-50/50 ${lab.status !== 'NORMAL' && lab.status !== 'NOT_DETERMINED' ? 'font-bold bg-amber-50/40' : ''}`}>
                        <td className="py-1.5 pr-2">{lab.testName}</td>
                        <td className="py-1.5 pr-2 text-teal-800">{lab.value}</td>
                        <td className="py-1.5 pr-2 text-slate-500">{lab.unit || '-'}</td>
                        <td className="py-1.5 text-slate-600">{lab.referenceRange?.text || (lab.referenceRange?.source === 'none' ? 'None Provided' : '-')}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-slate-400 italic">
                        [No quantitative lab rows detected on this page]
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Document Footer Notice */}
            <div className="border-t border-slate-200 pt-3 text-[9px] text-slate-400">
              *** END OF REPORT — AUTHENTICATED BY METROPOLITAN CLINICAL INFORMATION SYSTEMS ***
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Extracted Structured Records with Verification Workflow */}
      <div className="lg:col-span-6 space-y-4">
        
        <div className="bg-white border border-clinical-border rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-teal-600" />
              Structured AI Extractions ({labResults.length} Items)
            </h3>
            <p className="text-xs text-clinical-muted">Traceable data points extracted with deterministic status calculation</p>
          </div>
        </div>

        {/* List of Extracted Lab Cards */}
        <div className="space-y-3 max-h-[670px] overflow-auto custom-scrollbar pr-1">
          {labResults.map((lab) => {
            const isAbnormal = lab.status === 'LOW' || lab.status === 'HIGH' || lab.status === 'CRITICAL_LOW' || lab.status === 'CRITICAL_HIGH';
            const isNotDetermined = lab.status === 'NOT_DETERMINED';

            return (
              <div
                key={lab.id}
                className={`bg-white border rounded-xl p-4 shadow-sm transition-all hover:shadow-md ${
                  lab.provenance.verified
                    ? 'border-emerald-200 bg-emerald-50/10'
                    : isAbnormal
                    ? 'border-amber-300 bg-amber-50/20'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      {lab.testName}
                      <ConfidenceBadge confidence={lab.provenance.confidence} />
                    </h4>
                    <div className="mt-1 flex items-center gap-2">
                      <ProvenanceBadge provenance={lab.provenance} />
                    </div>
                  </div>

                  {/* Status Indicator Pill */}
                  <div>
                    {isNotDetermined ? (
                      <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 inline-flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
                        NOT DETERMINED
                      </span>
                    ) : isAbnormal ? (
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold inline-flex items-center gap-1 ${
                        lab.status.includes('CRITICAL')
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
                        <AlertCircle className="w-3.5 h-3.5" />
                        STATUS: {lab.status}
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        STATUS: NORMAL
                      </span>
                    )}
                  </div>
                </div>

                {/* Values & Range Detail Box */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 my-3 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px]">RESULT VALUE</span>
                    <span className="font-bold text-slate-900 text-sm">{lab.value} {lab.unit || ''}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">SOURCE REFERENCE RANGE</span>
                    <span className="font-medium text-slate-800">
                      {lab.referenceRange?.text || (isNotDetermined ? 'Not Provided in Report' : 'N/A')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">DETERMINISTIC EVALUATION</span>
                    <span className="text-slate-700 text-[11px] font-medium leading-tight block mt-0.5">
                      {lab.statusExplanation}
                    </span>
                  </div>
                </div>

                {/* Verification Actions Bar */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className="text-[11px] text-slate-400 font-mono">ID: {lab.id}</span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(lab)}
                      className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 font-medium hover:bg-slate-100 transition-colors flex items-center gap-1 text-xs"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                      Edit
                    </button>

                    <button
                      onClick={() => onReject(lab.id)}
                      className="px-2.5 py-1 rounded-md bg-rose-50 border border-rose-200 text-rose-700 font-medium hover:bg-rose-100 transition-colors flex items-center gap-1 text-xs"
                    >
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      Reject
                    </button>

                    <button
                      onClick={() => onVerify(lab.id)}
                      disabled={lab.provenance.verified}
                      className={`px-3 py-1 rounded-md font-semibold transition-colors flex items-center gap-1 text-xs shadow-sm ${
                        lab.provenance.verified
                          ? 'bg-emerald-100 text-emerald-800 cursor-default'
                          : 'bg-teal-600 text-white hover:bg-teal-700'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {lab.provenance.verified ? 'Verified' : 'Verify'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
};
