import React from 'react';
import { Confidence } from '../types';
import { ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';

interface Props {
  confidence: Confidence;
}

export const ConfidenceBadge: React.FC<Props> = ({ confidence }) => {
  if (confidence === 'HIGH') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200" title="Extraction confidence label (not medical certainty)">
        <ShieldCheck className="w-3 h-3 text-teal-600" />
        Extraction confidence: High
      </span>
    );
  }

  if (confidence === 'MEDIUM') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200" title="Extraction confidence label (not medical certainty)">
        <AlertTriangle className="w-3 h-3 text-amber-600" />
        Extraction confidence: Medium
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse" title="Requires manual clinical verification">
      <ShieldAlert className="w-3 h-3 text-rose-600" />
      Extraction confidence: Low (Review Required)
    </span>
  );
};
