import React from 'react';
import { Conflict, ClarificationQuestion } from '../types';
import { AlertTriangle, HelpCircle, CheckCircle2, ShieldAlert, ArrowRight } from 'lucide-react';

interface ConflictProps {
  conflict: Conflict;
  onResolve: (conflictId: string) => void;
}

export const ConflictCard: React.FC<ConflictProps> = ({ conflict, onResolve }) => {
  return (
    <div className={`bg-white border rounded-xl p-5 shadow-sm transition-all ${
      conflict.resolved ? 'border-emerald-200 bg-emerald-50/20' : 'border-amber-300 bg-amber-50/30'
    }`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
            conflict.resolved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
          }`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold uppercase tracking-wider text-[10px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
                Potential Inconsistency Detected
              </span>
              <span className="text-xs text-slate-400 font-mono">Severity: {conflict.severity}</span>
            </div>
            <h4 className="font-bold text-base text-slate-900 mt-1">{conflict.title}</h4>
            <p className="text-xs text-slate-700 leading-relaxed mt-1">{conflict.description}</p>
          </div>
        </div>

        <div>
          {conflict.resolved ? (
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-md border border-emerald-300 inline-flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Verified & Resolved
            </span>
          ) : (
            <button
              onClick={() => onResolve(conflict.id)}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors flex items-center gap-1"
            >
              Verify & Resolve Conflict
            </button>
          )}
        </div>
      </div>

      {/* Source Comparison Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-200/80 text-xs">
        {conflict.sourceItems.map((item, idx) => (
          <div key={idx} className="bg-white border border-slate-200 p-2.5 rounded-lg">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">{item.label}</span>
            <span className="font-semibold text-slate-800 mt-0.5 block">{item.value}</span>
          </div>
        ))}
      </div>

      {conflict.resolved && conflict.resolutionNote && (
        <div className="mt-3 text-xs bg-emerald-100/60 text-emerald-900 p-2.5 rounded-lg border border-emerald-200">
          <strong className="block text-[10px] uppercase text-emerald-800">Resolution Note:</strong>
          {conflict.resolutionNote}
        </div>
      )}
    </div>
  );
};

interface ClarificationProps {
  question: ClarificationQuestion;
}

export const ClarificationCard: React.FC<ClarificationProps> = ({ question }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-start gap-3 hover:border-teal-300 transition-colors">
      <div className="p-2 rounded-lg bg-teal-50 text-teal-700 shrink-0">
        <HelpCircle className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <span className="font-bold text-[10px] uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
          Contextual Clarification Required
        </span>
        <h4 className="font-bold text-sm text-slate-900 mt-1">{question.question}</h4>
        <p className="text-xs text-slate-600 mt-0.5">{question.context}</p>
        
        <div className="mt-2.5 bg-slate-50 border border-slate-200 rounded-lg p-2 flex items-center justify-between text-xs">
          <span className="text-slate-600 font-medium">{question.suggestedAction}</span>
          <span className="text-[11px] font-mono text-teal-700 underline font-semibold cursor-pointer">
            Review Field
          </span>
        </div>
      </div>
    </div>
  );
};
