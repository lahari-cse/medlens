import React, { useState } from 'react';
import { LabResult } from '../types';
import { X, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface Props {
  lab: LabResult | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: {
    value: string | number;
    unit?: string;
    referenceRangeText?: string;
    rangeLow?: number;
    rangeHigh?: number;
    reason: string;
    verified: boolean;
  }) => void;
}

export const EditFieldModal: React.FC<Props> = ({ lab, isOpen, onClose, onSave }) => {
  if (!isOpen || !lab) return null;

  const [value, setValue] = useState<string>(String(lab.value));
  const [unit, setUnit] = useState<string>(lab.unit || '');
  const [rangeText, setRangeText] = useState<string>(lab.referenceRange?.text || '');
  const [rangeLow, setRangeLow] = useState<string>(lab.referenceRange?.low !== undefined ? String(lab.referenceRange.low) : '');
  const [rangeHigh, setRangeHigh] = useState<string>(lab.referenceRange?.high !== undefined ? String(lab.referenceRange.high) : '');
  const [reason, setReason] = useState<string>('Verified value against source report');
  const [verify, setVerify] = useState<boolean>(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      value: isNaN(Number(value)) ? value : Number(value),
      unit: unit.trim() || undefined,
      referenceRangeText: rangeText.trim() || undefined,
      rangeLow: rangeLow.trim() !== '' ? Number(rangeLow) : undefined,
      rangeHigh: rangeHigh.trim() !== '' ? Number(rangeHigh) : undefined,
      reason: reason.trim(),
      verified: verify
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-teal-600" />
              Human Review & Edit: {lab.testName}
            </h3>
            <p className="text-xs text-slate-500">Modify extracted values and record clinical audit trail</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-900 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              Once saved and verified by a user, AI re-processing will <strong>never overwrite</strong> this confirmed information.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Result Value *</label>
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Unit of Measurement</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g. g/dL, mg/dL, %"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Source Reference Range Text</label>
            <input
              type="text"
              value={rangeText}
              onChange={(e) => setRangeText(e.target.value)}
              placeholder="e.g. 12.0 - 15.5 g/dL or < 200 mg/dL"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
            />
            <p className="text-[11px] text-slate-400 mt-1">Leave empty if the report omitted a reference range.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-600 mb-1">Parsed Range Low Bound</label>
              <input
                type="number"
                step="any"
                value={rangeLow}
                onChange={(e) => setRangeLow(e.target.value)}
                placeholder="e.g. 12.0"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-600 mb-1">Parsed Range High Bound</label>
              <input
                type="number"
                step="any"
                value={rangeHigh}
                onChange={(e) => setRangeHigh(e.target.value)}
                placeholder="e.g. 15.5"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Clinical Audit Reason *</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              rows={2}
              placeholder="Explain why this field was verified or edited..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-xs"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="verifyCheck"
              checked={verify}
              onChange={(e) => setVerify(e.target.checked)}
              className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
            />
            <label htmlFor="verifyCheck" className="font-semibold text-slate-800">
              Mark status as "USER_VERIFIED" in provenance history
            </label>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-teal-600 text-white font-bold hover:bg-teal-700 transition-colors shadow-sm flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Save & Log Verification
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
