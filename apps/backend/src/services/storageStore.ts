import { Patient, MedicalReport, LabResult, MedicationRecord, ConditionRecord, AllergyRecord, Conflict, ClarificationQuestion, AISummary } from '../types';
import { evaluateReferenceRange } from './referenceRangeEngine';
import { auditService } from './auditService';
import { detectConflictsAndClarifications } from './conflictEngine';

class StorageStore {
  private patients: Map<string, Patient> = new Map();
  private reports: Map<string, MedicalReport> = new Map();
  private labResults: Map<string, LabResult> = new Map();
  private medications: Map<string, MedicationRecord> = new Map();
  private conditions: Map<string, ConditionRecord> = new Map();
  private allergies: Map<string, AllergyRecord> = new Map();
  private conflicts: Map<string, Conflict> = new Map();
  private clarificationQuestions: Map<string, ClarificationQuestion> = new Map();
  private summaries: Map<string, AISummary> = new Map();

  constructor() {
    this.seedDemoData();
  }

  // --- Patient Methods ---
  public getPatients(): Patient[] {
    if (this.patients.size === 0) {
      this.seedDemoData();
    }
    return Array.from(this.patients.values());
  }

  public getPatient(id: string): Patient | undefined {
    return this.patients.get(id);
  }

  public createPatient(patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Patient {
    const id = `pat_${Date.now()}`;
    const patient: Patient = {
      ...patientData,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.patients.set(id, patient);
    auditService.logEvent(id, 'EDIT_FIELD', 'Patient Profile', id, 'usr_admin', 'System Admin', null, patient.name, 'Patient Intake Record Created');
    return patient;
  }

  public updatePatient(id: string, updates: Partial<Patient>): Patient | undefined {
    const existing = this.patients.get(id);
    if (!existing) return undefined;
    const updated: Patient = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.patients.set(id, updated);
    auditService.logEvent(id, 'EDIT_FIELD', 'Patient Profile', id, 'usr_admin', 'Clinician', existing, updated, 'Updated Patient Metadata');
    return updated;
  }

  // --- Report Methods ---
  public getReports(patientId?: string): MedicalReport[] {
    const list = Array.from(this.reports.values());
    return patientId ? list.filter(r => r.patientId === patientId) : list;
  }

  public getReport(id: string): MedicalReport | undefined {
    return this.reports.get(id);
  }

  public addReport(report: MedicalReport): MedicalReport {
    this.reports.set(report.id, report);
    auditService.logEvent(report.patientId, 'UPLOAD_REPORT', 'Medical Report', report.id, 'usr_admin', 'Clinician', null, report.filename, `Uploaded ${report.title}`);
    return report;
  }

  // --- Lab Results ---
  public getLabResults(patientId?: string): LabResult[] {
    const list = Array.from(this.labResults.values());
    return patientId ? list.filter(l => l.patientId === patientId) : list;
  }

  public getLabResult(id: string): LabResult | undefined {
    return this.labResults.get(id);
  }

  public addLabResult(lab: LabResult): LabResult {
    this.labResults.set(lab.id, lab);
    return lab;
  }

  public updateLabResult(id: string, updates: Partial<LabResult>, userId: string, userName: string, reason?: string): LabResult | undefined {
    const existing = this.labResults.get(id);
    if (!existing) return undefined;

    const previousValue = { ...existing };
    const updated: LabResult = {
      ...existing,
      ...updates,
      provenance: {
        ...existing.provenance,
        ...(updates.provenance || {}),
        sourceType: updates.provenance?.sourceType || (updates.provenance?.verified ? 'USER_VERIFIED' : existing.provenance.sourceType),
        verified: updates.provenance?.verified !== undefined ? updates.provenance.verified : existing.provenance.verified,
        verifiedBy: updates.provenance?.verified ? userName : existing.provenance.verifiedBy,
        verifiedAt: updates.provenance?.verified ? new Date().toISOString() : existing.provenance.verifiedAt
      }
    };

    // Re-evaluate reference range deterministically if numeric value changed
    if (updates.value !== undefined || updates.referenceRange !== undefined) {
      const numVal = typeof updated.value === 'number' ? updated.value : parseFloat(String(updated.value));
      const rangeResult = evaluateReferenceRange(
        numVal,
        updated.referenceRange.text,
        updated.referenceRange.low,
        updated.referenceRange.high
      );
      updated.status = rangeResult.status;
      updated.statusExplanation = rangeResult.explanation;
    }

    this.labResults.set(id, updated);

    const action = updates.provenance?.verified ? 'VERIFY_FIELD' : 'EDIT_FIELD';
    auditService.logEvent(
      existing.patientId,
      action,
      `Lab Result: ${existing.testName}`,
      id,
      userId,
      userName,
      previousValue,
      updated,
      reason || 'Clinical manual verification/edit'
    );

    return updated;
  }

  // --- Medications, Conditions, Allergies ---
  public getMedications(patientId: string): MedicationRecord[] {
    return Array.from(this.medications.values()).filter(m => m.patientId === patientId);
  }

  public getConditions(patientId: string): ConditionRecord[] {
    return Array.from(this.conditions.values()).filter(c => c.patientId === patientId);
  }

  public getAllergies(patientId: string): AllergyRecord[] {
    return Array.from(this.allergies.values()).filter(a => a.patientId === patientId);
  }

  // --- Conflicts & Clarifications ---
  public getConflicts(patientId: string): Conflict[] {
    const patient = this.getPatient(patientId);
    if (!patient) return [];

    const reports = this.getReports(patientId);
    const labs = this.getLabResults(patientId);
    const meds = this.getMedications(patientId);

    const analysis = detectConflictsAndClarifications(patient, reports, labs, meds);

    // Merge manually saved conflict updates
    analysis.conflicts.forEach(c => {
      if (!this.conflicts.has(c.id)) {
        this.conflicts.set(c.id, c);
      }
    });

    return Array.from(this.conflicts.values()).filter(c => c.patientId === patientId);
  }

  public getClarificationQuestions(patientId: string): ClarificationQuestion[] {
    const patient = this.getPatient(patientId);
    if (!patient) return [];

    const reports = this.getReports(patientId);
    const labs = this.getLabResults(patientId);
    const meds = this.getMedications(patientId);

    const analysis = detectConflictsAndClarifications(patient, reports, labs, meds);
    return analysis.clarificationQuestions;
  }

  public resolveConflict(conflictId: string, resolutionNote: string, userId: string, userName: string): Conflict | undefined {
    const conflict = this.conflicts.get(conflictId);
    if (!conflict) return undefined;

    conflict.resolved = true;
    conflict.resolutionNote = resolutionNote;
    this.conflicts.set(conflictId, conflict);

    auditService.logEvent(
      conflict.patientId,
      'RESOLVE_CONFLICT',
      `Conflict: ${conflict.title}`,
      conflictId,
      userId,
      userName,
      { resolved: false },
      { resolved: true, resolutionNote },
      resolutionNote
    );

    return conflict;
  }

  // --- Summaries ---
  public getSummary(patientId: string): AISummary | undefined {
    return this.summaries.get(patientId);
  }

  public saveSummary(summary: AISummary): AISummary {
    this.summaries.set(summary.patientId, summary);
    auditService.logEvent(
      summary.patientId,
      'GENERATE_SUMMARY',
      'Patient AI Summary',
      summary.id,
      'usr_ai_engine',
      'MedLens Responsible AI Summary Generator',
      null,
      summary.summaryText.substring(0, 100) + '...',
      'Generated clinical information summary'
    );
    return summary;
  }

  // --- Demo Synthetic Data Seeding ---
  public seedDemoData() {
    this.patients.clear();
    this.reports.clear();
    this.labResults.clear();
    this.medications.clear();
    this.conditions.clear();
    this.allergies.clear();
    this.conflicts.clear();
    this.clarificationQuestions.clear();
    this.summaries.clear();

    // Patient 1: Eleanor Vance (Longitudinal Multi-report Patient)
    const pat1: Patient = {
      id: 'pat_eleanor_vance',
      patientId: 'PAT-8812',
      name: 'Eleanor Vance',
      age: 58,
      sex: 'Female',
      symptoms: ['Fatigue', 'Mild shortness of breath on exertion'],
      existingConditions: ['Type 2 Diabetes Mellitus', 'Essential Hypertension'],
      allergies: ['Penicillin', 'Sulfa Drugs'],
      currentMedications: ['Metformin 500mg', 'Lisinopril 10mg'],
      additionalNotes: 'Patient routinely visits for semi-annual metabolic panel monitoring.',
      createdAt: '2026-07-01T10:00:00Z',
      updatedAt: '2026-09-01T14:30:00Z'
    };
    this.patients.set(pat1.id, pat1);

    // Patient 2: Arthur Pendelton (Longitudinal Compare Patient with CBC & Lipid history)
    const pat2: Patient = {
      id: 'pat_arthur_pendelton',
      patientId: 'PAT-4419',
      name: 'Arthur Pendelton',
      age: 64,
      sex: 'Male',
      symptoms: ['Occasional dizziness', 'Chest tightness after stair climbing'],
      existingConditions: ['Hyperlipidemia', 'Coronary Artery Disease'],
      allergies: ['Latex'],
      currentMedications: ['Atorvastatin 40mg', 'Aspirin 81mg'],
      additionalNotes: 'Monitoring lipid response after lifestyle modification.',
      createdAt: '2026-06-15T09:00:00Z',
      updatedAt: '2026-09-02T11:00:00Z'
    };
    this.patients.set(pat2.id, pat2);

    // Patient 3: Maya Lin (Conflicting Medication & Missing Reference Range Patient)
    const pat3: Patient = {
      id: 'pat_maya_lin',
      patientId: 'PAT-2093',
      name: 'Maya Lin',
      age: 42,
      sex: 'Female',
      symptoms: ['Unexplained joint aches', 'Cold sensitivity'],
      existingConditions: ['Hypothyroidism'],
      allergies: ['None documented'],
      currentMedications: ['Levothyroxine 75mcg', 'Metformin 1000mg'], // Conflict: Metformin listed in intake but no diabetes diagnosis or report record
      additionalNotes: 'Transferred records from external clinic without full ref ranges.',
      createdAt: '2026-08-10T12:00:00Z',
      updatedAt: '2026-09-03T16:00:00Z'
    };
    this.patients.set(pat3.id, pat3);

    // --- Reports for Eleanor Vance ---
    const r1: MedicalReport = {
      id: 'rep_eleanor_cbc_aug',
      patientId: pat1.id,
      title: 'Complete Blood Count (CBC) with Differential',
      filename: 'eleanor_cbc_aug2026.pdf',
      fileUrl: '/demo_docs/eleanor_cbc_aug2026.pdf',
      fileType: 'pdf',
      reportType: 'Hematology',
      reportDate: '2026-08-01',
      uploadDate: '2026-08-02T08:30:00Z',
      pageCount: 2,
      status: 'EXTRACTED'
    };
    const r2: MedicalReport = {
      id: 'rep_eleanor_cmp_sep',
      patientId: pat1.id,
      title: 'Comprehensive Metabolic Panel & HbA1c',
      filename: 'eleanor_cmp_sep2026.pdf',
      fileUrl: '/demo_docs/eleanor_cmp_sep2026.pdf',
      fileType: 'pdf',
      reportType: 'Clinical Chemistry',
      reportDate: '2026-09-01',
      uploadDate: '2026-09-01T15:00:00Z',
      pageCount: 2,
      status: 'VERIFIED'
    };
    this.reports.set(r1.id, r1);
    this.reports.set(r2.id, r2);

    // --- Lab Results for Eleanor Vance ---
    const labs1: LabResult[] = [
      {
        id: 'lab_101',
        patientId: pat1.id,
        reportId: r1.id,
        testName: 'Hemoglobin',
        value: 10.2,
        numericValue: 10.2,
        unit: 'g/dL',
        referenceRange: { low: 12.0, high: 15.5, source: 'document', text: '12.0 - 15.5 g/dL' },
        status: 'LOW',
        statusExplanation: 'Result 10.2 is below the documented report reference range (12.0–15.5).',
        provenance: {
          sourceType: 'DOCUMENT_EXTRACTED',
          sourceDocumentId: r1.id,
          sourceDocumentName: r1.filename,
          page: 1,
          confidence: 'HIGH',
          confidenceScore: 0.98,
          verified: false
        },
        reportDate: '2026-08-01',
        category: 'Hematology',
        createdAt: '2026-08-02T08:35:00Z'
      },
      {
        id: 'lab_102',
        patientId: pat1.id,
        reportId: r1.id,
        testName: 'White Blood Cell (WBC)',
        value: 6.8,
        numericValue: 6.8,
        unit: '10^3/uL',
        referenceRange: { low: 4.5, high: 11.0, source: 'document', text: '4.5 - 11.0 10^3/uL' },
        status: 'NORMAL',
        statusExplanation: 'Result 6.8 is within the documented report reference range (4.5–11.0).',
        provenance: {
          sourceType: 'USER_VERIFIED',
          sourceDocumentId: r1.id,
          sourceDocumentName: r1.filename,
          page: 1,
          confidence: 'HIGH',
          verified: true,
          verifiedBy: 'Dr. Alex Rivera',
          verifiedAt: '2026-08-02T09:00:00Z'
        },
        reportDate: '2026-08-01',
        category: 'Hematology',
        createdAt: '2026-08-02T08:35:00Z'
      },
      {
        id: 'lab_103',
        patientId: pat1.id,
        reportId: r2.id,
        testName: 'Hemoglobin A1c (HbA1c)',
        value: 7.4,
        numericValue: 7.4,
        unit: '%',
        referenceRange: { high: 5.7, source: 'document', text: '< 5.7 %' },
        status: 'HIGH',
        statusExplanation: 'Result 7.4 exceeds the documented maximum limit (< 5.7).',
        provenance: {
          sourceType: 'DOCUMENT_EXTRACTED',
          sourceDocumentId: r2.id,
          sourceDocumentName: r2.filename,
          page: 2,
          confidence: 'HIGH',
          verified: false
        },
        reportDate: '2026-09-01',
        category: 'Clinical Chemistry',
        createdAt: '2026-09-01T15:10:00Z'
      },
      {
        id: 'lab_104',
        patientId: pat1.id,
        reportId: r2.id,
        testName: 'Fasting Plasma Glucose',
        value: 142,
        numericValue: 142,
        unit: 'mg/dL',
        referenceRange: { low: 70, high: 99, source: 'document', text: '70 - 99 mg/dL' },
        status: 'HIGH',
        statusExplanation: 'Result 142 is above the documented report reference range (70–99).',
        provenance: {
          sourceType: 'DOCUMENT_EXTRACTED',
          sourceDocumentId: r2.id,
          sourceDocumentName: r2.filename,
          page: 2,
          confidence: 'MEDIUM',
          verified: false
        },
        reportDate: '2026-09-01',
        category: 'Clinical Chemistry',
        createdAt: '2026-09-01T15:10:00Z'
      }
    ];

    labs1.forEach(l => this.labResults.set(l.id, l));

    // --- Reports & Labs for Arthur Pendelton (Longitudinal Lipid Comparison) ---
    const r3: MedicalReport = {
      id: 'rep_arthur_lipid_june',
      patientId: pat2.id,
      title: 'Lipid Panel - Baseline',
      filename: 'arthur_lipid_june2026.pdf',
      fileUrl: '/demo_docs/arthur_lipid_june2026.pdf',
      fileType: 'pdf',
      reportType: 'Lipids',
      reportDate: '2026-06-15',
      uploadDate: '2026-06-16T10:00:00Z',
      pageCount: 1,
      status: 'VERIFIED'
    };
    const r4: MedicalReport = {
      id: 'rep_arthur_lipid_aug',
      patientId: pat2.id,
      title: 'Lipid Panel - 60-Day Follow-Up',
      filename: 'arthur_lipid_aug2026.pdf',
      fileUrl: '/demo_docs/arthur_lipid_aug2026.pdf',
      fileType: 'pdf',
      reportType: 'Lipids',
      reportDate: '2026-08-25',
      uploadDate: '2026-08-26T14:00:00Z',
      pageCount: 1,
      status: 'VERIFIED'
    };
    this.reports.set(r3.id, r3);
    this.reports.set(r4.id, r4);

    const labs2: LabResult[] = [
      {
        id: 'lab_201',
        patientId: pat2.id,
        reportId: r3.id,
        testName: 'Total Cholesterol',
        value: 235,
        numericValue: 235,
        unit: 'mg/dL',
        referenceRange: { high: 200, source: 'document', text: '< 200 mg/dL' },
        status: 'HIGH',
        statusExplanation: 'Result 235 exceeds limit < 200.',
        provenance: { sourceType: 'DOCUMENT_EXTRACTED', sourceDocumentId: r3.id, sourceDocumentName: r3.filename, page: 1, confidence: 'HIGH', verified: true },
        reportDate: '2026-06-15',
        category: 'Lipids',
        createdAt: '2026-06-16T10:05:00Z'
      },
      {
        id: 'lab_202',
        patientId: pat2.id,
        reportId: r4.id,
        testName: 'Total Cholesterol',
        value: 198,
        numericValue: 198,
        unit: 'mg/dL',
        referenceRange: { high: 200, source: 'document', text: '< 200 mg/dL' },
        status: 'NORMAL',
        statusExplanation: 'Result 198 satisfies limit < 200.',
        provenance: { sourceType: 'DOCUMENT_EXTRACTED', sourceDocumentId: r4.id, sourceDocumentName: r4.filename, page: 1, confidence: 'HIGH', verified: true },
        reportDate: '2026-08-25',
        category: 'Lipids',
        createdAt: '2026-08-26T14:05:00Z'
      },
      {
        id: 'lab_203',
        patientId: pat2.id,
        reportId: r3.id,
        testName: 'LDL Cholesterol',
        value: 154,
        numericValue: 154,
        unit: 'mg/dL',
        referenceRange: { high: 100, source: 'document', text: '< 100 mg/dL' },
        status: 'HIGH',
        statusExplanation: 'Result 154 exceeds limit < 100.',
        provenance: { sourceType: 'DOCUMENT_EXTRACTED', sourceDocumentId: r3.id, sourceDocumentName: r3.filename, page: 1, confidence: 'HIGH', verified: true },
        reportDate: '2026-06-15',
        category: 'Lipids',
        createdAt: '2026-06-16T10:05:00Z'
      },
      {
        id: 'lab_204',
        patientId: pat2.id,
        reportId: r4.id,
        testName: 'LDL Cholesterol',
        value: 118,
        numericValue: 118,
        unit: 'mg/dL',
        referenceRange: { high: 100, source: 'document', text: '< 100 mg/dL' },
        status: 'HIGH',
        statusExplanation: 'Result 118 exceeds limit < 100.',
        provenance: { sourceType: 'DOCUMENT_EXTRACTED', sourceDocumentId: r4.id, sourceDocumentName: r4.filename, page: 1, confidence: 'HIGH', verified: true },
        reportDate: '2026-08-25',
        category: 'Lipids',
        createdAt: '2026-08-26T14:05:00Z'
      }
    ];
    labs2.forEach(l => this.labResults.set(l.id, l));

    // --- Report & Lab for Maya Lin (Missing Reference Range & Low Confidence) ---
    const r5: MedicalReport = {
      id: 'rep_maya_thyroid',
      patientId: pat3.id,
      title: 'Thyroid Function Panel',
      filename: 'maya_thyroid_external.pdf',
      fileUrl: '/demo_docs/maya_thyroid_external.pdf',
      fileType: 'pdf',
      reportType: 'Endocrinology',
      reportDate: '2026-08-10',
      uploadDate: '2026-08-11T16:00:00Z',
      pageCount: 1,
      status: 'EXTRACTED'
    };
    this.reports.set(r5.id, r5);

    const labs3: LabResult[] = [
      {
        id: 'lab_301',
        patientId: pat3.id,
        reportId: r5.id,
        testName: 'TSH (Thyroid Stimulating Hormone)',
        value: 4.85,
        numericValue: 4.85,
        unit: 'mIU/L',
        referenceRange: { source: 'none' }, // Missing ref range in report!
        status: 'NOT_DETERMINED',
        statusExplanation: 'Reference range was not provided in the source report.',
        provenance: {
          sourceType: 'DOCUMENT_EXTRACTED',
          sourceDocumentId: r5.id,
          sourceDocumentName: r5.filename,
          page: 1,
          confidence: 'LOW',
          confidenceScore: 0.62,
          verified: false,
          notes: 'Faint OCR scan line over reference range column.'
        },
        reportDate: '2026-08-10',
        category: 'Endocrinology',
        createdAt: '2026-08-11T16:10:00Z'
      }
    ];
    labs3.forEach(l => this.labResults.set(l.id, l));

    // Seed initial audit log history
    auditService.seedLogs([
      {
        id: 'log_seed_1',
        patientId: pat1.id,
        timestamp: '2026-08-02T08:30:00Z',
        userId: 'usr_admin',
        userName: 'Dr. Alex Rivera',
        action: 'UPLOAD_REPORT',
        targetObject: 'Medical Report',
        targetId: r1.id,
        newValue: 'eleanor_cbc_aug2026.pdf',
        reason: 'Uploaded routine CBC report'
      },
      {
        id: 'log_seed_2',
        patientId: pat1.id,
        timestamp: '2026-08-02T08:35:00Z',
        userId: 'usr_ai_service',
        userName: 'MedLens Gemini Vision AI',
        action: 'AI_EXTRACTION',
        targetObject: 'Lab Results',
        targetId: r1.id,
        newValue: 'Extracted 2 lab results (Hemoglobin, WBC)',
        reason: 'Automated multimodal JSON extraction'
      },
      {
        id: 'log_seed_3',
        patientId: pat1.id,
        timestamp: '2026-08-02T09:00:00Z',
        userId: 'usr_admin',
        userName: 'Dr. Alex Rivera',
        action: 'VERIFY_FIELD',
        targetObject: 'Lab Result: White Blood Cell (WBC)',
        targetId: 'lab_102',
        previousValue: { verified: false },
        newValue: { verified: true },
        reason: 'Confirmed WBC result against document Page 1'
      }
    ]);

    // Initial AI Summary for Eleanor Vance
    this.summaries.set(pat1.id, {
      id: 'sum_eleanor_1',
      patientId: pat1.id,
      summaryText: `Eleanor Vance (58yo F) has 2 medical reports on file spanning August to September 2026.
Documented findings indicate a Hemoglobin level of 10.2 g/dL on August 1, 2026, which is below the source report's reference range (12.0–15.5 g/dL).
Subsequent testing on September 1, 2026 showed a Fasting Glucose of 142 mg/dL (reference range 70–99 mg/dL) and an HbA1c of 7.4% (reference limit < 5.7%).
Patient intake documents current use of Metformin 500mg and Lisinopril 10mg.`,
      keyObservations: [
        'Hemoglobin 10.2 g/dL noted as LOW compared to report reference range (12.0–15.5 g/dL).',
        'HbA1c 7.4% and Fasting Glucose 142 mg/dL noted as HIGH compared to report reference ranges.'
      ],
      notedUncertainties: [],
      unavailableReferenceRanges: [],
      generatedAt: '2026-09-01T15:30:00Z',
      disclaimer: 'MedLens organizes and summarizes available medical information. It does not provide a diagnosis or treatment recommendation. Please consult a qualified healthcare professional for medical decisions.'
    });
  }
}

export const storageStore = new StorageStore();
