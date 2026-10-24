import { describe, it, expect } from 'vitest';
import { safetyTwinEngine } from '../src/lib/twin/safetyTwin';
import { confidenceGateEngine } from '../src/lib/gate/confidenceGate';
import { continuousGuardEngine } from '../src/lib/guard/continuousGuard';
import { boundaryAdvisorEngine } from '../src/lib/advisor/boundaryAdvisor';

describe('Migration Safety Twin Engine', () => {
  it('executes identical controlled test inputs and catches Slide 5 stock bug', async () => {
    const comparison = await safetyTwinEngine.compareImplementations('proj-acme-monolith-01');

    expect(comparison).toBeDefined();
    expect(comparison.scenariosCount).toBeGreaterThanOrEqual(4);
    expect(comparison.mismatchesCount).toBeGreaterThanOrEqual(1);

    // Scenario 1: Slide 5 stock depletion check
    const stockScenario = comparison.scenarios.find((s) => s.id === 'scen-stock-01');
    expect(stockScenario).toBeDefined();
    expect(stockScenario?.status).toBe('MISMATCH');
    expect(stockScenario?.originalOutput.status).toBe('REJECTED');
    expect(stockScenario?.proposedOutput.status).toBe('CONFIRMED');

    // Scenario 4: Nominal retail order (should be equivalent)
    const nominalScenario = comparison.scenarios.find((s) => s.id === 'scen-nominal-04');
    expect(nominalScenario).toBeDefined();
    expect(nominalScenario?.status).toBe('EQUIVALENT');
    expect(nominalScenario?.originalOutput.approved).toBe(true);
    expect(nominalScenario?.proposedOutput.approved).toBe(true);
  });
});

describe('Migration Confidence Gate Engine', () => {
  it('evaluates 10 separate dimensions and blocks automatic readiness claims', async () => {
    const report = await confidenceGateEngine.evaluateGate('proj-acme-monolith-01');

    expect(report).toBeDefined();
    expect(report.dimensions.length).toBe(10);
    expect(report.overallStatus).toBe('blocked_by_issues');
    expect(report.humanApprovalStatus).toBe('pending');

    // Check that critical regression blocks the gate
    const regressionDim = report.dimensions.find((d) => d.id === 'regression_results');
    expect(regressionDim).toBeDefined();
    expect(regressionDim?.status).toBe('blocked');
    expect(regressionDim?.evidence).toContain('Slide 5 stock depletion check failed');

    // Check that source coverage passed
    const coverageDim = report.dimensions.find((d) => d.id === 'source_coverage');
    expect(coverageDim).toBeDefined();
    expect(coverageDim?.status).toBe('pass');
  });

  it('records human operator sign-off with mandatory justification', async () => {
    const report = await confidenceGateEngine.evaluateGate('proj-acme-monolith-01');
    const operator = 'Lead Enterprise Architect';
    const reason = 'Dual-write audit verified within tolerance; approving Phase 1 boundary.';

    const signedReport = await confidenceGateEngine.signOffGate(report, operator, reason);
    expect(signedReport.humanApprovalStatus).toBe('approved');
    expect(signedReport.approvalSignOff?.approvedBy).toBe(operator);
    expect(signedReport.approvalSignOff?.justification).toBe(reason);
  });
});

describe('Continuous Migration Guard Engine', () => {
  it('calculates blast radius and detects regressions introduced in PR changes', async () => {
    const check = await continuousGuardEngine.evaluateRevisionChange(
      'proj-acme-monolith-01',
      ['services/orders/fulfillment.js'],
      'refactor: modify fulfillment pipeline'
    );

    expect(check).toBeDefined();
    expect(check.changedFiles).toContain('services/orders/fulfillment.js');
    expect(check.affectedModules).toContain('Order Service');
    expect(check.affectedRules.some((r) => r.includes('Stock Depletion'))).toBe(true);
    expect(check.guardStatus).toBe('regressions_detected');
    expect(check.newFailuresCount).toBeGreaterThan(0);
  });
});

describe('Smart Service Boundary Advisor Engine', () => {
  it('advises interim modular monolith when synchronous shared database coupling exists', async () => {
    const advisory = await boundaryAdvisorEngine.evaluateBoundaries('proj-acme-monolith-01');

    expect(advisory).toBeDefined();
    expect(advisory.interimModularMonolithRecommended).toBe(true);
    expect(advisory.recommendations.length).toBeGreaterThanOrEqual(4);

    // Orders module should be recommended for interim modular monolith
    const orderRec = advisory.recommendations.find((r) => r.id === 'rec-orders-01');
    expect(orderRec).toBeDefined();
    expect(orderRec?.recommendedArchitecture).toBe('modular_monolith_interim');
    expect(orderRec?.transactionComplexity).toBe('distributed_saga_required');
    expect(orderRec?.sharedDatabaseTables).toContain('orders');

    // Inventory module should be recommended as microservice candidate
    const invRec = advisory.recommendations.find((r) => r.id === 'rec-inventory-03');
    expect(invRec).toBeDefined();
    expect(invRec?.recommendedArchitecture).toBe('microservice_candidate');
  });
});
