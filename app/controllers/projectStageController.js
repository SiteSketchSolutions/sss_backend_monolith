const HELPERS = require("../helpers");
const { Op } = require("sequelize");
const { MESSAGES, ERROR_TYPES, PAGINATION } = require("../utils/constants");
const projectStageModel = require("../models/projectStageModel");
const projectStageDelayReasonModel = require("../models/projectStageDelayReasonModel");
const projectModel = require("../models/projectModel");
const { getPaginationResponse } = require("../utils/utils");

/**************************************************
 ***************** Project Stage Controller ***************
 **************************************************/
let projectStageController = {};

/**
 * Function to create a project stage
 * @param {*} payload
 * @returns
 */
projectStageController.createProjectStage = async (payload) => {
    try {
        const {
            projectId,
            name,
            description,
            startDate,
            endDate,
            order,
            percentage,
            status
        } = payload;

        // Check if the project exists
        const project = await projectModel.findOne({
            where: {
                id: projectId,
                isDeleted: { [Op.ne]: true }
            }
        });

        if (!project) {
            return HELPERS.responseHelper.createErrorResponse(
                "Project not found",
                ERROR_TYPES.DATA_NOT_FOUND
            );
        }

        // Check if a stage with the same name already exists for this project
        const existingStage = await projectStageModel.findOne({
            where: {
                projectId,
                name,
                isDeleted: { [Op.ne]: true }
            }
        });

        if (existingStage) {
            return HELPERS.responseHelper.createErrorResponse(
                MESSAGES.PROJECT_STAGE_ALREADY_EXISTS,
                ERROR_TYPES.ALREADY_EXISTS
            );
        }

        // Create new project stage
        const projectStagePayload = {
            projectId,
            name,
            description,
            startDate,
            endDate,
            order: order || 0,
            percentage: percentage || 0,
            status: status || 'pending'
        };

        const projectStage = await projectStageModel.create(projectStagePayload);

        const response = {
            id: projectStage?.id,
        };

        await projectStageController.updateProjectPercentage(projectStage.projectId);

        return Object.assign(
            HELPERS.responseHelper.createSuccessResponse(
                MESSAGES.PROJECT_STAGE_CREATED_SUCCESSFULLY
            ),
            { data: response }
        );
    } catch (error) {
        console.error("Error in createProjectStage:", error);
        throw HELPERS.responseHelper.createErrorResponse(
            error.message || error.msg || "Something went wrong",
            ERROR_TYPES.SOMETHING_WENT_WRONG
        );
    }
};

/**
 * Function to update a project stage
 * @param {*} payload
 * @returns
 */
projectStageController.updateProjectStage = async (payload) => {
    try {
        const {
            projectStageId,
            name,
            description,
            startDate,
            endDate,
            order,
            percentage,
            status
        } = payload;

        // Check if the stage exists
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

        // If name is changing, check if the new name is already used for another stage in this project
        if (name && name !== projectStage.name) {
            const existingStage = await projectStageModel.findOne({
                where: {
                    projectId: projectStage.projectId,
                    name,
                    id: { [Op.ne]: projectStageId },
                    isDeleted: { [Op.ne]: true }
                }
            });

            if (existingStage) {
                return HELPERS.responseHelper.createErrorResponse(
                    MESSAGES.PROJECT_STAGE_ALREADY_EXISTS,
                    ERROR_TYPES.ALREADY_EXISTS
                );
            }
        }

        // Prepare update payload
        const updatePayload = {};
        if (name) updatePayload.name = name;
        if (description !== undefined) updatePayload.description = description;
        if (startDate) updatePayload.startDate = startDate;
        if (endDate) updatePayload.endDate = endDate;
        if (order !== undefined) updatePayload.order = order;
        if (percentage !== undefined) updatePayload.percentage = percentage;
        if (status) updatePayload.status = status;

        // Update the project stage
        await projectStageModel.update(updatePayload, {
            where: { id: projectStageId }
        });

        await projectStageController.updateProjectPercentage(projectStage.projectId);

        return Object.assign(
            HELPERS.responseHelper.createSuccessResponse(
                MESSAGES.PROJECT_STAGE_UPDATED_SUCCESSFULLY
            ),
            { data: null }
        );
    } catch (error) {
        console.error("Error in updateProjectStage:", error);
        throw HELPERS.responseHelper.createErrorResponse(
            error.message || error.msg || "Something went wrong",
            ERROR_TYPES.SOMETHING_WENT_WRONG
        );
    }
};

/**
 * Function to get project stages list by project ID
 * @param {*} payload
 * @returns
 */
projectStageController.getProjectStagesList = async (payload) => {
    try {
        const { projectId, page, size } = payload;

        // Check if the project exists
        const project = await projectModel.findOne({
            where: {
                id: projectId,
                isDeleted: { [Op.ne]: true }
            }
        });

        if (!project) {
            return HELPERS.responseHelper.createErrorResponse(
                "Project not found",
                ERROR_TYPES.DATA_NOT_FOUND
            );
        }

        const pageNo = page || PAGINATION.DEFAULT_PAGE;
        const pageLimit = size || PAGINATION.DEFAULT_PAGE_LIMIT;

        const { count, rows } = await projectStageModel.findAndCountAll({
            where: {
                projectId,
                isDeleted: { [Op.ne]: true }
            },
            order: [["order", "ASC"]],
            limit: pageLimit,
            offset: (pageNo - 1) * pageLimit,
            include: [
                {
                    model: projectStageDelayReasonModel,
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
                MESSAGES.PROJECT_STAGE_LIST_SUCCESSFULLY
            ),
            formattedResponse
        );
    } catch (error) {
        console.error("Error in getProjectStagesList:", error);
        throw HELPERS.responseHelper.createErrorResponse(
            error.message || error.msg || "Something went wrong",
            ERROR_TYPES.SOMETHING_WENT_WRONG
        );
    }
};

/**
 * Function to get a project stage by ID
 * @param {*} payload
 * @returns
 */
projectStageController.getProjectStageById = async (payload) => {
    try {
        const { projectStageId } = payload;

        const projectStage = await projectStageModel.findOne({
            where: {
                id: projectStageId,
                isDeleted: { [Op.ne]: true }
            },
            include: [
                {
                    model: projectStageDelayReasonModel,
                    required: false,
                    where: {
                        isDeleted: { [Op.ne]: true }
                    }
                }
            ]
        });

        if (!projectStage) {
            return HELPERS.responseHelper.createErrorResponse(
                MESSAGES.PROJECT_STAGE_NOT_FOUND,
                ERROR_TYPES.DATA_NOT_FOUND
            );
        }

        return Object.assign(
            HELPERS.responseHelper.createSuccessResponse(
                MESSAGES.PROJECT_STAGE_DETAILS_FETCHED_SUCCESSFULLY
            ),
            { data: projectStage }
        );
    } catch (error) {
        console.error("Error in getProjectStageById:", error);
        throw HELPERS.responseHelper.createErrorResponse(
            error.message || error.msg || "Something went wrong",
            ERROR_TYPES.SOMETHING_WENT_WRONG
        );
    }
};

/**
 * Function to delete a project stage
 * @param {*} payload
 * @returns
 */
projectStageController.deleteProjectStage = async (payload) => {
    try {
        const { projectStageId } = payload;

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

        await projectStageModel.update(
            { isDeleted: true },
            { where: { id: projectStageId } }
        );

        await projectStageController.updateProjectPercentage(projectStage.projectId);

        return Object.assign(
            HELPERS.responseHelper.createSuccessResponse(
                MESSAGES.PROJECT_STAGE_DELETED_SUCCESSFULLY
            ),
            { data: null }
        );
    } catch (error) {
        console.error("Error in deleteProjectStage:", error);
        throw HELPERS.responseHelper.createErrorResponse(
            error.message || error.msg || "Something went wrong",
            ERROR_TYPES.SOMETHING_WENT_WRONG
        );
    }
};

/**
 * Function to add a delay reason to a project stage
 * @param {*} payload
 * @returns
 */
projectStageController.addProjectStageDelayReason = async (payload) => {
    try {
        const { projectStageId, reason, originalEndDate } = payload;

        // Check if the stage exists
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

        // Create delay reason
        const delayReason = await projectStageDelayReasonModel.create({
            projectStageId,
            reason,
            originalEndDate
        });

        // Update stage status to delayed
        await projectStageModel.update(
            { status: 'delayed' },
            { where: { id: projectStageId } }
        );

        await projectStageController.updateProjectPercentage(projectStage.projectId);

        return Object.assign(
            HELPERS.responseHelper.createSuccessResponse(
                MESSAGES.PROJECT_STAGE_DELAY_REASON_CREATED_SUCCESSFULLY
            ),
            { data: { id: delayReason.id } }
        );
    } catch (error) {
        console.error("Error in addProjectStageDelayReason:", error);
        throw HELPERS.responseHelper.createErrorResponse(
            error.message || error.msg || "Something went wrong",
            ERROR_TYPES.SOMETHING_WENT_WRONG
        );
    }
};

/**
 * Helper function to update project percentage of completion based on stages
 * @param {Number} projectId 
 */
projectStageController.updateProjectPercentage = async (projectId) => {
    try {
        const stages = await projectStageModel.findAll({
            where: {
                projectId,
                isDeleted: { [Op.ne]: true }
            }
        });

        if (stages.length === 0) return;

        // Calculate percentage based on stage completion percentages
        const totalPercentage = stages.reduce((sum, stage) => {
            // Convert percentage to number before adding
            const percentageValue = parseFloat(stage.percentage || 0);
            return sum + percentageValue;
        }, 0);

        const averagePercentage = (totalPercentage / stages.length).toFixed(2);

        // Determine project status based on stage statuses
        let projectStatus = 'pending';

        // Count different statuses
        const hasCompleted = stages.some(stage => stage.status === 'completed');
        const hasInProgress = stages.some(stage => stage.status === 'in_progress');
        const hasDelayed = stages.some(stage => stage.status === 'delayed');
        const hasPending = stages.some(stage => stage.status === 'pending');
        const hasCancelled = stages.some(stage => stage.status === 'cancelled');

        // If all stages are completed, mark as completed
        if (stages.length === stages.filter(stage => stage.status === 'completed').length) {
            projectStatus = 'completed';
        }
        // If any stage is in progress or delayed, or if we have a mix of pending and completed stages
        else if (hasInProgress || hasDelayed || (hasCompleted && hasPending)) {
            projectStatus = 'in_progress';
        }
        // If all stages are cancelled, mark as cancelled
        else if (hasCancelled && stages.length === stages.filter(stage => stage.status === 'cancelled').length) {
            projectStatus = 'cancelled';
        }
        // Otherwise, it remains pending (all stages are pending)

        // Update the project
        await projectModel.update(
            {
                percentageOfCompletion: averagePercentage.toString(),
                status: projectStatus
            },
            { where: { id: projectId } }
        );
    } catch (error) {
        console.error("Error in updateProjectPercentage:", error);
    }
};

module.exports = projectStageController; 