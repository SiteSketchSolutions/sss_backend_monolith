"use strict";
const { Joi } = require("../../utils/joiUtils");
const projectStageTaskController = require("../../controllers/projectStageTaskController");
const { PROJECT_STAGE_STATUS_LIST, PROJECT_STAGE_TASK_STATUS_LIST } = require("../../utils/constants");

let routes = [
    {
        method: "POST",
        path: "/v1/projectStageTask/create",
        joiSchemaForSwagger: {
            body: {
                projectStageId: Joi.number().required().description("ID of the project stage"),
                name: Joi.string().required().description("Name of the task"),
                description: Joi.string().allow('').description("Description of the task"),
                startDate: Joi.date().required().description("Start date of the task"),
                endDate: Joi.date().required().description("End date of the task"),
                adminId: Joi.number().description("ID of the admin assigned to this task"),
                order: Joi.number().description("Order/sequence of the task (default: 0)"),
                status: Joi.string().valid(...Object.values(PROJECT_STAGE_TASK_STATUS_LIST)).default(PROJECT_STAGE_TASK_STATUS_LIST.PENDING)
                    .description("Status of the task (default: pending)"),
                urls: Joi.array().items(Joi.string()).description("Array of project stage task image URLs")
            },
            group: "ProjectStageTask",
            description: "Route to create a project stage task",
            model: "createProjectStageTask",
        },
        auth: false,
        handler: projectStageTaskController.createProjectStageTask,
    },
    {
        method: "PUT",
        path: "/v1/projectStageTask/update",
        joiSchemaForSwagger: {
            body: {
                projectStageTaskId: Joi.number().required().description("ID of the project stage task"),
                name: Joi.string().description("Name of the task"),
                description: Joi.string().allow('').description("Description of the task"),
                startDate: Joi.date().description("Start date of the task"),
                endDate: Joi.date().description("End date of the task"),
                adminId: Joi.number().description("ID of the admin assigned to this task"),
                order: Joi.number().description("Order/sequence of the task"),
                status: Joi.string().valid(...Object.values(PROJECT_STAGE_TASK_STATUS_LIST)).default(PROJECT_STAGE_TASK_STATUS_LIST.PENDING)
                    .description("Status of the task (default: pending)"),
                urls: Joi.array().items(Joi.string()).description("Array of project image URLs")
            },
            group: "ProjectStageTask",
            description: "Route to update a project stage task",
            model: "updateProjectStageTask",
        },
        auth: false,
        handler: projectStageTaskController.updateProjectStageTask,
    },
    {
        method: "GET",
        path: "/v1/projectStageTask/list",
        joiSchemaForSwagger: {
            query: {
                projectStageId: Joi.number().required().description("ID of the project stage"),
                adminId: Joi.number().description("ID of the admin assigned to tasks (optional)"),
                startDate: Joi.date().description("Filter tasks with endDate >= startDate (optional)"),
                endDate: Joi.date().description("Filter tasks with startDate <= endDate (optional)"),
                page: Joi.number().description("Page number for pagination"),
                size: Joi.number().description("Number of items per page")
            },
            group: "ProjectStageTask",
            description: "Route to list project stage tasks",
            model: "getProjectStageTasksList",
        },
        auth: false,
        handler: projectStageTaskController.getProjectStageTasksList,
    },
    {
        method: "GET",
        path: "/v1/projectStageTask/details",
        joiSchemaForSwagger: {
            query: {
                projectStageTaskId: Joi.number().required().description("ID of the project stage task")
            },
            group: "ProjectStageTask",
            description: "Route to get project stage task details",
            model: "getProjectStageTaskById",
        },
        auth: false,
        handler: projectStageTaskController.getProjectStageTaskById,
    },
    {
        method: "DELETE",
        path: "/v1/projectStageTask",
        joiSchemaForSwagger: {
            body: {
                projectStageTaskId: Joi.number().required().description("ID of the project stage task")
            },
            group: "ProjectStageTask",
            description: "Route to delete a project stage task",
            model: "deleteProjectStageTask",
        },
        auth: false,
        handler: projectStageTaskController.deleteProjectStageTask,
    },
    {
        method: "POST",
        path: "/v1/projectStageTask/delayReason",
        joiSchemaForSwagger: {
            body: {
                projectStageTaskId: Joi.number().required().description("ID of the project stage task"),
                reason: Joi.string().required().description("Reason for delay"),
                originalEndDate: Joi.date().required().description("Original end date before delay")
            },
            group: "ProjectStageTask",
            description: "Route to add a delay reason to a project stage task",
            model: "addProjectStageTaskDelayReason",
        },
        auth: false,
        handler: projectStageTaskController.addProjectStageTaskDelayReason,
    }
];

module.exports = routes; 