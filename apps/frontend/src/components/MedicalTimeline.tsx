import React from 'react';
import { TimelineEvent } from '../types';
import { Clock, FileText, CheckCircle2, ChevronRight, TestTube } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProvenanceBadge } from './ProvenanceBadge';

interface Props {
  events: TimelineEvent[];
}

export const MedicalTimeline: React.FC<Props> = ({ events }) => {
  if (events.length === 0) {
    return (
      <div className="bg-white border border-clinical-border rounded-xl p-8 text-center">
        <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
        <h3 className="font-bold text-slate-700">No Timeline Records Found</h3>
        <p className="text-xs text-slate-500">Upload patient reports to construct a chronological medical history.</p>
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-teal-200">
      {events.map((evt, idx) => (
        <div key={evt.id || idx} className="relative group">
          
          {/* Node Bullet */}
          <div className="absolute -left-6 top-1.5 w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-md border-2 border-white">
            <FileText className="w-3 h-3" />
          </div>

          {/* Event Card */}
          <div className="bg-white border border-clinical-border rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  {evt.date}
                </span>
                <h4 className="font-bold text-base text-slate-900 mt-1">{evt.title}</h4>
                <p className="text-xs text-slate-500">{evt.reportType} • File: {evt.filename}</p>
              </div>

              <div className="flex items-center gap-3">
                <ProvenanceBadge provenance={{ sourceType: evt.provenanceSource, verified: false, confidence: 'HIGH' }} />
                <Link
                  to={`/reports/${evt.reportId}`}
                  className="px-3 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition-colors flex items-center gap-1 shadow-sm"
                >
                  View Source Report
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Event Content Extracted Summaries */}
            <div>
              <h5 className="font-bold text-xs text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <TestTube className="w-3.5 h-3.5 text-teal-600" />
                Extracted Parameters ({evt.labCount} items)
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {evt.details.map((detail, dIdx) => (
                  <div key={dIdx} className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-medium text-slate-800 flex items-center justify-between">
                    <span>{detail}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      ))}
    </div>
  );
};
