"use strict";
const HELPERS = require("../helpers");
const { MESSAGES, ERROR_TYPES } = require('../utils/constants');
const projectAnalyticsService = require("../services/projectAnalyticsService");

/**************************************************
 ********* PROJECT ANALYTICS CONTROLLER ***********
 **************************************************/
let projectAnalyticsController = {};

/**
 * Get project financial analytics
 * @param {*} payload 
 * @returns 
 */
projectAnalyticsController.getProjectAnalytics = async (payload) => {
    try {
        const { projectId } = payload;

        if (!projectId) {
            return HELPERS.responseHelper.createErrorResponse("Project ID is required", ERROR_TYPES.BAD_REQUEST);
        }

        const analyticsData = await projectAnalyticsService.getProjectAnalytics(projectId);

        return Object.assign(
            HELPERS.responseHelper.createSuccessResponse(MESSAGES.PROJECT_ANALYTICS_FETCHED_SUCCESSFULLY || "Project analytics fetched successfully"),
            { data: analyticsData }
        );
    } catch (error) {
        console.error("Error in getProjectAnalytics controller:", error);
        const errorMessage = error.message || "Error fetching project analytics";
        return HELPERS.responseHelper.createErrorResponse(errorMessage, ERROR_TYPES.SOMETHING_WENT_WRONG);
    }
};

/* export projectAnalyticsController */
module.exports = projectAnalyticsController; 