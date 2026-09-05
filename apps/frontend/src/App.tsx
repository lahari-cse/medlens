import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { PatientListPage } from './pages/PatientListPage';
import { PatientProfilePage } from './pages/PatientProfilePage';
import { AddPatientPage } from './pages/AddPatientPage';
import { ReportUploadPage } from './pages/ReportUploadPage';
import { StructuredReportPage } from './pages/StructuredReportPage';
import { LabResultsPage } from './pages/LabResultsPage';
import { TimelinePage } from './pages/TimelinePage';
import { ComparePage } from './pages/ComparePage';
import { ConflictsPage } from './pages/ConflictsPage';
import { SummaryPage } from './pages/SummaryPage';
import { AuditPage } from './pages/AuditPage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/patients" element={<PatientListPage />} />
        <Route path="/patients/new" element={<AddPatientPage />} />
        <Route path="/patients/:id" element={<PatientProfilePage />} />
        <Route path="/patients/:id/reports" element={<PatientProfilePage />} />
        <Route path="/patients/:id/labs" element={<LabResultsPage />} />
        <Route path="/patients/:id/timeline" element={<TimelinePage />} />
        <Route path="/patients/:id/compare" element={<ComparePage />} />
        <Route path="/patients/:id/conflicts" element={<ConflictsPage />} />
        <Route path="/patients/:id/summary" element={<SummaryPage />} />
        <Route path="/patients/:id/audit" element={<AuditPage />} />
        <Route path="/reports/upload" element={<ReportUploadPage />} />
        <Route path="/reports/:id" element={<StructuredReportPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
