import { Conflict, ClarificationQuestion, Patient, MedicalReport, LabResult, MedicationRecord } from '../types';
import { v4 as uuidv4 } from 'uuid';

export interface ConflictAnalysisResult {
  conflicts: Conflict[];
  clarificationQuestions: ClarificationQuestion[];
}

export function detectConflictsAndClarifications(
  patient: Patient,
  reports: MedicalReport[],
  labResults: LabResult[],
  medications: MedicationRecord[]
): ConflictAnalysisResult {
  const conflicts: Conflict[] = [];
  const clarificationQuestions: ClarificationQuestion[] = [];

  // 1. Medication Mismatch between Patient Intake vs Report Extracted Medications
  const intakeMeds = (patient.currentMedications || []).map(m => m.trim().toLowerCase());
  const reportMeds = medications.map(m => m.name.trim().toLowerCase());

  intakeMeds.forEach(intakeMed => {
    if (intakeMed && !reportMeds.some(rm => rm.includes(intakeMed) || intakeMed.includes(rm))) {
      conflicts.push({
        id: uuidv4(),
        patientId: patient.id,
        title: `Medication Intake Discrepancy: ${intakeMed.toUpperCase()}`,
        description: `Patient intake records list "${intakeMed}", but uploaded reports do not mention active prescriptions for this medication.`,
        severity: 'MEDIUM',
        category: 'MEDICATION_MISMATCH',
        detectedAt: new Date().toISOString(),
        resolved: false,
        sourceItems: [
          { type: 'PATIENT_PROFILE', id: patient.id, label: 'Patient Intake', value: intakeMed },
          { type: 'REPORT_COLLECTION', id: 'all_reports', label: 'Extracted Reports', value: 'Not found in extracted report list' }
        ]
      });
    }
  });

  // 2. Duplicate Lab Results on Same Report Date with Differing Values
  const labMapByNameAndDate = new Map<string, LabResult[]>();
  labResults.forEach(lab => {
    const key = `${lab.testName.toLowerCase()}_${lab.reportDate || 'undated'}`;
    if (!labMapByNameAndDate.has(key)) {
      labMapByNameAndDate.set(key, []);
    }
    labMapByNameAndDate.get(key)!.push(lab);
  });

  labMapByNameAndDate.forEach((results, key) => {
    if (results.length > 1) {
      const vals = results.map(r => String(r.value));
      const hasVariation = new Set(vals).size > 1;
      if (hasVariation) {
        conflicts.push({
          id: uuidv4(),
          patientId: patient.id,
          title: `Conflicting Laboratory Values: ${results[0].testName}`,
          description: `Multiple lab records for "${results[0].testName}" on ${results[0].reportDate || 'same document'} report conflicting values: ${vals.join(', ')}.`,
          severity: 'HIGH',
          category: 'LAB_DISCREPANCY',
          detectedAt: new Date().toISOString(),
          resolved: false,
          sourceItems: results.map(r => ({
            type: 'LAB_RESULT',
            id: r.id,
            label: `Report ${r.provenance.sourceDocumentName || r.reportId}`,
            value: `${r.value} ${r.unit || ''}`
          }))
        });
      }
    }
  });

  // 3. Clarification Questions Generation
  reports.forEach(report => {
    if (!report.reportDate) {
      clarificationQuestions.push({
        id: uuidv4(),
        patientId: patient.id,
        reportId: report.id,
        question: `Report "${report.filename}" is missing an explicit report date.`,
        context: `Document "${report.filename}" was uploaded without a detectable clinical date.`,
        targetField: 'reportDate',
        suggestedAction: 'Please enter the official report date from the document header.',
        answered: false
      });
    }
  });

  labResults.forEach(lab => {
    if (!lab.unit) {
      clarificationQuestions.push({
        id: uuidv4(),
        patientId: patient.id,
        reportId: lab.reportId,
        question: `Unit of measurement missing for "${lab.testName}".`,
        context: `Test result "${lab.testName}" has value "${lab.value}" but no unit was specified.`,
        targetField: `labResults.${lab.id}.unit`,
        suggestedAction: 'Verify unit on source document (e.g. g/dL, mg/dL, mmol/L).',
        answered: false
      });
    }

    if (lab.status === 'NOT_DETERMINED' && (!lab.referenceRange || lab.referenceRange.source === 'none')) {
      clarificationQuestions.push({
        id: uuidv4(),
        patientId: patient.id,
        reportId: lab.reportId,
        question: `No reference range was documented for "${lab.testName}".`,
        context: `The source report did not contain reference range thresholds for "${lab.testName}".`,
        targetField: `labResults.${lab.id}.referenceRange`,
        suggestedAction: 'Check source document to confirm if reference range was printed or omitted.',
        answered: false
      });
    }
  });

  return { conflicts, clarificationQuestions };
}
