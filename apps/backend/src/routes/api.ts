import { Router, Request, Response } from 'express';
import multer from 'multer';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { storageStore } from '../services/storageStore';
import { processDocumentWithAI, generateSafeAISummaryText } from '../services/aiService';
import { evaluateReferenceRange } from '../services/referenceRangeEngine';
import { auditService } from '../services/auditService';
import { LabResult, MedicalReport } from '../types';

const router = Router();
const upload = multer({ dest: 'uploads/' });

// --- PATIENTS ---
router.get('/patients', (req: Request, res: Response) => {
  const patients = storageStore.getPatients();
  res.json({ success: true, data: patients });
});

router.get('/patients/:id', (req: Request, res: Response) => {
  const patient = storageStore.getPatient(req.params.id);
  if (!patient) {
    return res.status(404).json({ success: false, error: 'Patient not found' });
  }
  res.json({ success: true, data: patient });
});

router.post('/patients', (req: Request, res: Response) => {
  const { name, age, sex, symptoms, existingConditions, allergies, currentMedications, additionalNotes } = req.body;
  if (!name || !age || !sex) {
    return res.status(400).json({ success: false, error: 'Name, age, and sex are required' });
  }
  const patientIdNum = `PAT-${Math.floor(1000 + Math.random() * 9000)}`;
  const patient = storageStore.createPatient({
    patientId: patientIdNum,
    name,
    age: Number(age),
    sex,
    symptoms: symptoms || [],
    existingConditions: existingConditions || [],
    allergies: allergies || [],
    currentMedications: currentMedications || [],
    additionalNotes: additionalNotes || ''
  });
  res.status(201).json({ success: true, data: patient });
});

router.put('/patients/:id', (req: Request, res: Response) => {
  const updated = storageStore.updatePatient(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Patient not found' });
  }
  res.json({ success: true, data: updated });
});

// --- LAB RESULTS ---
router.get('/patients/:id/lab-results', (req: Request, res: Response) => {
  const labs = storageStore.getLabResults(req.params.id);
  res.json({ success: true, data: labs });
});

router.put('/lab-results/:id', (req: Request, res: Response) => {
  const { value, unit, referenceRangeText, rangeLow, rangeHigh, verified, rejectionNote, reason, userId, userName } = req.body;

  const existing = storageStore.getLabResult(req.params.id);
  if (!existing) {
    return res.status(404).json({ success: false, error: 'Lab result not found' });
  }

  const isVerified = verified !== undefined ? Boolean(verified) : existing.provenance.verified;
  
  const updates: Partial<LabResult> = {};

  if (value !== undefined) {
    updates.value = value;
    updates.numericValue = typeof value === 'number' ? value : parseFloat(String(value));
  }

  if (unit !== undefined) updates.unit = unit;

  if (referenceRangeText !== undefined || rangeLow !== undefined || rangeHigh !== undefined) {
    updates.referenceRange = {
      low: rangeLow !== undefined ? Number(rangeLow) : existing.referenceRange.low,
      high: rangeHigh !== undefined ? Number(rangeHigh) : existing.referenceRange.high,
      text: referenceRangeText !== undefined ? referenceRangeText : existing.referenceRange.text,
      source: 'document'
    };
  }

  updates.provenance = {
    ...existing.provenance,
    verified: isVerified,
    notes: rejectionNote || existing.provenance.notes
  };

  const updated = storageStore.updateLabResult(
    req.params.id,
    updates,
    userId || 'usr_clinician',
    userName || 'Dr. Alex Rivera',
    reason
  );

  res.json({ success: true, data: updated });
});

// --- REPORTS ---
router.get('/patients/:id/reports', (req: Request, res: Response) => {
  const reports = storageStore.getReports(req.params.id);
  res.json({ success: true, data: reports });
});

router.get('/reports/:id', (req: Request, res: Response) => {
  const report = storageStore.getReport(req.params.id);
  if (!report) {
    return res.status(404).json({ success: false, error: 'Report not found' });
  }
  const labs = storageStore.getLabResults(report.patientId).filter(l => l.reportId === report.id);
  res.json({ success: true, data: { report, labs } });
});

router.post('/reports/upload', upload.single('file'), async (req: Request, res: Response) => {
  const { patientId, title } = req.body;
  const file = req.file;

  const docTitle = title || (file ? file.originalname.replace(/\.[^/.]+$/, "").replace(/_/g, ' ') : 'Clinical Diagnostic Report');

  let patient = patientId ? storageStore.getPatient(patientId) : undefined;
  if (!patient) {
    const allPatients = storageStore.getPatients();
    if (allPatients.length > 0) {
      patient = allPatients[0];
    } else {
      patient = storageStore.createPatient({
        patientId: 'PAT-8812',
        name: 'Eleanor Vance',
        age: 68,
        sex: 'Female',
        symptoms: ['Fatigue'],
        existingConditions: ['Type 2 Diabetes'],
        allergies: [],
        currentMedications: []
      });
    }
  }

  const targetPatientId = patient.id;
  const reportId = `rep_${uuidv4().substring(0, 8)}`;
  const filename = file ? file.originalname : `${docTitle.toLowerCase().replace(/\s+/g, '_')}.pdf`;
  const ext = filename.split('.').pop()?.toLowerCase() || 'pdf';

  let fileBuffer: Buffer | undefined;
  if (file && file.path && fs.existsSync(file.path)) {
    try {
      fileBuffer = fs.readFileSync(file.path);
    } catch (e) {
      console.error('Failed to read uploaded file buffer:', e);
    }
  }

  const report: MedicalReport = {
    id: reportId,
    patientId: targetPatientId,
    title: docTitle,
    filename,
    fileUrl: `/uploads/${filename}`,
    fileType: ext as any,
    reportType: docTitle,
    uploadDate: new Date().toISOString(),
    pageCount: 1,
    status: 'PENDING'
  };

  storageStore.addReport(report);

  // Automatically trigger AI extraction
  try {
    const extractedPayload = await processDocumentWithAI(filename, ext, fileBuffer);
    report.status = 'EXTRACTED';
    report.reportDate = extractedPayload.reportMetadata.reportDate || new Date().toISOString().split('T')[0];
    report.reportType = extractedPayload.reportMetadata.reportType || docTitle;
    report.extractedData = extractedPayload;

    // Save extracted lab results into store
    extractedPayload.labResults.forEach((lab, idx) => {
      const numVal = lab.numericValue ?? (typeof lab.value === 'number' ? lab.value : parseFloat(String(lab.value)));
      const rangeResult = evaluateReferenceRange(numVal, lab.referenceRangeText, lab.rangeLow, lab.rangeHigh);

      const labId = `lab_${reportId}_${idx + 1}`;
      const labRecord: LabResult = {
        id: labId,
        patientId,
        reportId: report.id,
        testName: lab.testName,
        value: lab.value,
        numericValue: isNaN(numVal) ? undefined : numVal,
        unit: lab.unit,
        referenceRange: {
          low: lab.rangeLow,
          high: lab.rangeHigh,
          text: lab.referenceRangeText,
          source: lab.referenceRangeText ? 'document' : 'none'
        },
        status: rangeResult.status,
        statusExplanation: rangeResult.explanation,
        provenance: {
          sourceType: 'DOCUMENT_EXTRACTED',
          sourceDocumentId: report.id,
          sourceDocumentName: report.filename,
          page: lab.page || 1,
          confidence: lab.confidence || 'HIGH',
          verified: false
        },
        reportDate: report.reportDate,
        category: report.reportType,
        createdAt: new Date().toISOString()
      };
      storageStore.addLabResult(labRecord);
    });

    res.status(201).json({ success: true, data: { report, extractedCount: extractedPayload.labResults.length } });
  } catch (err: any) {
    report.status = 'FAILED';
    res.status(500).json({ success: false, error: 'AI structured extraction failed: ' + err.message });
  }
});

// --- TIMELINE ---
router.get('/patients/:id/timeline', (req: Request, res: Response) => {
  const patientId = req.params.id;
  const reports = storageStore.getReports(patientId);
  const labs = storageStore.getLabResults(patientId);

  const events = reports.map(r => {
    const reportLabs = labs.filter(l => l.reportId === r.id);
    return {
      id: r.id,
      date: r.reportDate || r.uploadDate.split('T')[0],
      title: `${r.title} uploaded`,
      type: 'REPORT_UPLOAD',
      reportId: r.id,
      reportType: r.reportType,
      filename: r.filename,
      labCount: reportLabs.length,
      provenanceSource: 'DOCUMENT_EXTRACTED',
      details: reportLabs.map(l => `${l.testName}: ${l.value} ${l.unit || ''} (${l.status})`)
    };
  });

  events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  res.json({ success: true, data: events });
});

// --- REPORT COMPARISON ---
router.post('/reports/compare', (req: Request, res: Response) => {
  const { reportId1, reportId2 } = req.body;
  if (!reportId1 || !reportId2) {
    return res.status(400).json({ success: false, error: 'Two report IDs are required' });
  }

  const r1 = storageStore.getReport(reportId1);
  const r2 = storageStore.getReport(reportId2);

  if (!r1 || !r2) {
    return res.status(404).json({ success: false, error: 'One or both reports were not found' });
  }

  const labs1 = storageStore.getLabResults(r1.patientId).filter(l => l.reportId === r1.id);
  const labs2 = storageStore.getLabResults(r2.patientId).filter(l => l.reportId === r2.id);

  // Group tests by testName
  const allTests = Array.from(new Set([...labs1.map(l => l.testName), ...labs2.map(l => l.testName)]));

  const comparisonRows = allTests.map(testName => {
    const item1 = labs1.find(l => l.testName.toLowerCase() === testName.toLowerCase());
    const item2 = labs2.find(l => l.testName.toLowerCase() === testName.toLowerCase());

    const num1 = item1?.numericValue;
    const num2 = item2?.numericValue;
    let diff: number | null = null;
    let diffText = 'N/A';

    if (num1 !== undefined && num2 !== undefined) {
      diff = num2 - num1;
      const formattedDiff = Math.abs(diff) < 1 ? diff.toFixed(2) : diff.toFixed(1);
      diffText = diff > 0 ? `+${formattedDiff}` : `${formattedDiff}`;
    }

    return {
      testName,
      previous: item1 ? {
        reportId: r1.id,
        date: r1.reportDate,
        value: item1.value,
        unit: item1.unit,
        refRange: item1.referenceRange.text || 'N/A',
        status: item1.status
      } : null,
      current: item2 ? {
        reportId: r2.id,
        date: r2.reportDate,
        value: item2.value,
        unit: item2.unit,
        refRange: item2.referenceRange.text || 'N/A',
        status: item2.status
      } : null,
      numericalDifference: diffText,
      unit: item2?.unit || item1?.unit || ''
    };
  });

  res.json({
    success: true,
    data: {
      previousReport: { id: r1.id, title: r1.title, date: r1.reportDate },
      currentReport: { id: r2.id, title: r2.title, date: r2.reportDate },
      comparisonRows
    }
  });
});

// --- CONFLICTS & CLARIFICATIONS ---
router.get('/patients/:id/conflicts', (req: Request, res: Response) => {
  const conflicts = storageStore.getConflicts(req.params.id);
  const clarifications = storageStore.getClarificationQuestions(req.params.id);
  res.json({ success: true, data: { conflicts, clarificationQuestions: clarifications } });
});

router.post('/conflicts/:id/resolve', (req: Request, res: Response) => {
  const { resolutionNote, userId, userName } = req.body;
  const resolved = storageStore.resolveConflict(
    req.params.id,
    resolutionNote || 'Resolved by clinician review',
    userId || 'usr_clinician',
    userName || 'Dr. Alex Rivera'
  );
  if (!resolved) {
    return res.status(404).json({ success: false, error: 'Conflict not found' });
  }
  res.json({ success: true, data: resolved });
});

// --- AI SUMMARY ---
router.get('/patients/:id/summary', (req: Request, res: Response) => {
  const summary = storageStore.getSummary(req.params.id);
  res.json({ success: true, data: summary || null });
});

router.post('/patients/:id/summary', async (req: Request, res: Response) => {
  const patient = storageStore.getPatient(req.params.id);
  if (!patient) {
    return res.status(404).json({ success: false, error: 'Patient not found' });
  }

  const labs = storageStore.getLabResults(patient.id);
  const meds = storageStore.getMedications(patient.id);
  const reports = storageStore.getReports(patient.id);

  const generated = await generateSafeAISummaryText(
    patient.name,
    patient.age,
    patient.sex,
    labs,
    meds,
    reports
  );

  const summary = storageStore.saveSummary({
    id: `sum_${uuidv4().substring(0, 8)}`,
    patientId: patient.id,
    summaryText: generated.summaryText,
    keyObservations: generated.keyObservations,
    notedUncertainties: [],
    unavailableReferenceRanges: generated.unavailableReferenceRanges,
    generatedAt: new Date().toISOString(),
    disclaimer: 'MedLens organizes and summarizes available medical information. It does not provide a diagnosis or treatment recommendation. Please consult a qualified healthcare professional for medical decisions.'
  });

  res.json({ success: true, data: summary });
});

// --- AUDIT LOG ---
router.get('/patients/:id/audit', (req: Request, res: Response) => {
  const logs = auditService.getLogsForPatient(req.params.id);
  res.json({ success: true, data: logs });
});

router.get('/audit', (req: Request, res: Response) => {
  const logs = auditService.getAllLogs();
  res.json({ success: true, data: logs });
});

// --- DEMO RESET / SEED ---
router.post('/demo/seed', (req: Request, res: Response) => {
  storageStore.seedDemoData();
  res.json({ success: true, message: 'Synthetic demo dataset re-seeded successfully.' });
});

export default router;
