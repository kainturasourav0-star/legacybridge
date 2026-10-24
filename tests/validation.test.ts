import { describe, it, expect } from 'vitest';
import { DataValidator } from '../src/lib/validation';

describe('DataValidator Service', () => {
  const schema = {
    type: 'object',
    required: ['report_title', 'items', 'total_revenue'],
    properties: {
      report_title: { type: 'string' },
      items: { type: 'array' },
      total_revenue: { type: 'number' },
    },
  };

  it('validates a correct payload against schema invariants', () => {
    const validData = {
      report_title: 'Q3 Sales',
      items: [
        { region: 'North', sku: 'ACM-1', units_sold: 100, revenue: 5000 },
        { region: 'South', sku: 'ACM-2', units_sold: 200, revenue: 10000 },
      ],
      total_revenue: 15000,
    };
    const report = DataValidator.validate(validData, schema);
    expect(report.valid).toBe(true);
    expect(report.score).toBeGreaterThanOrEqual(90);
    expect(report.errors).toHaveLength(0);
  });

  it('rejects payload missing required schema fields', () => {
    const invalidData = {
      items: [{ region: 'North', revenue: 5000 }],
    };
    const report = DataValidator.validate(invalidData, schema);
    expect(report.valid).toBe(false);
    expect(report.errors.some((e) => e.includes('report_title'))).toBe(true);
  });

  it('flags high null-value percentages as anomalies', () => {
    const sparseData = {
      report_title: 'Q3 Sales',
      total_revenue: 1000,
      items: [
        { region: null, sku: '', units_sold: 'N/A', revenue: null },
        { region: 'North', sku: 'ACM-1', units_sold: 10, revenue: 500 },
      ],
    };
    const report = DataValidator.validate(sparseData, schema);
    expect(report.anomalies.some((a) => a.includes('null field ratio'))).toBe(true);
  });

  it('flags large historical drift compared to previous baseline', () => {
    const baseline = { total_revenue: 10000 };
    const current = {
      report_title: 'Q3 Sales',
      total_revenue: 25000, // +150% change
      items: [{ region: 'North', units_sold: 50, revenue: 25000 }],
    };
    const report = DataValidator.validate(current, schema, baseline);
    expect(report.anomalies.some((a) => a.includes('drift'))).toBe(true);
  });
});
