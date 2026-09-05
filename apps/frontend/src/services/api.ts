import axios from 'axios';
import { Patient, MedicalReport, LabResult, Conflict, ClarificationQuestion, AISummary, AuditLog, TimelineEvent } from '../types';

const API_BASE = '/api';

export const api = {
  // Patients
  getPatients: async (): Promise<Patient[]> => {
    const res = await axios.get(`${API_BASE}/patients`);
    return res.data.data;
  },

  getPatient: async (id: string): Promise<Patient> => {
    const res = await axios.get(`${API_BASE}/patients/${id}`);
    return res.data.data;
  },

  createPatient: async (patientData: Partial<Patient>): Promise<Patient> => {
    const res = await axios.post(`${API_BASE}/patients`, patientData);
    return res.data.data;
  },

  updatePatient: async (id: string, updates: Partial<Patient>): Promise<Patient> => {
    const res = await axios.put(`${API_BASE}/patients/${id}`, updates);
    return res.data.data;
  },

  // Lab Results
  getLabResults: async (patientId: string): Promise<LabResult[]> => {
    const res = await axios.get(`${API_BASE}/patients/${patientId}/lab-results`);
    return res.data.data;
  },

  updateLabResult: async (id: string, updates: any): Promise<LabResult> => {
    const res = await axios.put(`${API_BASE}/lab-results/${id}`, updates);
    return res.data.data;
  },

  // Reports
  getReports: async (patientId: string): Promise<MedicalReport[]> => {
    const res = await axios.get(`${API_BASE}/patients/${patientId}/reports`);
    return res.data.data;
  },

  getReportDetail: async (reportId: string): Promise<{ report: MedicalReport; labs: LabResult[] }> => {
    const res = await axios.get(`${API_BASE}/reports/${reportId}`);
    return res.data.data;
  },

  uploadReport: async (patientId: string, title: string, file?: File): Promise<{ report: MedicalReport; extractedCount: number }> => {
    const formData = new FormData();
    formData.append('patientId', patientId);
    formData.append('title', title);
    if (file) {
      formData.append('file', file);
    }
    const res = await axios.post(`${API_BASE}/reports/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data.data;
  },

  // Timeline
  getTimeline: async (patientId: string): Promise<TimelineEvent[]> => {
    const res = await axios.get(`${API_BASE}/patients/${patientId}/timeline`);
    return res.data.data;
  },

  // Report Comparison
  compareReports: async (reportId1: string, reportId2: string) => {
    const res = await axios.post(`${API_BASE}/reports/compare`, { reportId1, reportId2 });
    return res.data.data;
  },

  // Conflicts & Clarification
  getConflicts: async (patientId: string): Promise<{ conflicts: Conflict[]; clarificationQuestions: ClarificationQuestion[] }> => {
    const res = await axios.get(`${API_BASE}/patients/${patientId}/conflicts`);
    return res.data.data;
  },

  resolveConflict: async (conflictId: string, resolutionNote: string) => {
    const res = await axios.post(`${API_BASE}/conflicts/${conflictId}/resolve`, { resolutionNote });
    return res.data.data;
  },

  // Summary
  getSummary: async (patientId: string): Promise<AISummary | null> => {
    const res = await axios.get(`${API_BASE}/patients/${patientId}/summary`);
    return res.data.data;
  },

  generateSummary: async (patientId: string): Promise<AISummary> => {
    const res = await axios.post(`${API_BASE}/patients/${patientId}/summary`);
    return res.data.data;
  },

  // Audit
  getAuditLogs: async (patientId?: string): Promise<AuditLog[]> => {
    const url = patientId ? `${API_BASE}/patients/${patientId}/audit` : `${API_BASE}/audit`;
    const res = await axios.get(url);
    return res.data.data;
  },

  // Demo Seed
  resetDemoData: async () => {
    const res = await axios.post(`${API_BASE}/demo/seed`);
    return res.data;
  }
};
