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
  confidenceScore?: number;
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  notes?: string;
}

export interface Patient {
  id: string;
  patientId: string;
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
  reportType: string;
  reportDate?: string;
  uploadDate: string;
  pageCount: number;
  status: 'PENDING' | 'EXTRACTED' | 'VERIFIED' | 'FAILED';
  extractedData?: any;
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
  category?: string;
  createdAt: string;
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

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  type: string;
  reportId: string;
  reportType: string;
  filename: string;
  labCount: number;
  provenanceSource: SourceType;
  details: string[];
}
