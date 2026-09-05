import React from 'react';
import { GitCompare, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

interface Props {
  comparisonData: {
    previousReport: { id: string; title: string; date: string };
    currentReport: { id: string; title: string; date: string };
    comparisonRows: Array<{
      testName: string;
      previous: any;
      current: any;
      numericalDifference: string;
      unit: string;
    }>;
  };
}

export const ReportComparator: React.FC<Props> = ({ comparisonData }) => {
  const { previousReport, currentReport, comparisonRows } = comparisonData;

  return (
    <div className="bg-white border border-clinical-border rounded-xl shadow-sm overflow-hidden">
      
      {/* Comparator Header */}
      <div className="bg-slate-50 border-b border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-teal-600" />
            Longitudinal Report Comparison
          </h3>
          <p className="text-xs text-clinical-muted">Traceable comparison between two historic patient medical reports</p>
        </div>

        {/* Responsible AI Disclaimer Banner */}
        <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs px-3 py-2 rounded-lg max-w-md">
          <span className="font-bold block">Objective Difference Tracker:</span>
          MedLens reports quantitative deltas only. It does <strong>not</strong> make clinical claims regarding patient improvement or deterioration.
        </div>
      </div>

      {/* Comparison Header Meta */}
      <div className="grid grid-cols-2 bg-teal-50/50 border-b border-slate-200 divide-x divide-slate-200 text-xs font-bold text-slate-700">
        <div className="p-3 text-center">
          <span className="text-[10px] uppercase text-teal-700 font-bold block">PREVIOUS REPORT</span>
          <span>{previousReport.title} ({previousReport.date})</span>
        </div>
        <div className="p-3 text-center">
          <span className="text-[10px] uppercase text-teal-700 font-bold block">CURRENT REPORT</span>
          <span>{currentReport.title} ({currentReport.date})</span>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold">
              <th className="p-3.5">TEST PARAMETER</th>
              <th className="p-3.5">PREVIOUS VALUE</th>
              <th className="p-3.5">PREVIOUS RANGE</th>
              <th className="p-3.5">CURRENT VALUE</th>
              <th className="p-3.5">CURRENT RANGE</th>
              <th className="p-3.5 text-center">NUMERICAL DIFFERENCE</th>
              <th className="p-3.5 text-right">STATUS COMPARISON</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {comparisonRows.map((row, idx) => {
              const isDiffPositive = row.numericalDifference.startsWith('+');
              const isDiffNegative = row.numericalDifference.startsWith('-');

              return (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-3.5 font-bold text-slate-900">{row.testName}</td>
                  
                  {/* Previous */}
                  <td className="p-3.5 font-semibold text-slate-800">
                    {row.previous ? `${row.previous.value} ${row.previous.unit || ''}` : <span className="text-slate-400 italic">N/A</span>}
                  </td>
                  <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                    {row.previous?.refRange || '-'}
                  </td>

                  {/* Current */}
                  <td className="p-3.5 font-semibold text-teal-900">
                    {row.current ? `${row.current.value} ${row.current.unit || ''}` : <span className="text-slate-400 italic">N/A</span>}
                  </td>
                  <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                    {row.current?.refRange || '-'}
                  </td>

                  {/* Numerical Difference */}
                  <td className="p-3.5 text-center">
                    <span className={`px-2.5 py-1 rounded font-mono font-bold text-xs inline-block ${
                      isDiffPositive
                        ? 'bg-blue-50 text-blue-800 border border-blue-200'
                        : isDiffNegative
                        ? 'bg-purple-50 text-purple-800 border border-purple-200'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {row.numericalDifference} {row.unit}
                    </span>
                  </td>

                  {/* Status Comparison */}
                  <td className="p-3.5 text-right font-medium">
                    <div className="flex items-center justify-end gap-1.5 text-[11px]">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border">
                        {row.previous?.status || 'N/A'}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      <span className={`px-2 py-0.5 rounded font-bold border ${
                        row.current?.status === 'NORMAL'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}>
                        {row.current?.status || 'N/A'}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
};
