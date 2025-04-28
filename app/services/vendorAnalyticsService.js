const { Op } = require("sequelize");
const vendorModel = require("../models/vendorModel");
const vendorExpenseTrackerModel = require("../models/vendorExpenseTrackerModel");
const budgetAllocationModel = require("../models/budgetAllocationModel");

/**
 * Vendor Analytics Service
 * Contains business logic for calculating vendor financial metrics
 */
let vendorAnalyticsService = {};

/**
 * Format currency amount to 2 decimal places
 * @param {number} amount - Amount to format
 * @returns {number} Formatted amount
 */
vendorAnalyticsService.formatCurrencyAmount = (amount) => {
    return parseFloat((amount || 0).toFixed(2));
};

/**
 * Get vendor analytics data
 * @param {number} vendorId - ID of the vendor
 * @param {number} projectId - Optional project ID to filter by specific project
 * @param {date} startDate - Optional start date for filtering
 * @param {date} endDate - Optional end date for filtering
 * @returns {Object} Vendor analytics data
 */
vendorAnalyticsService.getVendorAnalytics = async (vendorId, projectId, startDate, endDate) => {
    try {

        // Get vendor details
        let vendor = null;
        if (vendorId) {
            vendor = await vendorModel.findOne({
                where: {
                    id: vendorId,
                    isDeleted: false
                },
                attributes: ['id', 'name', 'status']
            });

            if (!vendor) {
                throw new Error("Vendor not found");
            }
        }

        // Build where clause for expenses and budget allocations
        let expenseWhereClause = {
            isDeleted: false
        };
        if (vendorId) {
            expenseWhereClause.vendorId = vendorId;
        }

        let budgetWhereClause = {
            isDeleted: false
        };

        if (vendorId) {
            budgetWhereClause.vendorId = vendorId;
        }

        // Add project filter if provided
        if (projectId) {
            expenseWhereClause.projectId = projectId;
            budgetWhereClause.projectId = projectId;
        }

        // Add date filters if provided
        if (startDate) {
            expenseWhereClause.createdAt = {
                ...expenseWhereClause.createdAt,
                [Op.gte]: new Date(startDate)
            };
        }

        if (endDate) {
            expenseWhereClause.createdAt = {
                ...expenseWhereClause.createdAt,
                [Op.lte]: new Date(endDate)
            };
        }

        // Get vendor expenses
        const expenses = await vendorExpenseTrackerModel.findAll({
            where: expenseWhereClause,
            attributes: ['id', 'projectId', 'amount', 'createdAt'],
            raw: true
        });

        // Get budget allocations
        const budgetAllocations = await budgetAllocationModel.findAll({
            where: budgetWhereClause,
            attributes: ['id', 'projectId', 'amount'],
            raw: true
        });


        // Calculate total expenses
        const totalExpenses = expenses.reduce((sum, expense) => {
            return sum + parseFloat(expense.amount || 0);
        }, 0);
        // Calculate total budget allocated
        const totalBudgetAllocated = budgetAllocations.reduce((sum, allocation) => {
            return sum + parseFloat(allocation.amount || 0);
        }, 0);
        // Calculate remaining budget
        const remainingBudget = totalBudgetAllocated - totalExpenses;
        // Calculate budget utilization percentage
        const budgetUtilizationPercentage = totalBudgetAllocated > 0
            ? (totalExpenses / totalBudgetAllocated) * 100
            : 0;
        // Group expenses by project
        const projectWiseExpenses = expenses.reduce((acc, expense) => {
            const projectId = expense.projectId;
            if (!acc[projectId]) {
                acc[projectId] = 0;
            }
            acc[projectId] += parseFloat(expense.amount || 0);
            return acc;
        }, {});

        // Group budget allocations by project
        const projectWiseBudget = budgetAllocations.reduce((acc, allocation) => {
            const projectId = allocation.projectId;
            if (!acc[projectId]) {
                acc[projectId] = 0;
            }
            acc[projectId] += parseFloat(allocation.amount || 0);
            return acc;
        }, {});

        // Combine project-wise data
        const projectWiseAnalytics = Object.keys({ ...projectWiseExpenses, ...projectWiseBudget }).map(projectId => ({
            projectId: parseInt(projectId),
            expenses: vendorAnalyticsService.formatCurrencyAmount(projectWiseExpenses[projectId] || 0),
            budgetAllocated: vendorAnalyticsService.formatCurrencyAmount(projectWiseBudget[projectId] || 0),
            remainingBudget: vendorAnalyticsService.formatCurrencyAmount((projectWiseBudget[projectId] || 0) - (projectWiseExpenses[projectId] || 0)),
            utilizationPercentage: projectWiseBudget[projectId]
                ? ((projectWiseExpenses[projectId] || 0) / projectWiseBudget[projectId]) * 100
                : 0
        }));

        // Format the response
        const result = {
            vendorId: vendor?.id || null,
            vendorName: vendor?.name || null,
            vendorStatus: vendor?.status || null,
            totalExpenses: vendorAnalyticsService.formatCurrencyAmount(totalExpenses) || null,
            totalBudgetAllocated: vendorAnalyticsService.formatCurrencyAmount(totalBudgetAllocated) || null,
            remainingBudget: vendorAnalyticsService.formatCurrencyAmount(remainingBudget) || null,
            budgetUtilizationPercentage: parseFloat(budgetUtilizationPercentage.toFixed(2)) || null,
            projectWiseAnalytics: projectWiseAnalytics
        };

        return result;
    } catch (error) {
        console.error("Error in getVendorAnalytics:", error);
        throw error;
    }
};

module.exports = vendorAnalyticsService; 