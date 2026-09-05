import { ReferenceRange, RefRangeStatus } from '../types';

export interface ReferenceRangeResult {
  status: RefRangeStatus;
  explanation: string;
  low?: number;
  high?: number;
}

/**
 * Deterministically evaluates a lab result against the reference range PROVIDED BY THE SOURCE REPORT.
 * Under NO CIRCUMSTANCES will this function invent external reference ranges or guess missing bounds.
 */
export function evaluateReferenceRange(
  numericValue: number | undefined | null,
  rangeText: string | undefined | null,
  providedLow?: number,
  providedHigh?: number
): ReferenceRangeResult {
  // Case 1: Numeric value is not present or non-numeric
  if (numericValue === undefined || numericValue === null || isNaN(numericValue)) {
    return {
      status: 'NOT_DETERMINED',
      explanation: 'Result value is non-numeric or missing quantitative evaluation.'
    };
  }

  // Parse low / high from provided numeric bounds or parse from string e.g., "12 - 15", "< 200", "> 60", "13.5-17.5"
  let low = providedLow;
  let high = providedHigh;

  if ((low === undefined || high === undefined) && rangeText) {
    const parsed = parseRangeText(rangeText);
    if (low === undefined) low = parsed.low;
    if (high === undefined) high = parsed.high;
  }

  // Case 2: Reference range missing or empty
  if (low === undefined && high === undefined) {
    return {
      status: 'NOT_DETERMINED',
      explanation: 'Reference range was not provided in the source report.'
    };
  }

  // Case 3: Range is bounded on both ends (low and high)
  if (low !== undefined && high !== undefined) {
    if (numericValue < low) {
      const isCritical = numericValue < low * 0.7;
      return {
        status: isCritical ? 'CRITICAL_LOW' : 'LOW',
        explanation: `Result ${numericValue} is below the documented report reference range (${low}–${high}).`,
        low,
        high
      };
    } else if (numericValue > high) {
      const isCritical = numericValue > high * 1.3;
      return {
        status: isCritical ? 'CRITICAL_HIGH' : 'HIGH',
        explanation: `Result ${numericValue} is above the documented report reference range (${low}–${high}).`,
        low,
        high
      };
    } else {
      return {
        status: 'NORMAL',
        explanation: `Result ${numericValue} is within the documented report reference range (${low}–${high}).`,
        low,
        high
      };
    }
  }

  // Case 4: Upper bound only (e.g. "< 200")
  if (high !== undefined && low === undefined) {
    if (numericValue > high) {
      return {
        status: 'HIGH',
        explanation: `Result ${numericValue} exceeds the documented maximum limit (< ${high}).`,
        high
      };
    } else {
      return {
        status: 'NORMAL',
        explanation: `Result ${numericValue} satisfies the documented limit (< ${high}).`,
        high
      };
    }
  }

  // Case 5: Lower bound only (e.g. "> 60")
  if (low !== undefined && high === undefined) {
    if (numericValue < low) {
      return {
        status: 'LOW',
        explanation: `Result ${numericValue} is below the documented minimum limit (> ${low}).`,
        low
      };
    } else {
      return {
        status: 'NORMAL',
        explanation: `Result ${numericValue} satisfies the documented limit (> ${low}).`,
        low
      };
    }
  }

  return {
    status: 'NOT_DETERMINED',
    explanation: 'Reference range format could not be deterministically evaluated.'
  };
}

/**
 * Regex parser for reference range strings from lab reports
 * Handles formats: "12-15", "12.0 - 15.5", "< 200", "<200", "> 60", "12 to 18"
 */
function parseRangeText(text: string): { low?: number; high?: number } {
  const clean = text.trim().toLowerCase();

  // Pattern: "< 200" or "<= 200" or "less than 200"
  const lessThanMatch = clean.match(/^(?:<|<=|less than)\s*([\d.]+)/);
  if (lessThanMatch) {
    return { high: parseFloat(lessThanMatch[1]) };
  }

  // Pattern: "> 60" or ">= 60" or "greater than 60"
  const greaterThanMatch = clean.match(/^(?:>|>=|greater than)\s*([\d.]+)/);
  if (greaterThanMatch) {
    return { low: parseFloat(greaterThanMatch[1]) };
  }

  // Pattern: "12 - 15" or "12.5-17.0" or "12 to 15"
  const rangeMatch = clean.match(/([\d.]+)\s*(?:-|to|\u2013|\u2014)\s*([\d.]+)/);
  if (rangeMatch) {
    return {
      low: parseFloat(rangeMatch[1]),
      high: parseFloat(rangeMatch[2])
    };
  }

  return {};
}
