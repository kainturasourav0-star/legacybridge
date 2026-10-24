import { describe, it, expect } from 'vitest';
import { BusinessLogicDriftDetector } from '../src/lib/drift/driftDetector';

describe('BusinessLogicDriftDetector (Flagship Capability)', () => {
  const detector = new BusinessLogicDriftDetector();

  it('accurately identifies business logic drift between legacy monolith and modernized microservice', async () => {
    const analysis = await detector.analyzeDrift('proj-acme-monolith-01');

    expect(analysis).toBeDefined();
    expect(analysis.totalRulesAnalyzed).toBeGreaterThanOrEqual(2);
    expect(analysis.changedCount).toBeGreaterThanOrEqual(1);

    // Verify critical drift item exists
    const creditDrift = analysis.items.find((item) => item.ruleId === 'rule-credit-02');
    expect(creditDrift).toBeDefined();
    expect(creditDrift?.status).toBe('CHANGED');
    expect(creditDrift?.severity).toBe('critical');
    expect(creditDrift?.detectedDifference).toContain('650 to 675');
  });

  it('executes targeted regression test cases and proves failure on altered credit score threshold', async () => {
    const analysis = await detector.analyzeDrift('proj-acme-monolith-01');

    const failedTests = analysis.regressionTests.filter((t) => !t.passed);
    expect(failedTests.length).toBeGreaterThanOrEqual(1);

    const creditTest = analysis.regressionTests.find((t) => t.id === 'test-case-01');
    expect(creditTest).toBeDefined();
    expect(creditTest?.passed).toBe(false);
    expect(creditTest?.actualMonolithOutput?.approved).toBe(true);
    expect(creditTest?.actualModernOutput?.approved).toBe(false);
    expect(creditTest?.failureReason).toBeDefined();
  });

  it('executes Slide 5 flagship regression test (qty 5, stock 2) proving logic drift on stock check', async () => {
    const analysis = await detector.analyzeDrift('proj-acme-monolith-01');

    const stockTest = analysis.regressionTests.find((t) => t.id === 'test-case-stock-01');
    expect(stockTest).toBeDefined();
    expect(stockTest?.passed).toBe(false);
    expect(stockTest?.actualMonolithOutput?.status).toBe('REJECTED');
    expect(stockTest?.actualMonolithOutput?.outcome).toBe('Order rejected');
    expect(stockTest?.actualModernOutput?.status).toBe('CONFIRMED');
    expect(stockTest?.actualModernOutput?.outcome).toBe('Order confirmed');
    expect(stockTest?.failureReason).toContain('STATUS: FAIL: needs human review');

    const stockItem = analysis.items.find((item) => item.id === 'drift-item-stock-01');
    expect(stockItem).toBeDefined();
    expect(stockItem?.status).toBe('CHANGED');
    expect(stockItem?.severity).toBe('critical');
  });

  it('verifies volume discount percentage drift (15% legacy vs 10% modernized)', async () => {
    const analysis = await detector.analyzeDrift('proj-acme-monolith-01');

    const discountTest = analysis.regressionTests.find((t) => t.id === 'test-case-02');
    expect(discountTest).toBeDefined();
    expect(discountTest?.passed).toBe(false);
    expect(discountTest?.actualMonolithOutput?.discountRate).toBe(0.15);
    expect(discountTest?.actualModernOutput?.discountRate).toBe(0.10);
  });
});
