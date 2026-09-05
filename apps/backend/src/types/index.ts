export type SourceType = 'USER_PROVIDED' | 'DOCUMENT_EXTRACTED' | 'AI_GENERATED' | 'USER_VERIFIED';

export type Confidence = 'HIGH' | 'MEDIUM' | 'LOW';

export type RefRangeStatus = 'NORMAL' | 'LOW' | 'HIGH' | 'CRITICAL_LOW' | 'CRITICAL_HIGH' | 'NOT_DETERMINED';

export interface ReferenceRange {
  low?: number;
  high?: number;
  text?: string;
  unit?: string;
  source: 'document' | 'none';
}

export interface Provenance {
  sourceType: SourceType;
  sourceDocumentId?: string;
  sourceDocumentName?: string;
  page?: number;
  confidence: Confidence;
  confidenceScore?: number; // 0.0 - 1.0
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  notes?: string;
}

export interface Patient {
  id: string;
  patientId: string; // e.g. PAT-9042
  name: string;
  age: number;
  sex: 'Male' | 'Female' | 'Other';
  symptoms: string[];
  existingConditions: string[];
  allergies: string[];
  currentMedications: string[];
  additionalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalReport {
  id: string;
  patientId: string;
  title: string;
  filename: string;
  fileUrl: string;
  fileType: 'pdf' | 'png' | 'jpg' | 'jpeg';
  reportType: string; // e.g. "Complete Blood Count", "Lipid Profile", "Comprehensive Metabolic Panel"
  reportDate?: string; // YYYY-MM-DD
  uploadDate: string;
  pageCount: number;
  status: 'PENDING' | 'EXTRACTED' | 'VERIFIED' | 'FAILED';
  extractedData?: ExtractedReportPayload;
  rawText?: string;
}

export interface LabResult {
  id: string;
  patientId: string;
  reportId: string;
  testName: string;
  value: number | string;
  numericValue?: number;
  unit?: string;
  referenceRange: ReferenceRange;
  status: RefRangeStatus;
  statusExplanation: string;
  provenance: Provenance;
  reportDate?: string;
  category?: string; // e.g. "Hematology", "Lipids", "Renal"
  createdAt: string;
}

export interface MedicationRecord {
  id: string;
  patientId: string;
  reportId?: string;
  name: string;
  dosage?: string;
  frequency?: string;
  startDate?: string;
  endDate?: string;
  provenance: Provenance;
}

export interface ConditionRecord {
  id: string;
  patientId: string;
  reportId?: string;
  name: string;
  diagnosedDate?: string;
  provenance: Provenance;
}

export interface AllergyRecord {
  id: string;
  patientId: string;
  reportId?: string;
  allergen: string;
  reaction?: string;
  provenance: Provenance;
}

export interface ExtractedReportPayload {
  reportMetadata: {
    reportType: string;
    reportDate: string | null;
    facilityName?: string;
    orderingPhysician?: string;
  };
  labResults: Array<{
    testName: string;
    value: number | string;
    numericValue?: number;
    unit?: string;
    referenceRangeText?: string;
    rangeLow?: number;
    rangeHigh?: number;
    page: number;
    confidence: Confidence;
    observationText?: string;
  }>;
  medications: Array<{
    name: string;
    dosage?: string;
    frequency?: string;
    page: number;
    confidence: Confidence;
  }>;
  conditions: Array<{
    name: string;
    diagnosedDate?: string;
    page: number;
    confidence: Confidence;
  }>;
  allergies: Array<{
    allergen: string;
    reaction?: string;
    page: number;
    confidence: Confidence;
  }>;
  observations: string[];
  uncertainties: string[];
}

export interface Conflict {
  id: string;
  patientId: string;
  title: string;
  description: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  category: 'MEDICATION_MISMATCH' | 'LAB_DISCREPANCY' | 'MISSING_DATE' | 'CONDITION_INCONSISTENCY';
  detectedAt: string;
  resolved: boolean;
  resolutionNote?: string;
  sourceItems: Array<{
    type: string;
    id: string;
    label: string;
    value: string;
  }>;
}

export interface ClarificationQuestion {
  id: string;
  patientId: string;
  reportId?: string;
  question: string;
  context: string;
  targetField: string;
  suggestedAction: string;
  answered: boolean;
  answer?: string;
}

export interface AISummary {
  id: string;
  patientId: string;
  summaryText: string;
  keyObservations: string[];
  notedUncertainties: string[];
  unavailableReferenceRanges: string[];
  generatedAt: string;
  disclaimer: string;
}

export interface AuditLog {
  id: string;
  patientId: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: 'UPLOAD_REPORT' | 'AI_EXTRACTION' | 'VERIFY_FIELD' | 'EDIT_FIELD' | 'REJECT_FIELD' | 'RESOLVE_CONFLICT' | 'GENERATE_SUMMARY';
  targetObject: string;
  targetId: string;
  previousValue?: any;
  newValue?: any;
  reason?: string;
}
