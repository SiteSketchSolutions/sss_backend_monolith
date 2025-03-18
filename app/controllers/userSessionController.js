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
 * Function to get user sessions
 * @param {*} payload
 * @returns List of sessions
 */
userSessionController.getSessions = async (payload) => {
    try {
        const { userId, date } = payload;

        // Build query conditions
        let whereConditions = {
            isDeleted: { [Op.ne]: true }
        };

        // Add userId filter if provided
        if (userId) {
            whereConditions.userId = userId;
        }

        // Add date filter if provided
        if (date) {
            const targetDate = new Date(date);
            const startOfDay = new Date(targetDate);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(targetDate);
            endOfDay.setHours(23, 59, 59, 999);

            whereConditions.createdAt = {
                [Op.between]: [startOfDay, endOfDay]
            };
        }

        // Get all sessions matching the conditions
        const sessions = await userSessionModel.findAll({
            where: whereConditions,
            order: [['createdAt', 'DESC']]
        });

        return Object.assign(
            HELPERS.responseHelper.createSuccessResponse(
                MESSAGES.SESSION_LIST_FETCHED_SUCCESSFULLY
            ),
            {
                data: sessions
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