import React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { 
  User, 
  FileText, 
  TestTube, 
  Clock, 
  GitCompare, 
  AlertTriangle, 
  Sparkles, 
  History,
  Upload,
  ChevronLeft
} from 'lucide-react';
import { Patient } from '../types';

interface Props {
  patient?: Patient;
}

export const Sidebar: React.FC<Props> = ({ patient }) => {
  const { id } = useParams<{ id: string }>();
  const patientId = id || patient?.id || 'pat_eleanor_vance';

  const navItems = [
    { label: 'Patient Overview', path: `/patients/${patientId}`, icon: User },
    { label: 'Medical Reports', path: `/patients/${patientId}/reports`, icon: FileText },
    { label: 'Upload Report', path: `/reports/upload?patientId=${patientId}`, icon: Upload },
    { label: 'Laboratory Results', path: `/patients/${patientId}/labs`, icon: TestTube },
    { label: 'Medical Timeline', path: `/patients/${patientId}/timeline`, icon: Clock },
    { label: 'Compare Reports', path: `/patients/${patientId}/compare`, icon: GitCompare },
    { label: 'Conflicts & Questions', path: `/patients/${patientId}/conflicts`, icon: AlertTriangle },
    { label: 'Patient AI Summary', path: `/patients/${patientId}/summary`, icon: Sparkles },
    { label: 'Audit History', path: `/patients/${patientId}/audit`, icon: History },
  ];

  return (
    <aside className="w-64 bg-white border-r border-clinical-border shrink-0 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between">
      <div>
        <NavLink
          to="/patients"
          className="flex items-center gap-1.5 text-xs text-clinical-muted hover:text-teal-700 font-medium mb-4 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to All Patients
        </NavLink>

        {patient && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <h3 className="font-bold text-sm text-slate-900 truncate">{patient.name}</h3>
            </div>
            <p className="text-xs text-slate-500">
              ID: {patient.patientId} • {patient.age}yo {patient.sex}
            </p>
          </div>
        )}

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === `/patients/${patientId}`}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-teal-50 text-teal-800 border border-teal-200 shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0 text-teal-600" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="mt-8 pt-4 border-t border-slate-100 text-[11px] text-slate-400 space-y-1">
        <p className="font-medium text-slate-500">MedLens Core Integrity</p>
        <p>• Multi-modal document OCR</p>
        <p>• Zero reference range hallucination</p>
        <p>• Human verification gate</p>
      </div>
    </aside>
  );
};
