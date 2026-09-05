import { ExtractedReportPayload } from '../types';

// ─── OpenRouter Client ────────────────────────────────────────────────────────
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = process.env.OPENROUTER_MODEL || 'google/gemini-flash-1.5';

async function callOpenRouter(systemPrompt: string, userContent: string): Promise<string> {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not set in environment variables.');
  }

  const response = await fetch(OPENROUTER_BASE_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://medlens.vercel.app',
      'X-Title': 'MedLens Clinical Intelligence',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userContent }
      ],
      temperature: 0.1,
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error ${response.status}: ${errorText}`);
  }

  const data = await response.json() as any;
  return data.choices?.[0]?.message?.content?.trim() || '';
}

// ─── Lab Extraction via OpenRouter ───────────────────────────────────────────
const EXTRACTION_SYSTEM_PROMPT = `You are a clinical document analysis engine.
Extract ALL laboratory test results from the provided medical document text.
Return ONLY a valid JSON object — no markdown, no explanation.

JSON schema:
{
  "reportMetadata": {
    "reportType": "string",
    "reportDate": "YYYY-MM-DD",
    "facilityName": "string",
    "orderingPhysician": "string"
  },
  "labResults": [
    {
      "testName": "string",
      "value": number,
      "numericValue": number,
      "unit": "string",
      "referenceRangeText": "string or null",
      "rangeLow": number | null,
      "rangeHigh": number | null,
      "page": 1,
      "confidence": "HIGH" | "MEDIUM" | "LOW"
    }
  ],
  "medications": [
    { "name": "string", "dosage": "string", "frequency": "string", "page": 1, "confidence": "HIGH" }
  ],
  "conditions": [
    { "name": "string", "page": 1, "confidence": "HIGH" }
  ],
  "allergies": ["string"],
  "observations": ["string"],
  "uncertainties": ["string"]
}

Rules:
- Extract every numeric lab value with its unit and reference range
- If reference range uses "<200", set rangeHigh=200, rangeLow=null
- If reference range uses ">40", set rangeLow=40, rangeHigh=null
- If range is "70-99", set rangeLow=70, rangeHigh=99
- Mark confidence HIGH if value and range are clearly readable
- Do NOT invent values. Only extract what is present.`;

function fallbackTextParse(textContent: string, filename: string): ExtractedReportPayload {
  const lines = textContent.split(/\r?\n/);
  const parsedLabs: any[] = [];

  lines.forEach((line) => {
    const match = line.match(/^([A-Za-z0-9\s\(\)\-\+\%\/]+?)\s+([0-9\.]+)\s*([A-Za-z\/\%]*)\s*([<>\d\.\s\-]+)?/);
    if (match && !line.startsWith('=') && !line.startsWith('-') && !line.includes('PATIENT') && !line.includes('TEST NAME')) {
      const testName = match[1].trim();
      const numVal = parseFloat(match[2]);
      const unit = match[3] ? match[3].trim() : '';
      const rangeText = match[4] ? match[4].trim() : '';
      let low: number | undefined;
      let high: number | undefined;

      if (rangeText.includes('-')) {
        const parts = rangeText.split('-').map((p: string) => parseFloat(p.trim()));
        if (!isNaN(parts[0])) low = parts[0];
        if (!isNaN(parts[1])) high = parts[1];
      } else if (rangeText.includes('<')) {
        high = parseFloat(rangeText.replace('<', '').trim());
      } else if (rangeText.includes('>')) {
        low = parseFloat(rangeText.replace('>', '').trim());
      }

      if (testName.length > 2 && !isNaN(numVal)) {
        parsedLabs.push({
          testName,
          value: numVal,
          numericValue: numVal,
          unit,
          referenceRangeText: rangeText || undefined,
          rangeLow: low,
          rangeHigh: high,
          page: 1,
          confidence: 'HIGH'
        });
      }
    }
  });

  return {
    reportMetadata: {
      reportType: filename.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
      reportDate: new Date().toISOString().split('T')[0],
      facilityName: 'Clinical Laboratory',
      orderingPhysician: 'Attending Physician'
    },
    labResults: parsedLabs,
    medications: [],
    conditions: [],
    allergies: [],
    observations: [`Parsed ${parsedLabs.length} quantitative laboratory parameters from document.`],
    uncertainties: parsedLabs.length === 0 ? ['No structured lab values could be extracted from this document.'] : []
  };
}

// ─── Main Extraction Function ─────────────────────────────────────────────────
export async function processDocumentWithAI(
  filename: string,
  fileType: string,
  buffer?: Buffer
): Promise<ExtractedReportPayload> {
  const textContent = buffer ? buffer.toString('utf-8') : '';

  // Try OpenRouter AI extraction first
  if (OPENROUTER_API_KEY && textContent.length > 10) {
    try {
      console.log(`[MedLens AI] Sending document to OpenRouter (${MODEL}) for extraction...`);
      const rawJson = await callOpenRouter(EXTRACTION_SYSTEM_PROMPT, textContent);

      // Strip any accidental markdown code fences
      const cleaned = rawJson.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned) as ExtractedReportPayload;

      console.log(`[MedLens AI] Extracted ${parsed.labResults?.length || 0} lab results via OpenRouter.`);
      return parsed;
    } catch (err: any) {
      console.warn(`[MedLens AI] OpenRouter extraction failed: ${err.message}. Falling back to regex parser.`);
    }
  }

  // Fallback: regex-based text parser (no API key needed)
  return fallbackTextParse(textContent, filename);
}

// ─── Clinical Summary via OpenRouter ─────────────────────────────────────────
const SUMMARY_SYSTEM_PROMPT = `You are a clinical documentation assistant.
Generate a concise, factual clinical case summary based ONLY on the provided patient data.
Do NOT invent diagnoses or values not present in the data.
Return ONLY a valid JSON object with this schema:
{
  "summaryText": "2-3 sentence clinical summary",
  "keyObservations": ["observation 1", "observation 2"],
  "unavailableReferenceRanges": ["test name: reason"]
}`;

export async function generateSafeAISummaryText(
  patientName: string,
  age: number,
  sex: string,
  labResults: any[],
  medications: any[],
  reports: any[]
): Promise<{ summaryText: string; keyObservations: string[]; unavailableReferenceRanges: string[] }> {

  // Try OpenRouter for summary
  if (OPENROUTER_API_KEY) {
    try {
      const abnormal = labResults.filter((l: any) => l.status === 'HIGH' || l.status === 'LOW' || l.status === 'CRITICAL_HIGH' || l.status === 'CRITICAL_LOW');
      const noRange  = labResults.filter((l: any) => l.status === 'NOT_DETERMINED');

      const userContent = JSON.stringify({
        patient: { name: patientName, age, sex },
        totalReports: reports.length,
        totalLabResults: labResults.length,
        abnormalResults: abnormal.map((l: any) => ({ test: l.testName, value: l.value, unit: l.unit, status: l.status })),
        medications: medications.map((m: any) => m.name),
        noReferenceRange: noRange.map((l: any) => l.testName)
      });

      console.log(`[MedLens AI] Generating clinical summary via OpenRouter...`);
      const rawJson = await callOpenRouter(SUMMARY_SYSTEM_PROMPT, userContent);
      const cleaned = rawJson.replace(/```json|```/g, '').trim();
      const result  = JSON.parse(cleaned);

      return {
        summaryText: result.summaryText || '',
        keyObservations: result.keyObservations || [],
        unavailableReferenceRanges: result.unavailableReferenceRanges || []
      };
    } catch (err: any) {
      console.warn(`[MedLens AI] OpenRouter summary failed: ${err.message}. Using deterministic fallback.`);
    }
  }

  // Deterministic fallback (no API)
  const unavailableRanges: string[] = [];
  const observations: string[] = [];

  labResults.forEach((l: any) => {
    if (l.status === 'NOT_DETERMINED') {
      unavailableRanges.push(`${l.testName}: Reference range not provided in source report.`);
    } else if (['LOW', 'CRITICAL_LOW', 'HIGH', 'CRITICAL_HIGH'].includes(l.status)) {
      observations.push(`${l.testName} (${l.value} ${l.unit || ''}) — ${l.status} vs. documented reference range (${l.referenceRange?.text || 'N/A'}).`);
    }
  });

  const summaryText = `${patientName} (${age}yo ${sex}) has ${reports.length} medical report(s) on file. ` +
    `${labResults.length} laboratory parameters extracted. ` +
    (observations.length > 0
      ? `Notable findings: ${observations.slice(0, 3).join(' ')}`
      : 'All extracted lab parameters are within documented reference ranges.');

  return { summaryText, keyObservations: observations, unavailableReferenceRanges: unavailableRanges };
}
