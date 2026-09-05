import React from 'react';
import { AuditLog } from '../types';
import { History, UserCheck, Edit3, Upload, AlertCircle, FileText } from 'lucide-react';

interface Props {
  logs: AuditLog[];
}

export const AuditLogTable: React.FC<Props> = ({ logs }) => {
  if (logs.length === 0) {
    return (
      <div className="bg-white border border-clinical-border rounded-xl p-8 text-center">
        <History className="w-10 h-10 text-slate-300 mx-auto mb-2" />
        <h3 className="font-bold text-slate-700">No Audit Events Logged</h3>
        <p className="text-xs text-slate-500">Every upload, extraction, and human edit will be tracked here with full provenance.</p>
      </div>
    );
  }

  const getActionBadge = (action: AuditLog['action']) => {
    switch (action) {
      case 'VERIFY_FIELD':
        return (
          <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1">
            <UserCheck className="w-3 h-3" /> VERIFIED FIELD
          </span>
        );
      case 'EDIT_FIELD':
        return (
          <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-300 inline-flex items-center gap-1">
            <Edit3 className="w-3 h-3" /> EDITED FIELD
          </span>
        );
      case 'UPLOAD_REPORT':
        return (
          <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-teal-100 text-teal-800 border border-teal-300 inline-flex items-center gap-1">
            <Upload className="w-3 h-3" /> UPLOADED REPORT
          </span>
        );
      case 'RESOLVE_CONFLICT':
        return (
          <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300 inline-flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> RESOLVED CONFLICT
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-300 inline-flex items-center gap-1">
            <FileText className="w-3 h-3" /> {action}
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-clinical-border rounded-xl shadow-sm overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-teal-600" />
            Audit History & Traceability Log ({logs.length} Events)
          </h3>
          <p className="text-xs text-clinical-muted">Immutable log of user verifications, field edits, and AI extractions</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold">
              <th className="p-3.5">TIMESTAMP</th>
              <th className="p-3.5">USER / CLINICIAN</th>
              <th className="p-3.5">ACTION</th>
              <th className="p-3.5">TARGET OBJECT</th>
              <th className="p-3.5">CLINICAL REASON / DETAILS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50">
                <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="p-3.5 font-bold text-slate-900">
                  {log.userName}
                  <span className="block text-[10px] text-slate-400 font-mono">{log.userId}</span>
                </td>
                <td className="p-3.5">{getActionBadge(log.action)}</td>
                <td className="p-3.5 font-semibold text-slate-800">{log.targetObject}</td>
                <td className="p-3.5 text-slate-700 max-w-xs">
                  <span>{log.reason || 'No explicit reason specified'}</span>
                  {log.newValue && (
                    <div className="mt-1 font-mono text-[10px] bg-slate-100 p-1 rounded text-slate-600 truncate">
                      New: {typeof log.newValue === 'object' ? JSON.stringify(log.newValue) : String(log.newValue)}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
