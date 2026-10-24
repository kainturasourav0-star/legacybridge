/**
 * ACME ORDER MANAGEMENT & LOAN ELIGIBILITY MONOLITH (v2.4 - 2018)
 * Legacy architecture: tightly coupled procedural code with embedded database access.
 */

// Legacy embedded database state
const db = {
  customers: {
    'CUST-801': { id: 'CUST-801', name: 'Apex Logistics', tier: 'ENTERPRISE', creditScore: 660, debtToIncomeRatio: 0.38, balance: 14200 },
    'CUST-802': { id: 'CUST-802', name: 'Orion Supplies', tier: 'STANDARD', creditScore: 640, debtToIncomeRatio: 0.45, balance: 2800 },
    'CUST-803': { id: 'CUST-803', name: 'Commonwealth Industrial', tier: 'PREMIUM', creditScore: 710, debtToIncomeRatio: 0.29, balance: 45000 },
  },
  inventory: {
    'SKU-101': { sku: 'SKU-101', name: 'Hydraulic Valve A2', stock: 150, unitPrice: 120.00, safetyThreshold: 20 },
    'SKU-102': { sku: 'SKU-102', name: 'Rotary Gasket 40mm', stock: 45, unitPrice: 35.50, safetyThreshold: 50 },
    'SKU-103': { sku: 'SKU-103', name: 'High-Torque Actuator', stock: 12, unitPrice: 480.00, safetyThreshold: 5 },
  }
};

/**
 * BUSINESS RULE 1: Volume Discount Policy
 * - Quantity >= 100: 20% discount
 * - Quantity >= 50: 15% discount
 * - Quantity >= 20: 8% discount
 * - Otherwise: 0% discount
 */
function calculateVolumeDiscount(quantity, unitPrice) {
  let discountRate = 0.0;
  if (quantity >= 100) {
    discountRate = 0.20;
  } else if (quantity >= 50) {
    discountRate = 0.15;
  } else if (quantity >= 20) {
    discountRate = 0.08;
  }
  const subtotal = quantity * unitPrice;
  const discountAmount = subtotal * discountRate;
  return { discountRate, discountAmount, totalAfterDiscount: subtotal - discountAmount };
}

/**
 * BUSINESS RULE 2: Commercial Credit Approval Gate
 * - Enterprise/Premium Tier: Min credit score 650, Max DTI 0.42
 * - Standard Tier: Min credit score 680, Max DTI 0.35
 * - If order total exceeds $10,000, credit score MUST be >= 670 regardless of tier.
 */
function evaluateCreditEligibility(customer, orderTotal) {
  if (!customer) {
    return { approved: false, reason: 'CUSTOMER_NOT_FOUND', maxAllowableCredit: 0 };
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

  // Tier-based evaluation
  const isElevatedTier = customer.tier === 'ENTERPRISE' || customer.tier === 'PREMIUM';
  const minScore = isElevatedTier ? 650 : 680;
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

/**
 * Order Processing Pipeline (Monolith controller)
 */
function processOrderLegacy(customerId, items) {
  const customer = db.customers[customerId];
  if (!customer) throw new Error(`Customer ${customerId} not found`);

  let grossTotal = 0;
  let totalDiscounts = 0;
  const processedItems = [];

  for (const item of items) {
    const inv = db.inventory[item.sku];
    if (!inv) throw new Error(`Invalid SKU: ${item.sku}`);
    if (inv.stock < item.quantity) {
      return { success: false, status: 'INSUFFICIENT_STOCK', item: item.sku, available: inv.stock };
    }

    const pricing = calculateVolumeDiscount(item.quantity, inv.unitPrice);
    grossTotal += item.quantity * inv.unitPrice;
    totalDiscounts += pricing.discountAmount;

    processedItems.push({
      sku: item.sku,
      quantity: item.quantity,
      unitPrice: inv.unitPrice,
      discountRate: pricing.discountRate,
      lineTotal: pricing.totalAfterDiscount
    });
  }

  const netTotal = grossTotal - totalDiscounts;

  // Credit approval check
  const creditDecision = evaluateCreditEligibility(customer, netTotal);
  if (!creditDecision.approved) {
    return {
      success: false,
      status: 'CREDIT_REJECTED',
      reason: creditDecision.reason,
      netTotal
    };
  }

  // Deduct inventory (tightly coupled side-effect)
  for (const item of items) {
    db.inventory[item.sku].stock -= item.quantity;
  }

  return {
    success: true,
    status: 'ORDER_APPROVED',
    orderId: `ORD-${Date.now()}`,
    customerId,
    customerTier: customer.tier,
    grossTotal,
    discountTotal: totalDiscounts,
    netTotal,
    creditDecision,
    items: processedItems
  };
}

/**
 * PITCH DECK SLIDE 5: Original Monolith Inventory Check Rule
 * "if (stock < qty) { return reject('INSUFFICIENT_STOCK'); } confirmOrder(order);"
 */
function verifyStockAndConfirmOrder(qty, stock) {
  if (stock < qty) {
    return { status: 'REJECTED', outcome: 'Order rejected', reason: 'INSUFFICIENT_STOCK' };
  }
  return { status: 'CONFIRMED', outcome: 'Order confirmed' };
}

module.exports = {
  db,
  calculateVolumeDiscount,
  evaluateCreditEligibility,
  processOrderLegacy,
  verifyStockAndConfirmOrder
};
