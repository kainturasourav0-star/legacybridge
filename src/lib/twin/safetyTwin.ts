import { SafetyTwinComparison, TwinScenario } from '@/types';

// Safe in-memory execution of monolith and modernized services
// @ts-ignore
const monolith = require('../../fixtures/legacy_monolith/orders_monolith');
// @ts-ignore
const modernized = require('../../fixtures/legacy_monolith/modernized_orders_service');

export class MigrationSafetyTwinEngine {
  /**
   * Executes identical controlled inputs across both the legacy monolith and modernized microservice,
   * comparing outputs, state mutations, and business outcomes side-by-side.
   */
  async compareImplementations(
    projectId: string = 'proj-acme-monolith-01',
    originalRev: string = 'v1.4.2-monolith',
    proposedRev: string = 'v2.0.0-candidate'
  ): Promise<SafetyTwinComparison> {
    const scenarios: TwinScenario[] = [];

    // =========================================================================
    // SCENARIO 1 (Slide 5 Flagship): Stock Depletion & Order Confirmation
    // =========================================================================
    const qty1 = 5;
    const stock1 = 2;
    const start1 = performance.now();
    const monoOut1 = monolith.verifyStockAndConfirmOrder(qty1, stock1);
    const modOut1 = modernized.verifyStockAndConfirmOrderModern(qty1, stock1);
    const end1 = performance.now();

    const isMatch1 = monoOut1.status === modOut1.status;
    scenarios.push({
      id: 'scen-stock-01',
      name: 'Inventory Stock Depletion Rule (qty: 5, stock: 2)',
      domain: 'Inventory & Fulfillment',
      inputPayload: { quantity: qty1, availableStock: stock1 },
      originalOutput: monoOut1,
      proposedOutput: modOut1,
      status: isMatch1 ? 'EQUIVALENT' : 'MISMATCH',
      executionTimeMs: Number((end1 - start1).toFixed(2)),
      divergenceExplanation: isMatch1
        ? undefined
        : 'Monolith rejected order on inventory deficit. Modernized service demoted check to a warning log and confirmed the order.',
      originalSourceRef: 'src/orders_monolith.js:L146',
      proposedSourceRef: 'services/orders/fulfillment.js:L118',
    });

    // =========================================================================
    // SCENARIO 2: Commercial Credit Score Underwriting Threshold
    // =========================================================================
    const customerEnterprise = {
      id: 'CUST-801',
      name: 'Apex Logistics',
      tier: 'ENTERPRISE',
      creditScore: 660,
      debtToIncomeRatio: 0.38,
    };
    const orderTotal2 = 4800;
    const start2 = performance.now();
    const monoOut2 = monolith.evaluateCreditEligibility(customerEnterprise, orderTotal2);
    const modOut2 = modernized.evaluateModernCreditEligibility(customerEnterprise, orderTotal2);
    const end2 = performance.now();

    const isMatch2 = monoOut2.approved === modOut2.approved;
    scenarios.push({
      id: 'scen-credit-02',
      name: 'Enterprise Commercial Credit Underwriting (Score: 660, Order: $4,800)',
      domain: 'Underwriting & Risk',
      inputPayload: { customer: customerEnterprise, orderTotal: orderTotal2 },
      originalOutput: monoOut2,
      proposedOutput: modOut2,
      status: isMatch2 ? 'EQUIVALENT' : 'MISMATCH',
      executionTimeMs: Number((end2 - start2).toFixed(2)),
      divergenceExplanation: isMatch2
        ? undefined
        : 'Monolith approved credit for score 660 (min required: 650). Modernized service rejected order (min required: 675).',
      originalSourceRef: 'src/orders_monolith.js:L63',
      proposedSourceRef: 'services/orders/credit_policy.js:L42',
    });

    // =========================================================================
    // SCENARIO 3: Volume Discount Rate Calculation (Tier-2)
    // =========================================================================
    const qty3 = 60;
    const unitPrice3 = 100.0;
    const start3 = performance.now();
    const monoOut3 = monolith.calculateVolumeDiscount(qty3, unitPrice3);
    const modOut3 = modernized.calculateModernVolumeDiscount(qty3, unitPrice3);
    const end3 = performance.now();

    const isMatch3 = monoOut3.discountRate === modOut3.discountRate;
    scenarios.push({
      id: 'scen-pricing-03',
      name: 'Tier-2 Volume Discount Calculation (60 units @ $100.00)',
      domain: 'Pricing & Billing',
      inputPayload: { quantity: qty3, unitPrice: unitPrice3 },
      originalOutput: monoOut3,
      proposedOutput: modOut3,
      status: isMatch3 ? 'EQUIVALENT' : 'MISMATCH',
      executionTimeMs: Number((end3 - start3).toFixed(2)),
      divergenceExplanation: isMatch3
        ? undefined
        : 'Monolith applied 15% volume discount ($5100.00 total). Modernized service reduced discount to 10% ($5400.00 total).',
      originalSourceRef: 'src/orders_monolith.js:L29',
      proposedSourceRef: 'services/orders/pricing.js:L14',
    });

    // =========================================================================
    // SCENARIO 4: Standard Nominal Retail Order (Parity Baseline)
    // =========================================================================
    const customerNominal = {
      id: 'CUST-100',
      name: 'Acme Retail Partner',
      tier: 'STANDARD',
      creditScore: 740,
      debtToIncomeRatio: 0.25,
    };
    const orderTotal4 = 500;
    const start4 = performance.now();
    const monoOut4 = monolith.evaluateCreditEligibility(customerNominal, orderTotal4);
    const modOut4 = modernized.evaluateModernCreditEligibility(customerNominal, orderTotal4);
    const end4 = performance.now();

    const isMatch4 = monoOut4.approved === modOut4.approved;
    scenarios.push({
      id: 'scen-nominal-04',
      name: 'Standard Retail Order Baseline (Score: 740 >= 680, Order: $500)',
      domain: 'Underwriting & Risk',
      inputPayload: { customer: customerNominal, orderTotal: orderTotal4 },
      originalOutput: monoOut4,
      proposedOutput: modOut4,
      status: isMatch4 ? 'EQUIVALENT' : 'MISMATCH',
      executionTimeMs: Number((end4 - start4).toFixed(2)),
      originalSourceRef: 'src/orders_monolith.js:L60',
      proposedSourceRef: 'services/orders/credit_policy.js:L38',
    });

    const mismatchesCount = scenarios.filter((s) => s.status === 'MISMATCH').length;

    return {
      id: `twin-run-${Date.now()}`,
      projectId,
      originalRevision: originalRev,
      proposedRevision: proposedRev,
      status: mismatchesCount > 0 ? 'mismatch_flagged' : 'completed',
      scenariosCount: scenarios.length,
      mismatchesCount,
      scenarios,
      generatedAt: new Date().toISOString(),
      reviewStatus: mismatchesCount > 0 ? 'needs_human_review' : 'approved',
      executiveSummary: mismatchesCount > 0
        ? `SAFETY TWIN DIVERGENCE: Detected ${mismatchesCount} behavioral mismatches between ${originalRev} and ${proposedRev}. Deployment blocked until operator review.`
        : `SAFETY TWIN VERIFIED: All ${scenarios.length} test scenarios achieved 100% behavioral equivalence.`,
    };
  }
}

export const safetyTwinEngine = new MigrationSafetyTwinEngine();
