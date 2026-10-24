import { z } from 'zod';
import { ValidationReport } from '@/types';

// Zod schema for Task creation request
export const CreateTaskSchema = z.object({
  name: z.string().min(2, 'Task name is required'),
  prompt: z.string().min(10, 'Please describe the task in natural language (at least 10 chars)'),
  sourceUrl: z.string().url('A valid HTTP/HTTPS source URL is required'),
  destinationType: z.enum(['slack', 'sheets', 'csv', 'webhook', 'postgres']).default('slack'),
  destinationConfig: z.object({
    slackChannel: z.string().optional(),
    sheetName: z.string().optional(),
    webhookUrl: z.string().url().optional(),
    targetTable: z.string().optional(),
  }).optional(),
  expectedSchema: z.record(z.any()).default({}),
  scheduleCron: z.string().optional().nullable(),
  scheduleHuman: z.string().optional().nullable(),
  isWriteAction: z.boolean().default(false),
});

export class DataValidator {
  static validate(
    data: any,
    schema: Record<string, any>,
    historicalBaseline?: Record<string, any>
  ): ValidationReport {
    const checks: Array<{ name: string; passed: boolean; detail: string }> = [];
    const errors: string[] = [];
    const anomalies: string[] = [];
    let score = 100;

    if (!data || typeof data !== 'object') {
      return {
        valid: false,
        score: 0,
        anomalies: [],
        errors: ['Extracted data payload is empty or invalid JSON'],
        checks: [{ name: 'Payload Non-Empty', passed: false, detail: 'Received null or non-object response' }],
      };
    }

    // 1. Check Required Keys from Schema
    const requiredKeys: string[] = schema.required || [];
    const missingKeys = requiredKeys.filter((key) => !(key in data));

    if (missingKeys.length > 0) {
      errors.push(`Missing mandatory fields: ${missingKeys.join(', ')}`);
      checks.push({ name: 'Required Fields', passed: false, detail: `Missing: ${missingKeys.join(', ')}` });
      score -= 35;
    } else {
      checks.push({ name: 'Required Fields', passed: true, detail: 'All expected top-level fields present' });
    }

    // 2. Row Count & Collection Check
    const items = Array.isArray(data.items) ? data.items : (Array.isArray(data) ? data : null);
    if (items) {
      if (items.length === 0) {
        errors.push('Extracted table contains zero records');
        checks.push({ name: 'Row Count Sanity', passed: false, detail: '0 items found' });
        score -= 30;
      } else {
        checks.push({ name: 'Row Count Sanity', passed: true, detail: `${items.length} records verified` });

        // 3. Null Rate Check
        let totalFields = 0;
        let nullFields = 0;
        for (const item of items) {
          if (typeof item === 'object' && item !== null) {
            for (const val of Object.values(item)) {
              totalFields++;
              if (val === null || val === undefined || val === '' || val === 'N/A') {
                nullFields++;
              }
            }
          }
        }

        const nullRate = totalFields > 0 ? nullFields / totalFields : 0;
        if (nullRate > 0.05) {
          anomalies.push(`High null field ratio: ${(nullRate * 100).toFixed(1)}% missing values`);
          checks.push({ name: 'Null Value Threshold', passed: false, detail: `${(nullRate * 100).toFixed(1)}% exceeds 5% limit` });
          score -= 15;
        } else {
          checks.push({ name: 'Null Value Threshold', passed: true, detail: `${(nullRate * 100).toFixed(1)}% nulls (nominal)` });
        }
      }
    }

    // 4. Historical Drift & Anomaly Check
    if (historicalBaseline && typeof data.total_revenue === 'number' && typeof historicalBaseline.total_revenue === 'number') {
      const prev = historicalBaseline.total_revenue;
      const curr = data.total_revenue;
      if (prev > 0) {
        const deltaPct = ((curr - prev) / prev) * 100;
        if (Math.abs(deltaPct) > 25) {
          anomalies.push(`Historical revenue drift: ${deltaPct > 0 ? '+' : ''}${deltaPct.toFixed(1)}% vs baseline run`);
          checks.push({ name: 'Historical Drift Check', passed: true, detail: `Anomaly: ${deltaPct.toFixed(1)}% variance flagged` });
        } else {
          checks.push({ name: 'Historical Drift Check', passed: true, detail: `Revenue delta within expected tolerance (${deltaPct.toFixed(1)}%)` });
        }
      }
    }

    score = Math.max(0, Math.min(100, score));
    const valid = errors.length === 0 && score >= 60;

    return {
      valid,
      score: Math.round(score),
      anomalies,
      errors,
      checks,
    };
  }
}
