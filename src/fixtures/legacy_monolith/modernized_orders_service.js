/**
 * MODERNIZED ORDERS MICROSERVICE (v1.0 - 2026 Target Service)
 * Extracted microservice with REST endpoint contract and schema validation.
 * 
 * NOTICE: Contains intentional business logic drift injected for demonstration:
 * 1. Volume discount threshold tier-2 was altered from 15% (0.15) to 10% (0.10).
 * 2. Enterprise tier credit score cutoff was tightened from 650 to 675, causing
 *    valid enterprise customers with score 660 to be incorrectly rejected.
 */

// Modernized discount calculator (contains DRIFT)
function calculateModernVolumeDiscount(quantity, unitPrice) {
  let discountRate = 0.0;
  if (quantity >= 100) {
    discountRate = 0.20;
  } else if (quantity >= 50) {
    // [DRIFT INJECTION]: Legacy was 0.15 (15%), modern was incorrectly changed to 0.10 (10%)
    discountRate = 0.10;
  } else if (quantity >= 20) {
    discountRate = 0.08;
  }
  const subtotal = quantity * unitPrice;
  const discountAmount = subtotal * discountRate;
  return {
    discountRate,
    discountAmount,
    totalAfterDiscount: subtotal - discountAmount
  };
}

// Modernized credit policy evaluator (contains DRIFT)
function evaluateModernCreditEligibility(customer, orderTotal) {
  if (!customer) {
    return { approved: false, reason: 'CUSTOMER_NOT_FOUND' };
  }

  // Large order override check
  if (orderTotal > 10000 && customer.creditScore < 670) {
    return {
      approved: false,
      reason: 'HIGH_VALUE_THRESHOLD_UNMET: Min credit score 670 required for orders > $10,000',
      creditScore: customer.creditScore,
      orderTotal
    };
  }

  const isElevatedTier = customer.tier === 'ENTERPRISE' || customer.tier === 'PREMIUM';
  
  // [DRIFT INJECTION]: Legacy was 650 for elevated tiers. Developer set 675.
  const minScore = isElevatedTier ? 675 : 680;
  const maxDti = isElevatedTier ? 0.42 : 0.35;

  if (customer.creditScore >= minScore && customer.debtToIncomeRatio <= maxDti) {
    return { approved: true, tier: customer.tier, scoreThresholdMet: true };
  }

  return {
    approved: false,
    reason: `UNDERWRITING_REJECT: Credit score ${customer.creditScore} < ${minScore} or DTI ${customer.debtToIncomeRatio} > ${maxDti}`,
    customerScore: customer.creditScore,
    minRequired: minScore
  };
}

// Modernized service handler
async function handleProcessOrderModern(payload) {
  const { customer, items } = payload;
  if (!customer) throw new Error('Missing customer payload');

  let grossTotal = 0;
  let totalDiscounts = 0;
  const processedItems = [];

  for (const item of items) {
    const pricing = calculateModernVolumeDiscount(item.quantity, item.unitPrice);
    grossTotal += item.quantity * item.unitPrice;
    totalDiscounts += pricing.discountAmount;

    processedItems.push({
      sku: item.sku,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discountRate: pricing.discountRate,
      lineTotal: pricing.totalAfterDiscount
    });
  }

  const netTotal = grossTotal - totalDiscounts;
  const creditDecision = evaluateModernCreditEligibility(customer, netTotal);

  if (!creditDecision.approved) {
    return {
      success: false,
      status: 'CREDIT_REJECTED',
      reason: creditDecision.reason,
      netTotal
    };
  }

  return {
    success: true,
    status: 'ORDER_APPROVED',
    orderId: `MOD-${Date.now()}`,
    customerId: customer.id,
    customerTier: customer.tier,
    grossTotal,
    discountTotal: totalDiscounts,
    netTotal,
    creditDecision,
    items: processedItems
  };
}

/**
 * PITCH DECK SLIDE 5: Proposed Microservice Rule (With Injected Logic Drift)
 * "if (stock < qty) { log.warn('low stock'); } confirmOrder(order);"
 */
function verifyStockAndConfirmOrderModern(qty, stock) {
  if (stock < qty) {
    // [DRIFT INJECTION]: Developer converted hard reject to log warning, allowing out-of-stock orders through!
    // log.warn("low stock");
  }
  return { status: 'CONFIRMED', outcome: 'Order confirmed' };
}

module.exports = {
  calculateModernVolumeDiscount,
  evaluateModernCreditEligibility,
  handleProcessOrderModern,
  verifyStockAndConfirmOrderModern
};
