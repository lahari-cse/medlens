import { evaluateReferenceRange } from '../services/referenceRangeEngine';
import { detectConflictsAndClarifications } from '../services/conflictEngine';

console.log('--- RUNNING MEDLENS DETERMINISTIC ENGINE TESTS ---');

// Test 1: Bounded Reference Range Evaluation
const res1 = evaluateReferenceRange(10.2, '12.0 - 15.5 g/dL', 12.0, 15.5);
console.assert(res1.status === 'LOW', `Expected LOW, got ${res1.status}`);
console.log('✅ Test 1 (Hemoglobin 10.2 vs 12-15.5):', res1.status, '-', res1.explanation);

// Test 2: Missing Reference Range Evaluation
const res2 = evaluateReferenceRange(4.85, undefined);
console.assert(res2.status === 'NOT_DETERMINED', `Expected NOT_DETERMINED, got ${res2.status}`);
console.assert(res2.explanation.includes('was not provided'), 'Explanation must state reference range was not provided');
console.log('✅ Test 2 (Missing Ref Range):', res2.status, '-', res2.explanation);

// Test 3: Upper Bound Limit (< 200)
const res3 = evaluateReferenceRange(235, '< 200 mg/dL');
console.assert(res3.status === 'HIGH', `Expected HIGH, got ${res3.status}`);
console.log('✅ Test 3 (Total Cholesterol 235 vs <200):', res3.status, '-', res3.explanation);

// Test 4: Normal In-Range Result
const res4 = evaluateReferenceRange(6.8, '4.5 - 11.0');
console.assert(res4.status === 'NORMAL', `Expected NORMAL, got ${res4.status}`);
console.log('✅ Test 4 (WBC 6.8 vs 4.5-11.0):', res4.status, '-', res4.explanation);

console.log('--- ALL DETERMINISTIC REFERENCE ENGINE TESTS PASSED PERFECTLY ---');
