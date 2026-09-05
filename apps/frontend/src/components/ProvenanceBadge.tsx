import React from 'react';
import { Provenance } from '../types';
import { FileText, CheckCircle2, Cpu, UserCheck } from 'lucide-react';

interface Props {
  provenance: Provenance;
  showPage?: boolean;
}

export const ProvenanceBadge: React.FC<Props> = ({ provenance, showPage = true }) => {
  const { sourceType, sourceDocumentName, page, verified } = provenance;

  if (verified || sourceType === 'USER_VERIFIED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
        Verified by user {provenance.verifiedBy ? `(${provenance.verifiedBy})` : ''}
      </span>
    );
  }

  if (sourceType === 'DOCUMENT_EXTRACTED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
        <FileText className="w-3.5 h-3.5 text-slate-500" />
        {sourceDocumentName || 'Document'} {showPage && page ? `• Page ${page}` : ''}
      </span>
    );
  }

  if (sourceType === 'AI_GENERATED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
        <Cpu className="w-3.5 h-3.5 text-amber-600" />
        AI Generated
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
      User Provided
    </span>
  );
};
