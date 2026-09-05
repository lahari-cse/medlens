import React from 'react';
import { AISummary } from '../types';
import { Sparkles, ShieldAlert, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { SafetyDisclaimer } from './SafetyDisclaimer';

interface Props {
  summary: AISummary | null;
  onGenerate: () => void;
  loading: boolean;
}

export const AISummaryCard: React.FC<Props> = ({ summary, onGenerate, loading }) => {
  return (
    <div className="space-y-6">
      
      <SafetyDisclaimer />

      <div className="bg-white border border-clinical-border rounded-xl shadow-sm overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-700 to-teal-900 text-white p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-teal-300" />
              <span className="text-xs uppercase font-bold tracking-widest text-teal-200">Patient-Friendly AI Summary</span>
            </div>
            <h3 className="font-bold text-xl font-outfit">Factual Information Overview</h3>
            <p className="text-xs text-teal-100/90 mt-0.5">
              Distinguishes documented clinical facts from AI language. Contains zero medical diagnoses or prescription advice.
            </p>
          </div>

          <button
            onClick={onGenerate}
            disabled={loading}
            className="px-4 py-2 bg-white text-teal-900 rounded-lg text-xs font-bold hover:bg-teal-50 transition-colors shadow-md flex items-center gap-1.5 shrink-0 disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 text-teal-600 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Synthesizing...' : 'Regenerate Summary'}
          </button>
        </div>

        {summary ? (
          <div className="p-6 space-y-6">
            
            {/* Main Narrative */}
            <div>
              <h4 className="font-bold text-xs uppercase text-slate-400 tracking-wider mb-2">DOCUMENTED CLINICAL SUMMARY</h4>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-800 leading-relaxed font-sans whitespace-pre-line">
                {summary.summaryText}
              </div>
            </div>

            {/* Documented Observations */}
            {summary.keyObservations.length > 0 && (
              <div>
                <h4 className="font-bold text-xs uppercase text-slate-400 tracking-wider mb-2">NOTABLE DOCUMENTED OBSERVATIONS</h4>
                <div className="space-y-2">
                  {summary.keyObservations.map((obs, i) => (
                    <div key={i} className="bg-teal-50/50 border border-teal-200/80 rounded-lg p-3 text-xs text-slate-800 flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                      <span>{obs}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Unavailable Reference Ranges Notice */}
            {summary.unavailableReferenceRanges.length > 0 && (
              <div>
                <h4 className="font-bold text-xs uppercase text-amber-700 tracking-wider mb-2">OMITTED REFERENCE RANGES IN SOURCE</h4>
                <div className="space-y-2">
                  {summary.unavailableReferenceRanges.map((notice, i) => (
                    <div key={i} className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>{notice}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timestamp & Provenance Footer */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span>Generated at: {new Date(summary.generatedAt).toLocaleString()}</span>
              <span className="font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                Source Type: AI_GENERATED (Bounded Facts)
              </span>
            </div>

          </div>
        ) : (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="font-bold text-slate-700 text-base">No AI Summary Generated Yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Click the button above to organize available patient records into a patient-friendly summary.
            </p>
            <button
              onClick={onGenerate}
              disabled={loading}
              className="px-5 py-2.5 bg-teal-600 text-white rounded-lg text-xs font-bold hover:bg-teal-700 shadow-sm transition-colors"
            >
              Generate AI Summary
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
