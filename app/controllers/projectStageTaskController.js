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
 * Helper function to update project stage status and percentage based on tasks
 * @param {Number} projectStageId 
 */
projectStageTaskController.updateProjectStageStatusAndPercentage = async (projectStageId) => {
    try {
        const tasks = await projectStageTaskModel.findAll({
            where: {
                projectStageId,
                isDeleted: { [Op.ne]: true }
            }
        });

        if (tasks.length === 0) return;

        // Calculate percentage of completed tasks
        const completedTasks = tasks.filter(task => task.status === 'completed');
        // Calculate percentage as a number (0-100)
        const percentageValue = (completedTasks.length / tasks.length) * 100;
        // Format to two decimal places for storage in database
        const percentage = parseFloat(percentageValue.toFixed(2));

        // Determine stage status based on task statuses
        let stageStatus = 'pending';

        // Count different statuses
        const hasCompleted = tasks.some(task => task.status === 'completed');
        const hasInProgress = tasks.some(task => task.status === 'in_progress');
        const hasDelayed = tasks.some(task => task.status === 'delayed');
        const hasPending = tasks.some(task => task.status === 'pending');
        const hasCancelled = tasks.some(task => task.status === 'cancelled');

        // If all tasks are completed, mark as completed
        if (completedTasks.length === tasks.length) {
            stageStatus = 'completed';
        }
        // If any task is in progress or delayed, or if we have a mix of pending and completed tasks
        else if (hasInProgress || hasDelayed || (hasCompleted && hasPending)) {
            stageStatus = 'in_progress';
        }
        // If all tasks are cancelled, mark as cancelled
        else if (hasCancelled && tasks.length === tasks.filter(task => task.status === 'cancelled').length) {
            stageStatus = 'cancelled';
        }
        // Otherwise, it remains pending (all tasks are pending)

        // Update the project stage - pass percentage as a number
        await projectStageModel.update(
            {
                percentage: percentage,
                status: stageStatus
            },
            { where: { id: projectStageId } }
        );

        // After updating the stage, also update the project
        // First, get the updated stage with project ID
        const updatedStage = await projectStageModel.findByPk(projectStageId);
        if (updatedStage) {
            // Import and call the projectStageController's update function
            const projectStageController = require('./projectStageController');
            await projectStageController.updateProjectPercentage(updatedStage.projectId);
        }
    } catch (error) {
        console.error("Error in updateProjectStageStatusAndPercentage:", error);
    }
};

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
            status,
            urls
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

        // Check if a task with the same order already exists in this project stage
        const existingTaskWithOrder = await projectStageTaskModel.findOne({
            where: {
                projectStageId,
                order: order || 0,
                isDeleted: { [Op.ne]: true }
            }
        });

        if (existingTaskWithOrder) {
            return HELPERS.responseHelper.createErrorResponse(
                "A task with this order already exists in the project stage",
                ERROR_TYPES.ALREADY_EXISTS
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
            status: status || 'pending',
        };
        if (urls && Array.isArray(urls)) {
            taskPayload.images = urls;
        } else if (urls) {
            // Handle backward compatibility if a single URL is sent
            taskPayload.images = [urls];
        }

        const task = await projectStageTaskModel.create(taskPayload);

        // Update the parent stage status and percentage
        await projectStageTaskController.updateProjectStageStatusAndPercentage(projectStageId);

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
            status,
            urls
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

        if (urls && Array.isArray(urls)) {
            // If urls is an empty array, set images to an empty array
            // If urls has items, merge new URLs with existing images, removing duplicates
            updatePayload.images = urls.length === 0 ? [] : [...new Set([...(task?.images || []), ...urls])];
        }
        // Update the task
        await projectStageTaskModel.update(updatePayload, {
            where: { id: projectStageTaskId }
        });

        // Update the parent stage status and percentage
        await projectStageTaskController.updateProjectStageStatusAndPercentage(task.projectStageId);

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

        // Update the parent stage status and percentage
        await projectStageTaskController.updateProjectStageStatusAndPercentage(task.projectStageId);

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