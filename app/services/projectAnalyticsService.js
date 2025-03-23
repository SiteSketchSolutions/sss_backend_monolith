const { Op } = require("sequelize");
const { PAYMENT_STAGE_STATUS, PAYMENT_STATUS } = require("../utils/constants");
const Project = require("../models/projectModel");
const PaymentStage = require("../models/paymentStageModel");
const Wallet = require("../models/walletModel");
const vendorExpenseTrackerModel = require("../models/vendorExpenseTrackerModel");

/**
 * Project Analytics Service
 * Contains business logic for calculating project financial metrics
 */
let projectAnalyticsService = {};

/**
 * Format currency amount to 2 decimal places
 * @param {number} amount - Amount to format
 * @returns {number} Formatted amount
 */
projectAnalyticsService.formatCurrencyAmount = (amount) => {
    return parseFloat((amount || 0).toFixed(2));
};

/**
 * Get project analytics data
 * @param {*} projectId - ID of the project
 * @returns {Object} Project analytics data
 */
projectAnalyticsService.getProjectAnalytics = async (projectId) => {
    try {
        if (!projectId) {
            throw new Error("Project ID is required");
        }

        // Get project details
        const project = await Project.findOne({
            where: {
                id: projectId,
                isDeleted: false
            },
            attributes: ['id', 'name', 'price', 'status']
        });

        if (!project) {
            throw new Error("Project not found");
        }

        // Get wallet for the project
        const wallet = await Wallet.findOne({
            where: {
                projectId,
                isDeleted: false
            }
        });

        if (!wallet) {
            throw new Error("Wallet not found for this project");
        }

        // Get payment stages for the project
        const paymentStages = await PaymentStage.findAll({
            where: {
                walletId: wallet.id,
                isDeleted: false
            },
            attributes: ['id', 'name', 'totalAmount', 'paidAmount', 'status', 'paymentStatus'],
            raw: true
        });

        // 1. Project total cost - sum of all payment stage total amounts
        const projectTotalCost = paymentStages.reduce((total, stage) => {
            return total + parseFloat(stage.totalAmount || 0);
        }, 0);

        // 2. Amount paid by client - sum of all in-progress and completed stages paid amounts
        const clientPaidAmount = paymentStages
            .filter(stage =>
                stage.status === PAYMENT_STAGE_STATUS.IN_PROGRESS ||
                stage.status === PAYMENT_STAGE_STATUS.COMPLETED
            )
            .reduce((total, stage) => {
                return total + parseFloat(stage.paidAmount || 0);
            }, 0);

        // 3. Amount to be paid by client - difference between total and paid for in-progress and completed stages
        const inProgressAndCompletedStages = paymentStages.filter(stage =>
            stage.status === PAYMENT_STAGE_STATUS.IN_PROGRESS ||
            stage.status === PAYMENT_STAGE_STATUS.COMPLETED
        );

        const totalAmountForInProgressAndCompleted = inProgressAndCompletedStages.reduce((total, stage) => {
            return total + parseFloat(stage.totalAmount || 0);
        }, 0);

        const amountToBePaid = totalAmountForInProgressAndCompleted - clientPaidAmount;

        // 4. Amount spent on the project - sum of vendor expense tracker amounts
        const vendorExpenses = await vendorExpenseTrackerModel.findAll({
            where: {
                projectId,
                isDeleted: false
            },
            attributes: ['amount']
        });

        const amountSpent = vendorExpenses.reduce((total, expense) => {
            return total + parseFloat(expense.amount || 0);
        }, 0);

        // Format the currency amounts
        const result = {
            projectId: project.id,
            projectName: project.name,
            projectStatus: project.status,
            projectTotalCost: projectAnalyticsService.formatCurrencyAmount(projectTotalCost),
            clientPaidAmount: projectAnalyticsService.formatCurrencyAmount(clientPaidAmount),
            amountToBePaid: projectAnalyticsService.formatCurrencyAmount(amountToBePaid),
            amountSpent: projectAnalyticsService.formatCurrencyAmount(amountSpent),
            // profitOrLoss: projectAnalyticsService.formatCurrencyAmount(clientPaidAmount - amountSpent),
            // pendingProfit: projectAnalyticsService.formatCurrencyAmount(projectTotalCost - amountSpent)
        };

        return result;
    } catch (error) {
        console.error("Error in getProjectAnalytics:", error);
        throw error;
    }
};

module.exports = projectAnalyticsService; 