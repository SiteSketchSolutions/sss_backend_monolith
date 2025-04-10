"use strict";
const { Joi } = require("../../utils/joiUtils");
const projectSubTaskController = require("../../controllers/projectSubTaskController");
const { PROJECT_STAGE_STATUS_LIST, PROJECT_STAGE_SUB_TASK_STATUS_LIST } = require("../../utils/constants");

let routes = [
    {
        method: "POST",
        path: "/v1/projectSubTask/create",
        joiSchemaForSwagger: {
            body: {
                projectStageTaskId: Joi.number().required().description("ID of the parent task"),
                name: Joi.string().required().description("Name of the sub-task"),
                description: Joi.string().description("Description of the sub-task"),
                startDate: Joi.date().required().description("Start date of the sub-task"),
                endDate: Joi.date().required().description("End date of the sub-task"),
                adminId: Joi.number().description("ID of the admin assigned to this sub-task"),
                order: Joi.number().description("Order/sequence of the sub-task (default: 0)"),
                status: Joi.string().valid(...Object.values(PROJECT_STAGE_SUB_TASK_STATUS_LIST)).default(PROJECT_STAGE_SUB_TASK_STATUS_LIST.PENDING)
                    .description("Status of the sub task stage (default: pending)")
            },
            group: "ProjectSubTask",
            description: "Route to create a project sub-task",
            model: "createProjectSubTask",
        },
        auth: false,
        handler: projectSubTaskController.createProjectSubTask,
    },
    {
        method: "PUT",
        path: "/v1/projectSubTask/update",
        joiSchemaForSwagger: {
            body: {
                projectSubTaskId: Joi.number().required().description("ID of the project sub-task"),
                name: Joi.string().description("Name of the sub-task"),
                description: Joi.string().description("Description of the sub-task"),
                startDate: Joi.date().description("Start date of the sub-task"),
                endDate: Joi.date().description("End date of the sub-task"),
                adminId: Joi.number().description("ID of the admin assigned to this sub-task"),
                order: Joi.number().description("Order/sequence of the sub-task"),
                status: Joi.string().valid(...Object.values(PROJECT_STAGE_SUB_TASK_STATUS_LIST)).default(PROJECT_STAGE_SUB_TASK_STATUS_LIST.PENDING)
                    .description("Status of the sub task stage (default: pending)")
            },
            group: "ProjectSubTask",
            description: "Route to update a project sub-task",
            model: "updateProjectSubTask",
        },
        auth: false,
        handler: projectSubTaskController.updateProjectSubTask,
    },
    {
        method: "GET",
        path: "/v1/projectSubTask/list",
        joiSchemaForSwagger: {
            query: {
                projectStageTaskId: Joi.number().required().description("ID of the parent task"),
                adminId: Joi.number().description("ID of the admin assigned to sub-tasks (optional)"),
                startDate: Joi.date().description("Filter tasks with endDate >= startDate (optional)"),
                endDate: Joi.date().description("Filter tasks with startDate <= endDate (optional)"),
                page: Joi.number().description("Page number for pagination"),
                size: Joi.number().description("Number of items per page")
            },
            group: "ProjectSubTask",
            description: "Route to list project sub-tasks",
            model: "getProjectSubTasksList",
        },
        auth: false,
        handler: projectSubTaskController.getProjectSubTasksList,
    },
    {
        method: "GET",
        path: "/v1/projectSubTask/details",
        joiSchemaForSwagger: {
            query: {
                projectSubTaskId: Joi.number().required().description("ID of the project sub-task")
            },
            group: "ProjectSubTask",
            description: "Route to get project sub-task details",
            model: "getProjectSubTaskById",
        },
        auth: false,
        handler: projectSubTaskController.getProjectSubTaskById,
    },
    {
        method: "DELETE",
        path: "/v1/projectSubTask",
        joiSchemaForSwagger: {
            body: {
                projectSubTaskId: Joi.number().required().description("ID of the project sub-task")
            },
            group: "ProjectSubTask",
            description: "Route to delete a project sub-task",
            model: "deleteProjectSubTask",
        },
        auth: false,
        handler: projectSubTaskController.deleteProjectSubTask,
    },
    {
        method: "POST",
        path: "/v1/projectSubTask/delayReason",
        joiSchemaForSwagger: {
            body: {
                projectSubTaskId: Joi.number().required().description("ID of the project sub-task"),
                reason: Joi.string().required().description("Reason for delay"),
                originalEndDate: Joi.date().required().description("Original end date before delay")
            },
            group: "ProjectSubTask",
            description: "Route to add a delay reason to a project sub-task",
            model: "addProjectSubTaskDelayReason",
        },
        auth: false,
        handler: projectSubTaskController.addProjectSubTaskDelayReason,
    },
    {
        method: "GET",
        path: "/v1/admin/tasks",
        joiSchemaForSwagger: {
            query: {
                adminId: Joi.number().required().description("ID of the admin to fetch tasks for"),
                startDate: Joi.date().description("Filter tasks with endDate >= startDate (optional)"),
                endDate: Joi.date().description("Filter tasks with startDate <= endDate (optional)"),
                page: Joi.number().description("Page number for pagination"),
                size: Joi.number().description("Number of items per page")
            },
            group: "Admin",
            description: "Route to get both tasks and subtasks assigned to an admin with date filtering",
            model: "getAdminTasksAndSubTasks",
        },
        auth: false,
        handler: projectSubTaskController.getAdminTasksAndSubTasks,
    }
];

module.exports = routes; 