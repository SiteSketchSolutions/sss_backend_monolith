const HELPERS = require("../helpers");
const { Op } = require("sequelize");
const { MESSAGES, ERROR_TYPES } = require("../utils/constants");
const userSessionModel = require("../models/userSessionModel");
const sequelize = require("../startup/dbConfig");

/**************************************************
 ***************** User Session controller ***************
 **************************************************/
let userSessionController = {};

/**
 * Function to track user session
 * @param {*} payload
 * @returns
 */
userSessionController.trackUserSession = async (payload) => {
    try {
        const { userId, deviceInfo, ipAddress } = payload;

        // Create session payload
        const sessionPayload = {
            userId,
            deviceInfo: deviceInfo || null,
            ipAddress: ipAddress || null,
            sessionStartTime: new Date()
        };

        // Create a new session record
        const session = await userSessionModel.create(sessionPayload);

        return Object.assign(
            HELPERS.responseHelper.createSuccessResponse(
                MESSAGES.SESSION_TRACKED_SUCCESSFULLY
            ),
            { data: { sessionId: session.id } }
        );
    } catch (error) {
        throw HELPERS.responseHelper.createErrorResponse(
            error.message || error.msg,
            ERROR_TYPES.SOMETHING_WENT_WRONG
        );
    }
};

/**
 * Function to get user session analytics
 * @param {*} payload
 * @returns
 */
userSessionController.getUserSessionAnalytics = async (payload) => {
    try {
        const { userId, startDate, endDate } = payload;

        // Build query conditions
        let whereConditions = {
            isDeleted: { [Op.ne]: true }
        };

        if (userId) {
            whereConditions.userId = userId;
        }

        if (startDate && endDate) {
            whereConditions.sessionStartTime = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        } else if (startDate) {
            whereConditions.sessionStartTime = {
                [Op.gte]: new Date(startDate)
            };
        } else if (endDate) {
            whereConditions.sessionStartTime = {
                [Op.lte]: new Date(endDate)
            };
        }

        // Get session count
        const sessionCount = await userSessionModel.count({
            where: whereConditions
        });

        // Get sessions grouped by day
        const sessions = await userSessionModel.findAll({
            where: whereConditions,
            attributes: [
                [sequelize.fn('DATE', sequelize.col('sessionStartTime')), 'date'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: [sequelize.fn('DATE', sequelize.col('sessionStartTime'))],
            order: [[sequelize.fn('DATE', sequelize.col('sessionStartTime')), 'ASC']]
        });

        return Object.assign(
            HELPERS.responseHelper.createSuccessResponse(
                MESSAGES.SESSION_ANALYTICS_FETCHED_SUCCESSFULLY
            ),
            {
                data: {
                    totalSessions: sessionCount,
                    sessionsByDate: sessions
                }
            }
        );
    } catch (error) {
        throw HELPERS.responseHelper.createErrorResponse(
            error.message || error.msg,
            ERROR_TYPES.SOMETHING_WENT_WRONG
        );
    }
};

module.exports = userSessionController; 