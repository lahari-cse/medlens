import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const SafetyDisclaimer: React.FC = () => {
  return (
    <div className="bg-amber-50/90 border border-amber-200/80 rounded-xl p-3.5 flex items-start gap-3 text-amber-900 text-xs shadow-sm mb-6">
      <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
      <div>
        <span className="font-bold uppercase tracking-wider text-[10px] text-amber-700 block mb-0.5">Clinical Safety & Responsible AI Guarantee</span>
        <p className="leading-relaxed">
          <strong>MedLens</strong> organizes and summarizes available medical information. It does <strong>NOT</strong> provide a diagnosis, prescribe medications, or recommend dosage changes. Reference ranges are evaluated deterministically from source reports. Please consult a qualified healthcare professional for medical decisions.
        </p>
      </div>
    </div>
  );
};
