const HELPERS = require("../helpers");
const { Op } = require("sequelize");
const { MESSAGES, ERROR_TYPES, PAGINATION } = require("../utils/constants");
const projectSubTaskModel = require("../models/projectSubTaskModel");
const projectStageTaskModel = require("../models/projectStageTaskModel");
const projectSubTaskDelayReasonModel = require("../models/projectSubTaskDelayReasonModel");
const { getPaginationResponse } = require("../utils/utils");
const projectStageModel = require("../models/projectStageModel");

/**************************************************
 ************* Project Sub Task Controller *************
 **************************************************/
let projectSubTaskController = {};

/**
 * Helper function to update task status based on subtasks
 * @param {Number} projectStageTaskId 
 */
const updateTaskStatusBasedOnSubtasks = async (projectStageTaskId) => {
    try {
        const subTasks = await projectSubTaskModel.findAll({
            where: {
                projectStageTaskId,
                isDeleted: { [Op.ne]: true }
            }
        });

        if (subTasks.length === 0) return;

        // Determine parent task status based on subtask statuses
        let taskStatus = 'pending';
        const completedSubTasks = subTasks.filter(subTask => subTask.status === 'completed');

        if (completedSubTasks.length === subTasks.length) {
            taskStatus = 'completed';
        } else if (subTasks.some(subTask => subTask.status === 'in_progress' || subTask.status === 'delayed')) {
            taskStatus = 'in_progress';
        } else if (subTasks.some(subTask => subTask.status === 'cancelled')) {
            // Only set to cancelled if all subtasks are cancelled
            const cancelledCount = subTasks.filter(subTask => subTask.status === 'cancelled').length;
            if (cancelledCount === subTasks.length) {
                taskStatus = 'cancelled';
            }
        }

        // Update the parent task
        await projectStageTaskModel.update(
            { status: taskStatus },
            { where: { id: projectStageTaskId } }
        );

        // Get the updated task to update the parent stage
        const updatedTask = await projectStageTaskModel.findByPk(projectStageTaskId);
        if (updatedTask) {
            // Find the task's controller and call its update function
            const projectStageTaskController = require('./projectStageTaskController');
            await projectStageTaskController.updateProjectStageStatusAndPercentage(updatedTask.projectStageId);
        }
    } catch (error) {
        console.error("Error in updateTaskStatusBasedOnSubtasks:", error);
    }
};

/**
 * Function to create a project sub task
 * @param {*} payload
 * @returns
 */
projectSubTaskController.createProjectSubTask = async (payload) => {
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

        // Check if the parent task exists
        const parentTask = await projectStageTaskModel.findOne({
            where: {
                id: projectStageTaskId,
                isDeleted: { [Op.ne]: true }
            }
        });

        if (!parentTask) {
            return HELPERS.responseHelper.createErrorResponse(
                MESSAGES.PROJECT_STAGE_TASK_NOT_FOUND,
                ERROR_TYPES.DATA_NOT_FOUND
            );
        }

        // Create new project sub task
        const subTaskPayload = {
            projectStageTaskId,
            name,
            description,
            startDate,
            endDate,
            adminId,
            order: order || 0,
            status: status || 'pending'
        };

        const subTask = await projectSubTaskModel.create(subTaskPayload);

        // Update the parent task status
        await updateTaskStatusBasedOnSubtasks(projectStageTaskId);

        const response = {
            id: subTask?.id,
        };

        return Object.assign(
            HELPERS.responseHelper.createSuccessResponse(
                MESSAGES.PROJECT_SUB_TASK_CREATED_SUCCESSFULLY
            ),
            { data: response }
        );
    } catch (error) {
        console.error("Error in createProjectSubTask:", error);
        throw HELPERS.responseHelper.createErrorResponse(
            error.message || error.msg || "Something went wrong",
            ERROR_TYPES.SOMETHING_WENT_WRONG
        );
    }
};

/**
 * Function to update a project sub task
 * @param {*} payload
 * @returns
 */
projectSubTaskController.updateProjectSubTask = async (payload) => {
    try {
        const {
            projectSubTaskId,
            name,
            description,
            startDate,
            endDate,
            adminId,
            order,
            status
        } = payload;

        // Check if the sub task exists
        const subTask = await projectSubTaskModel.findOne({
            where: {
                id: projectSubTaskId,
                isDeleted: { [Op.ne]: true }
            }
        });

        if (!subTask) {
            return HELPERS.responseHelper.createErrorResponse(
                MESSAGES.PROJECT_SUB_TASK_NOT_FOUND,
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

        // Update the sub task
        await projectSubTaskModel.update(updatePayload, {
            where: { id: projectSubTaskId }
        });

        // Update the parent task status
        await updateTaskStatusBasedOnSubtasks(subTask.projectStageTaskId);

        return Object.assign(
            HELPERS.responseHelper.createSuccessResponse(
                MESSAGES.PROJECT_SUB_TASK_UPDATED_SUCCESSFULLY
            ),
            { data: null }
        );
    } catch (error) {
        console.error("Error in updateProjectSubTask:", error);
        throw HELPERS.responseHelper.createErrorResponse(
            error.message || error.msg || "Something went wrong",
            ERROR_TYPES.SOMETHING_WENT_WRONG
        );
    }
};

/**
 * Function to get project sub tasks list by parent task ID
 * @param {*} payload
 * @returns
 */
projectSubTaskController.getProjectSubTasksList = async (payload) => {
    try {
        const { projectStageTaskId, adminId, startDate, endDate, page, size } = payload;

        // Check if the parent task exists
        const parentTask = await projectStageTaskModel.findOne({
            where: {
                id: projectStageTaskId,
                isDeleted: { [Op.ne]: true }
            }
        });

        if (!parentTask) {
            return HELPERS.responseHelper.createErrorResponse(
                MESSAGES.PROJECT_STAGE_TASK_NOT_FOUND,
                ERROR_TYPES.DATA_NOT_FOUND
            );
        }

        const pageNo = page || PAGINATION.DEFAULT_PAGE;
        const pageLimit = size || PAGINATION.DEFAULT_PAGE_LIMIT;

        // Build where clause with projectStageTaskId
        let whereClause = {
            projectStageTaskId,
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

        const { count, rows } = await projectSubTaskModel.findAndCountAll({
            where: whereClause,
            order: [["order", "ASC"]],
            limit: pageLimit,
            offset: (pageNo - 1) * pageLimit,
            include: [
                {
                    model: projectSubTaskDelayReasonModel,
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
                MESSAGES.PROJECT_SUB_TASK_LIST_SUCCESSFULLY
            ),
            formattedResponse
        );
    } catch (error) {
        console.error("Error in getProjectSubTasksList:", error);
        throw HELPERS.responseHelper.createErrorResponse(
            error.message || error.msg || "Something went wrong",
            ERROR_TYPES.SOMETHING_WENT_WRONG
        );
    }
};

/**
 * Function to get a project sub task by ID
 * @param {*} payload
 * @returns
 */
projectSubTaskController.getProjectSubTaskById = async (payload) => {
    try {
        const { projectSubTaskId } = payload;

        const subTask = await projectSubTaskModel.findOne({
            where: {
                id: projectSubTaskId,
                isDeleted: { [Op.ne]: true }
            },
            include: [
                {
                    model: projectSubTaskDelayReasonModel,
                    required: false,
                    where: {
                        isDeleted: { [Op.ne]: true }
                    }
                }
            ]
        });

        if (!subTask) {
            return HELPERS.responseHelper.createErrorResponse(
                MESSAGES.PROJECT_SUB_TASK_NOT_FOUND,
                ERROR_TYPES.DATA_NOT_FOUND
            );
        }

        return Object.assign(
            HELPERS.responseHelper.createSuccessResponse(
                MESSAGES.PROJECT_SUB_TASK_DETAILS_FETCHED_SUCCESSFULLY
            ),
            { data: subTask }
        );
    } catch (error) {
        console.error("Error in getProjectSubTaskById:", error);
        throw HELPERS.responseHelper.createErrorResponse(
            error.message || error.msg || "Something went wrong",
            ERROR_TYPES.SOMETHING_WENT_WRONG
        );
    }
};

/**
 * Function to delete a project sub task
 * @param {*} payload
 * @returns
 */
projectSubTaskController.deleteProjectSubTask = async (payload) => {
    try {
        const { projectSubTaskId } = payload;

        const subTask = await projectSubTaskModel.findOne({
            where: {
                id: projectSubTaskId,
                isDeleted: { [Op.ne]: true }
            }
        });

        if (!subTask) {
            return HELPERS.responseHelper.createErrorResponse(
                MESSAGES.PROJECT_SUB_TASK_NOT_FOUND,
                ERROR_TYPES.DATA_NOT_FOUND
            );
        }

        await projectSubTaskModel.update(
            { isDeleted: true },
            { where: { id: projectSubTaskId } }
        );

        // Update the parent task status
        await updateTaskStatusBasedOnSubtasks(subTask.projectStageTaskId);

        return Object.assign(
            HELPERS.responseHelper.createSuccessResponse(
                MESSAGES.PROJECT_SUB_TASK_DELETED_SUCCESSFULLY
            ),
            { data: null }
        );
    } catch (error) {
        console.error("Error in deleteProjectSubTask:", error);
        throw HELPERS.responseHelper.createErrorResponse(
            error.message || error.msg || "Something went wrong",
            ERROR_TYPES.SOMETHING_WENT_WRONG
        );
    }
};

/**
 * Function to add a delay reason to a project sub task
 * @param {*} payload
 * @returns
 */
projectSubTaskController.addProjectSubTaskDelayReason = async (payload) => {
    try {
        const { projectSubTaskId, reason, originalEndDate } = payload;

        // Check if the sub task exists
        const subTask = await projectSubTaskModel.findOne({
            where: {
                id: projectSubTaskId,
                isDeleted: { [Op.ne]: true }
            }
        });

        if (!subTask) {
            return HELPERS.responseHelper.createErrorResponse(
                MESSAGES.PROJECT_SUB_TASK_NOT_FOUND,
                ERROR_TYPES.DATA_NOT_FOUND
            );
        }

        // Create delay reason
        const delayReason = await projectSubTaskDelayReasonModel.create({
            projectSubTaskId,
            reason,
            originalEndDate
        });

        // Update sub task status to delayed
        await projectSubTaskModel.update(
            { status: 'delayed' },
            { where: { id: projectSubTaskId } }
        );

        return Object.assign(
            HELPERS.responseHelper.createSuccessResponse(
                MESSAGES.PROJECT_SUB_TASK_DELAY_REASON_CREATED_SUCCESSFULLY
            ),
            { data: { id: delayReason.id } }
        );
    } catch (error) {
        console.error("Error in addProjectSubTaskDelayReason:", error);
        throw HELPERS.responseHelper.createErrorResponse(
            error.message || error.msg || "Something went wrong",
            ERROR_TYPES.SOMETHING_WENT_WRONG
        );
    }
};

/**
 * Function to get both tasks and subtasks for an admin with date filtering
 * @param {*} payload
 * @returns
 */
projectSubTaskController.getAdminTasksAndSubTasks = async (payload) => {
    try {
        const { adminId, startDate, endDate, page, size } = payload;

        // Set up pagination
        const pageNo = page || PAGINATION.DEFAULT_PAGE;
        const pageLimit = size || PAGINATION.DEFAULT_PAGE_LIMIT;

        // Build where clause for tasks and subtasks
        let whereClause = {
            adminId,
            isDeleted: { [Op.ne]: true }
        };

        // Add date filters if provided
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

        // Get tasks first
        const taskResults = await projectStageTaskModel.findAndCountAll({
            where: whereClause,
            order: [
                ['endDate', 'ASC'],
                ['order', 'ASC']
            ],
            include: [
                {
                    model: projectStageModel,
                    attributes: ['id', 'name', 'projectId'],
                    where: {
                        isDeleted: { [Op.ne]: true }
                    }
                }
            ]
        });

        // Get subtasks
        const subtaskResults = await projectSubTaskModel.findAndCountAll({
            where: whereClause,
            order: [
                ['endDate', 'ASC'],
                ['order', 'ASC']
            ],
            include: [
                {
                    model: projectStageTaskModel,
                    attributes: ['id', 'name', 'projectStageId'],
                    where: {
                        isDeleted: { [Op.ne]: true }
                    },
                    include: [
                        {
                            model: projectStageModel,
                            attributes: ['id', 'name', 'projectId'],
                            where: {
                                isDeleted: { [Op.ne]: true }
                            }
                        }
                    ]
                }
            ]
        });

        // Combine the results
        const totalCount = taskResults.count + subtaskResults.count;

        // Apply pagination to the combined results
        const combinedResults = [
            ...taskResults.rows.map(task => ({
                id: task.id,
                name: task.name,
                description: task.description,
                startDate: task.startDate,
                endDate: task.endDate,
                status: task.status,
                type: 'task',
                projectStage: task.projectStage ? {
                    id: task.projectStage.id,
                    name: task.projectStage.name,
                    projectId: task.projectStage.projectId
                } : null,
                parentTask: null
            })),
            ...subtaskResults.rows.map(subtask => ({
                id: subtask.id,
                name: subtask.name,
                description: subtask.description,
                startDate: subtask.startDate,
                endDate: subtask.endDate,
                status: subtask.status,
                type: 'subtask',
                projectStage: subtask.projectStageTask?.projectStage ? {
                    id: subtask.projectStageTask.projectStage.id,
                    name: subtask.projectStageTask.projectStage.name,
                    projectId: subtask.projectStageTask.projectStage.projectId
                } : null,
                parentTask: subtask.projectStageTask ? {
                    id: subtask.projectStageTask.id,
                    name: subtask.projectStageTask.name
                } : null
            }))
        ];

        // Sort the combined results by endDate
        const sortedResults = combinedResults.sort((a, b) => {
            return new Date(a.endDate) - new Date(b.endDate);
        });

        // Apply pagination after combining
        const startIndex = (pageNo - 1) * pageLimit;
        const paginatedResults = sortedResults.slice(startIndex, startIndex + pageLimit);

        const paginationData = {
            count: totalCount,
            pageNo,
            pageLimit,
            rows: paginatedResults
        };
        const formattedResponse = getPaginationResponse(paginationData);

        return Object.assign(
            HELPERS.responseHelper.createSuccessResponse(
                "Admin tasks and subtasks fetched successfully"
            ),
            formattedResponse
        );
    } catch (error) {
        console.error("Error in getAdminTasksAndSubTasks:", error);
        throw HELPERS.responseHelper.createErrorResponse(
            error.message || error.msg || "Something went wrong",
            ERROR_TYPES.SOMETHING_WENT_WRONG
        );
    }
};

module.exports = projectSubTaskController; 