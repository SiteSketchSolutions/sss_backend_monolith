const HELPERS = require("../helpers");
const { Op } = require("sequelize");
const { MESSAGES, ERROR_TYPES } = require('../utils/constants');
const vendorAnalyticsService = require("../services/vendorAnalyticsService");

/**************************************************
 ********* VENDOR ANALYTICS CONTROLLER ***********
 **************************************************/
let vendorAnalyticsController = {};

/**
 * Get vendor expense analytics
 * @param {*} payload 
 * @returns 
 */
vendorAnalyticsController.getVendorAnalytics = async (payload) => {
    try {
        const { vendorId, projectId, startDate, endDate } = payload;

        if (!vendorId) {
            return HELPERS.responseHelper.createErrorResponse("Vendor ID is required", ERROR_TYPES.BAD_REQUEST);
        }

        const analyticsData = await vendorAnalyticsService.getVendorAnalytics(vendorId, projectId, startDate, endDate);

        return Object.assign(
            HELPERS.responseHelper.createSuccessResponse(MESSAGES.VENDOR_ANALYTICS_FETCHED_SUCCESSFULLY || "Vendor analytics fetched successfully"),
            { data: analyticsData }
        );
    } catch (error) {
        console.error("Error in getVendorAnalytics controller:", error);
        const errorMessage = error.message || "Error fetching vendor analytics";
        return HELPERS.responseHelper.createErrorResponse(errorMessage, ERROR_TYPES.SOMETHING_WENT_WRONG);
    }
};

module.exports = vendorAnalyticsController; 