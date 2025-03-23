// "use strict";
const HELPERS = require("../helpers");
const { Op } = require("sequelize");
const { MESSAGES, ERROR_TYPES, PAYMENT_STAGE_STATUS, PAYMENT_STATUS, PROJECT_STATUS } = require('../utils/constants');

const Project = require("../models/projectModel");
const PaymentStage = require("../models/paymentStageModel");
const Wallet = require("../models/walletModel");
const analyticsService = require("../services/analyticsService");

/**************************************************
 ********* ANALYTICS CONTROLLER ***************
 **************************************************/
let analyticsController = {};

/**
 * Get overall project financial analytics
 * @param {*} payload 
 * @returns 
 */
analyticsController.getOverallAnalytics = async (payload) => {
    try {
        // Get all active (non-deleted) projects
        const projects = await Project.findAll({
            where: {
                isDeleted: false
            },
            attributes: ['id', 'name', 'price', 'status']
        });

        // Calculate total project amount
        const totalProjectValue = projects.reduce((total, project) => {
            return total + parseFloat(project.price || 0);
        }, 0);

        // Get all payment stages
        const paymentStages = await PaymentStage.findAll({
            where: {
                isDeleted: false
            },
            attributes: ['id', 'totalAmount', 'paidAmount', 'status', 'paymentStatus']
        });

        // Calculate total paid amount and pending amount
        const { totalPaidAmount, totalPendingAmount } = analyticsService.calculateFinancialMetrics(paymentStages);

        // Count projects by status
        const projectsByStatus = {
            pending: projects.filter(p => p.status === PROJECT_STATUS.PENDING).length,
            inProgress: projects.filter(p => p.status === PROJECT_STATUS.IN_PROGRESS).length,
            completed: projects.filter(p => p.status === PROJECT_STATUS.COMPLETED).length,
            total: projects.length
        };

        // Count payment stages by status
        const stagesByStatus = {
            upcoming: paymentStages.filter(s => s.status === PAYMENT_STAGE_STATUS.UPCOMING).length,
            pending: paymentStages.filter(s => s.status === PAYMENT_STAGE_STATUS.PENDING).length,
            inProgress: paymentStages.filter(s => s.status === PAYMENT_STAGE_STATUS.IN_PROGRESS).length,
            completed: paymentStages.filter(s => s.status === PAYMENT_STAGE_STATUS.COMPLETED).length,
            total: paymentStages.length
        };

        // Count payment stages by payment status
        const stagesByPaymentStatus = {
            unpaid: paymentStages.filter(s => s.paymentStatus === PAYMENT_STATUS.UNPAID).length,
            partiallyPaid: paymentStages.filter(s => s.paymentStatus === PAYMENT_STATUS.PARTIALLY_PAID).length,
            paid: paymentStages.filter(s => s.paymentStatus === PAYMENT_STATUS.PAID).length,
            overdue: paymentStages.filter(s => s.paymentStatus === PAYMENT_STATUS.OVERDUE).length,
            total: paymentStages.length
        };

        const response = {
            totalProjectValue: analyticsService.formatCurrencyAmount(totalProjectValue),
            totalPaidAmount,
            totalPendingAmount,
            projectsByStatus,
            stagesByStatus,
            stagesByPaymentStatus
        };
        return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.ANALYTICS_FETCHED_SUCCESSFULLY), { data: response });
    } catch (error) {
        console.error("Error in getOverallAnalytics:", error);
        throw HELPERS.responseHelper.createErrorResponse(error.msg || "Error fetching analytics", ERROR_TYPES.SOMETHING_WENT_WRONG);
    }
};

/**
 * Get project-specific financial analytics
 * @param {*} payload 
 * @returns 
 */
analyticsController.getProjectAnalytics = async (payload) => {
    try {
        const { projectId } = payload;

        if (!projectId) {
            return HELPERS.responseHelper.createErrorResponse("Project ID is required", ERROR_TYPES.BAD_REQUEST);
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
            return HELPERS.responseHelper.createErrorResponse("Project not found", ERROR_TYPES.DATA_NOT_FOUND);
        }

        // Get wallet for the project
        const wallet = await Wallet.findOne({
            where: {
                projectId,
                isDeleted: false
            }
        });

        if (!wallet) {
            return HELPERS.responseHelper.createErrorResponse("Wallet not found for this project", ERROR_TYPES.DATA_NOT_FOUND);
        }

        // Get payment stages for the project
        const paymentStages = await PaymentStage.findAll({
            where: {
                walletId: wallet.id,
                isDeleted: false
            },
            attributes: ['id', 'name', 'totalAmount', 'paidAmount', 'status', 'paymentStatus']
        });

        // Calculate the total project amount as the sum of all payment stages' total amounts
        const stagesTotal = paymentStages.reduce((total, stage) => {
            return total + parseFloat(stage.totalAmount || 0);
        }, 0);

        // Use the calculated stagesTotal as the project's total value
        const totalProjectValue = stagesTotal > 0 ? stagesTotal : parseFloat(project.price || 0);

        // Calculate project financial metrics
        const { totalPaidAmount, totalPendingAmount } = analyticsService.calculateFinancialMetrics(paymentStages);

        // Calculate completion percentage based on payments
        const paymentCompletionPercentage = analyticsService.calculateCompletionPercentage(totalPaidAmount, totalProjectValue);

        // Count payment stages by status for this project
        const stagesByStatus = {
            upcoming: paymentStages.filter(s => s.status === PAYMENT_STAGE_STATUS.UPCOMING).length,
            pending: paymentStages.filter(s => s.status === PAYMENT_STAGE_STATUS.PENDING).length,
            inProgress: paymentStages.filter(s => s.status === PAYMENT_STAGE_STATUS.IN_PROGRESS).length,
            completed: paymentStages.filter(s => s.status === PAYMENT_STAGE_STATUS.COMPLETED).length,
            total: paymentStages.length
        };

        // Count payment stages by payment status for this project
        const stagesByPaymentStatus = {
            unpaid: paymentStages.filter(s => s.paymentStatus === PAYMENT_STATUS.UNPAID).length,
            partiallyPaid: paymentStages.filter(s => s.paymentStatus === PAYMENT_STATUS.PARTIALLY_PAID).length,
            paid: paymentStages.filter(s => s.paymentStatus === PAYMENT_STATUS.PAID).length,
            overdue: paymentStages.filter(s => s.paymentStatus === PAYMENT_STATUS.OVERDUE).length,
            total: paymentStages.length
        };

        // Get wallet balance if wallet exists
        const walletBalance = parseFloat(wallet.balance || 0);

        // Calculate in progress amount - sum of in_progress stages with unpaid or partially paid status
        const inProgressAmount = paymentStages
            .filter(s =>
                s.status === PAYMENT_STAGE_STATUS.IN_PROGRESS &&
                (s.paymentStatus === PAYMENT_STATUS.UNPAID || s.paymentStatus === PAYMENT_STATUS.PARTIALLY_PAID)
            )
            .reduce((total, stage) => {
                return total + parseFloat(stage.totalAmount || 0) - parseFloat(stage.paidAmount || 0);
            }, 0);

        // Calculate completed amount - sum of completed stages total amounts
        const completedAmount = paymentStages
            .filter(s => s.status === PAYMENT_STAGE_STATUS.COMPLETED)
            .reduce((total, stage) => {
                return total + parseFloat(stage.totalAmount || 0);
            }, 0);

        const response = {
            project: {
                id: project.id,
                name: project.name,
                totalValue: analyticsService.formatCurrencyAmount(totalProjectValue),
                displayedPrice: analyticsService.formatCurrencyAmount(project.price), // Original price from project
                calculatedPrice: analyticsService.formatCurrencyAmount(stagesTotal), // Sum of all payment stages
                status: project.status
            },
            financials: {
                totalPaidAmount,
                totalPendingAmount,
                inProgressAmount: analyticsService.formatCurrencyAmount(inProgressAmount),
                completedAmount: analyticsService.formatCurrencyAmount(completedAmount),
                paymentCompletionPercentage,
                walletBalance: analyticsService.formatCurrencyAmount(walletBalance)
            },
            stages: {
                byStatus: stagesByStatus,
                byPaymentStatus: stagesByPaymentStatus
            },
            paymentStageDetails: paymentStages.map(stage => ({
                id: stage.id,
                name: stage.name,
                totalAmount: analyticsService.formatCurrencyAmount(stage.totalAmount),
                paidAmount: analyticsService.formatCurrencyAmount(stage.paidAmount),
                pendingAmount: analyticsService.formatCurrencyAmount((stage.totalAmount || 0) - (stage.paidAmount || 0)),
                status: stage.status,
                paymentStatus: stage.paymentStatus
            }))
        };
        return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.PROJECT_ANALYTICS_FETCHED_SUCCESSFULLY), { data: response });
    } catch (error) {
        console.error("Error in getProjectAnalytics:", error);
        throw HELPERS.responseHelper.createErrorResponse(error.msg || "Error fetching project analytics", ERROR_TYPES.SOMETHING_WENT_WRONG);
    }
};

/**
 * Get client payment analytics
 * @param {*} payload 
 * @returns 
 */
analyticsController.getClientPaymentAnalytics = async (payload) => {
    try {
        const { userId } = payload;

        if (!userId) {
            return HELPERS.responseHelper.createErrorResponse("User ID is required", ERROR_TYPES.BAD_REQUEST);
        }

        // Get all projects for the user
        const projects = await Project.findAll({
            where: {
                userId,
                isDeleted: false
            },
            attributes: ['id', 'name', 'price', 'status']
        });

        if (!projects || projects.length === 0) {
            const response = {
                totalProjectValue: 0,
                totalPaidAmount: 0,
                totalPendingAmount: 0,
                projectCount: 0,
                projects: []
            };
            return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.CLIENT_ANALYTICS_FETCHED_SUCCESSFULLY), { data: response });
        }

        const projectIds = projects.map(project => project.id);

        // Get wallets for all projects
        const wallets = await Wallet.findAll({
            where: {
                projectId: {
                    [Op.in]: projectIds
                },
                isDeleted: false
            }
        });

        const walletIds = wallets.map(wallet => wallet.id);

        // Get all payment stages for these wallets
        const paymentStages = await PaymentStage.findAll({
            where: {
                walletId: {
                    [Op.in]: walletIds
                },
                isDeleted: false
            },
            attributes: ['id', 'walletId', 'totalAmount', 'paidAmount', 'status', 'paymentStatus']
        });

        // Calculate overall financial metrics
        const totalProjectValue = projects.reduce((total, project) => {
            return total + parseFloat(project.price || 0);
        }, 0);

        const { totalPaidAmount, totalPendingAmount } = analyticsService.calculateFinancialMetrics(paymentStages);

        // Calculate project-specific analytics
        const projectAnalytics = projects.map(project => {
            const projectWallet = wallets.find(w => w.projectId === project.id);
            const projectWalletId = projectWallet ? projectWallet.id : null;

            const projectStages = paymentStages.filter(s => s.walletId === projectWalletId);

            const projectMetrics = analyticsService.calculateFinancialMetrics(projectStages);
            const projectPaidAmount = projectMetrics.totalPaidAmount;
            const projectPendingAmount = projectMetrics.totalPendingAmount;

            // Calculate the total project amount as the sum of all payment stages' total amounts
            const stagesTotal = projectStages.reduce((total, stage) => {
                return total + parseFloat(stage.totalAmount || 0);
            }, 0);

            // Use the calculated stagesTotal as the project's total value if available
            const projectTotalValue = stagesTotal > 0 ? stagesTotal : parseFloat(project.price || 0);

            // Count stages by status
            const inProgressStages = projectStages.filter(
                s => s.status === PAYMENT_STAGE_STATUS.IN_PROGRESS &&
                    (s.paymentStatus === PAYMENT_STATUS.PARTIALLY_PAID || s.paymentStatus === PAYMENT_STATUS.UNPAID)
            ).length;

            const completedStages = projectStages.filter(
                s => s.status === PAYMENT_STAGE_STATUS.COMPLETED || s.paymentStatus === PAYMENT_STATUS.PAID
            ).length;

            const completionPercentage = analyticsService.calculateCompletionPercentage(projectPaidAmount, projectTotalValue);

            return {
                id: project.id,
                name: project.name,
                totalValue: analyticsService.formatCurrencyAmount(projectTotalValue),
                displayedPrice: analyticsService.formatCurrencyAmount(project.price), // Original price from project
                calculatedPrice: analyticsService.formatCurrencyAmount(stagesTotal), // Sum of all payment stages
                paidAmount: projectPaidAmount,
                pendingAmount: projectPendingAmount,
                status: project.status,
                completionPercentage,
                stageStats: {
                    inProgress: inProgressStages,
                    completed: completedStages,
                    total: projectStages.length
                }
            };
        });

        const response = {
            totalProjectValue: analyticsService.formatCurrencyAmount(totalProjectValue),
            totalPaidAmount,
            totalPendingAmount,
            projectCount: projects.length,
            projects: projectAnalytics
        };
        return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.CLIENT_ANALYTICS_FETCHED_SUCCESSFULLY), { data: response });
    } catch (error) {
        console.error("Error in getClientPaymentAnalytics:", error);
        throw HELPERS.responseHelper.createErrorResponse(error.msg || "Error fetching client analytics", ERROR_TYPES.SOMETHING_WENT_WRONG);
    }
};

/* export analyticsController */
module.exports = analyticsController; 
