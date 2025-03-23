const { PAYMENT_STAGE_STATUS, PAYMENT_STATUS } = require("../utils/constants");

/**
 * Analytics Service
 * Contains business logic for calculating financial metrics
 */
let analyticsService = {};

/**
 * Calculate overall financial metrics from payment stages
 * @param {Array} paymentStages - Array of payment stage objects
 * @returns {Object} Object containing totalPaidAmount and totalPendingAmount
 */
analyticsService.calculateFinancialMetrics = (paymentStages) => {
  let totalPaidAmount = 0;
  let totalPendingAmount = 0;

  paymentStages.forEach(stage => {
    totalPaidAmount += parseFloat(stage.paidAmount || 0);

    // Calculate pending amount (total - paid)
    const stagePendingAmount = parseFloat(stage.totalAmount || 0) - parseFloat(stage.paidAmount || 0);
    totalPendingAmount += stagePendingAmount > 0 ? stagePendingAmount : 0;
  });

  return {
    totalPaidAmount: parseFloat(totalPaidAmount.toFixed(2)),
    totalPendingAmount: parseFloat(totalPendingAmount.toFixed(2))
  };
};

/**
 * Calculate project completion percentage based on payments
 * @param {number} totalPaidAmount - Total amount paid
 * @param {number} totalProjectValue - Total project value
 * @returns {number} Completion percentage
 */
analyticsService.calculateCompletionPercentage = (totalPaidAmount, totalProjectValue) => {
  if (!totalProjectValue || totalProjectValue <= 0) return 0;

  const percentage = (totalPaidAmount / totalProjectValue) * 100;
  return parseFloat(percentage.toFixed(2));
};

/**
 * Format currency amount to 2 decimal places
 * @param {number} amount - Amount to format
 * @returns {number} Formatted amount
 */
analyticsService.formatCurrencyAmount = (amount) => {
  return parseFloat((amount || 0).toFixed(2));
};

module.exports = analyticsService; 