const HELPERS = require("../helpers");
const { Op } = require("sequelize");
const { MESSAGES, ERROR_TYPES, PAGINATION } = require("../utils/constants");
const projectStageTaskModel = require("../models/projectStageTaskModel");
const projectStageModel = require("../models/projectStageModel");
const projectStageTaskDelayReasonModel = require("../models/projectStageTaskDelayReasonModel");
const { getPaginationResponse } = require("../utils/utils");

/**************************************************
 ************* Project Stage Task Controller *************
 **************************************************/
let projectStageTaskController = {};

/**
 * Function to create a project stage task
 * @param {*} payload
 * @returns
 */
projectStageTaskController.createProjectStageTask = async (payload) => {
    try {
        const {
            projectStageId,
            name,
            description,
            startDate,
            endDate,
            adminId,
            order,
            status
        } = payload;

        // Check if the project stage exists
        const projectStage = await projectStageModel.findOne({
            where: {
                id: projectStageId,
                isDeleted: { [Op.ne]: true }
            }
        });

        if (!projectStage) {
            return HELPERS.responseHelper.createErrorResponse(
                MESSAGES.PROJECT_STAGE_NOT_FOUND,
                ERROR_TYPES.DATA_NOT_FOUND
            );
        }

        // Create new project stage task
        const taskPayload = {
            projectStageId,
            name,
            description,
            startDate,
            endDate,
            adminId,
            order: order || 0,
            status: status || 'pending'
        };

        const task = await projectStageTaskModel.create(taskPayload);

        const response = {
            id: task?.id,
        };

        return Object.assign(
            HELPERS.responseHelper.createSuccessResponse(
                MESSAGES.PROJECT_STAGE_TASK_CREATED_SUCCESSFULLY
            ),
            { data: response }
        );
    } catch (error) {
        console.error("Error in createProjectStageTask:", error);
        throw HELPERS.responseHelper.createErrorResponse(
            error.message || error.msg || "Something went wrong",
            ERROR_TYPES.SOMETHING_WENT_WRONG
        );
    }
};

/**
 * Function to update a project stage task
 * @param {*} payload
 * @returns
 */
projectStageTaskController.updateProjectStageTask = async (payload) => {
    try {
        const {
            projectStageTaskId,
            name,
            description,
            startDate,
            endDate,
            adminId,
            order,
            status
        } = payload;

        // Check if the task exists
        const task = await projectStageTaskModel.findOne({
            where: {
                id: projectStageTaskId,
                isDeleted: { [Op.ne]: true }
            }
        });

        if (!task) {
            return HELPERS.responseHelper.createErrorResponse(
                MESSAGES.PROJECT_STAGE_TASK_NOT_FOUND,
                ERROR_TYPES.DATA_NOT_FOUND
            );
        }

        // Prepare update payload
        const updatePayload = {};
        if (name) updatePayload.name = name;
        if (description !== undefined) updatePayload.description = description;
        if (startDate) updatePayload.startDate = startDate;
        if (endDate) updatePayload.endDate = endDate;
        if (adminId !== undefined) updatePayload.adminId = adminId;
        if (order !== undefined) updatePayload.order = order;
        if (status) updatePayload.status = status;

        // Update the task
        await projectStageTaskModel.update(updatePayload, {
            where: { id: projectStageTaskId }
        });

        return Object.assign(
            HELPERS.responseHelper.createSuccessResponse(
                MESSAGES.PROJECT_STAGE_TASK_UPDATED_SUCCESSFULLY
            ),
            { data: null }
        );
    } catch (error) {
        console.error("Error in updateProjectStageTask:", error);
        throw HELPERS.responseHelper.createErrorResponse(
            error.message || error.msg || "Something went wrong",
            ERROR_TYPES.SOMETHING_WENT_WRONG
        );
    }
};

/**
 * Function to get project stage tasks list by stage ID
 * @param {*} payload
 * @returns
 */
projectStageTaskController.getProjectStageTasksList = async (payload) => {
    try {
        const { projectStageId, adminId, startDate, endDate, page, size } = payload;

        // Check if the project stage exists
        const projectStage = await projectStageModel.findOne({
            where: {
                id: projectStageId,
                isDeleted: { [Op.ne]: true }
            }
        });

        if (!projectStage) {
            return HELPERS.responseHelper.createErrorResponse(
                MESSAGES.PROJECT_STAGE_NOT_FOUND,
                ERROR_TYPES.DATA_NOT_FOUND
            );
        }

        const pageNo = page || PAGINATION.DEFAULT_PAGE;
        const pageLimit = size || PAGINATION.DEFAULT_PAGE_LIMIT;

        // Build where clause with projectStageId
        let whereClause = {
            projectStageId,
            isDeleted: { [Op.ne]: true }
        };

        // Add adminId filter if provided
        if (adminId) {
            whereClause.adminId = adminId;
        }

        // Add date range filters if provided
        if (startDate) {
            whereClause.endDate = {
                ...whereClause.endDate,
                [Op.gte]: new Date(startDate)
            };
        }

        if (endDate) {
            whereClause.startDate = {
                ...whereClause.startDate,
                [Op.lte]: new Date(endDate)
            };
        }

        const { count, rows } = await projectStageTaskModel.findAndCountAll({
            where: whereClause,
            order: [["order", "ASC"]],
            limit: pageLimit,
            offset: (pageNo - 1) * pageLimit,
            include: [
                {
                    model: projectStageTaskDelayReasonModel,
                    required: false,
                    where: {
                        isDeleted: { [Op.ne]: true }
                    }
                }
            ]
        });

        const paginationData = { count, pageNo, pageLimit, rows };
        const formattedResponse = getPaginationResponse(paginationData);

        return Object.assign(
            HELPERS.responseHelper.createSuccessResponse(
                MESSAGES.PROJECT_STAGE_TASK_LIST_SUCCESSFULLY
            ),
            formattedResponse
        );
    } catch (error) {
        console.error("Error in getProjectStageTasksList:", error);
        throw HELPERS.responseHelper.createErrorResponse(
            error.message || error.msg || "Something went wrong",
            ERROR_TYPES.SOMETHING_WENT_WRONG
        );
    }
};

/**
 * Function to get a project stage task by ID
 * @param {*} payload
 * @returns
 */
projectStageTaskController.getProjectStageTaskById = async (payload) => {
    try {
        const { projectStageTaskId } = payload;

        const task = await projectStageTaskModel.findOne({
            where: {
                id: projectStageTaskId,
                isDeleted: { [Op.ne]: true }
            },
            include: [
                {
                    model: projectStageTaskDelayReasonModel,
                    required: false,
                    where: {
                        isDeleted: { [Op.ne]: true }
                    }
                }
            ]
        });

        if (!task) {
            return HELPERS.responseHelper.createErrorResponse(
                MESSAGES.PROJECT_STAGE_TASK_NOT_FOUND,
                ERROR_TYPES.DATA_NOT_FOUND
            );
        }

        return Object.assign(
            HELPERS.responseHelper.createSuccessResponse(
                MESSAGES.PROJECT_STAGE_TASK_DETAILS_FETCHED_SUCCESSFULLY
            ),
            { data: task }
        );
    } catch (error) {
        console.error("Error in getProjectStageTaskById:", error);
        throw HELPERS.responseHelper.createErrorResponse(
            error.message || error.msg || "Something went wrong",
            ERROR_TYPES.SOMETHING_WENT_WRONG
        );
    }
};

/**
 * Function to delete a project stage task
 * @param {*} payload
 * @returns
 */
projectStageTaskController.deleteProjectStageTask = async (payload) => {
    try {
        const { projectStageTaskId } = payload;

        const task = await projectStageTaskModel.findOne({
            where: {
                id: projectStageTaskId,
                isDeleted: { [Op.ne]: true }
            }
        });

        if (!task) {
            return HELPERS.responseHelper.createErrorResponse(
                MESSAGES.PROJECT_STAGE_TASK_NOT_FOUND,
                ERROR_TYPES.DATA_NOT_FOUND
            );
        }

        await projectStageTaskModel.update(
            { isDeleted: true },
            { where: { id: projectStageTaskId } }
        );

        return Object.assign(
            HELPERS.responseHelper.createSuccessResponse(
                MESSAGES.PROJECT_STAGE_TASK_DELETED_SUCCESSFULLY
            ),
            { data: null }
        );
    } catch (error) {
        console.error("Error in deleteProjectStageTask:", error);
        throw HELPERS.responseHelper.createErrorResponse(
            error.message || error.msg || "Something went wrong",
            ERROR_TYPES.SOMETHING_WENT_WRONG
        );
    }
};

/**
 * Function to add a delay reason to a project stage task
 * @param {*} payload
 * @returns
 */
projectStageTaskController.addProjectStageTaskDelayReason = async (payload) => {
    try {
        const { projectStageTaskId, reason, originalEndDate } = payload;

        // Check if the task exists
        const task = await projectStageTaskModel.findOne({
            where: {
                id: projectStageTaskId,
                isDeleted: { [Op.ne]: true }
            }
        });

        if (!task) {
            return HELPERS.responseHelper.createErrorResponse(
                MESSAGES.PROJECT_STAGE_TASK_NOT_FOUND,
                ERROR_TYPES.DATA_NOT_FOUND
            );
        }

        // Create delay reason
        const delayReason = await projectStageTaskDelayReasonModel.create({
            projectStageTaskId,
            reason,
            originalEndDate
        });

        // Update task status to delayed
        await projectStageTaskModel.update(
            { status: 'delayed' },
            { where: { id: projectStageTaskId } }
        );

        return Object.assign(
            HELPERS.responseHelper.createSuccessResponse(
                MESSAGES.PROJECT_STAGE_TASK_DELAY_REASON_CREATED_SUCCESSFULLY
            ),
            { data: { id: delayReason.id } }
        );
    } catch (error) {
        console.error("Error in addProjectStageTaskDelayReason:", error);
        throw HELPERS.responseHelper.createErrorResponse(
            error.message || error.msg || "Something went wrong",
            ERROR_TYPES.SOMETHING_WENT_WRONG
        );
    }
};

module.exports = projectStageTaskController; 