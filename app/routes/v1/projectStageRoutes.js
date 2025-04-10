"use strict";
const { Joi } = require("../../utils/joiUtils");
const projectStageController = require("../../controllers/projectStageController");
const { PROJECT_STAGE_TASK_STATUS_LIST, PROJECT_STAGE_STATUS_LIST } = require("../../utils/constants");

let routes = [
    {
        method: "POST",
        path: "/v1/projectStage/create",
        joiSchemaForSwagger: {
            body: {
                projectId: Joi.number().required().description("ID of the project"),
                name: Joi.string().required().description("Name of the stage"),
                description: Joi.string().allow("").description("Description of the stage"),
                startDate: Joi.date().required().description("Start date of the stage"),
                endDate: Joi.date().required().description("End date of the stage"),
                order: Joi.number().description("Order/sequence of the stage (default: 0)"),
                percentage: Joi.number().description("Percentage of completion (default: 0)"),
                status: Joi.string().valid(...Object.values(PROJECT_STAGE_STATUS_LIST)).default(PROJECT_STAGE_STATUS_LIST.PENDING)
                    .description("Status of the stage (default: pending)")
            },
            group: "ProjectStage",
            description: "Route to create a project stage",
            model: "createProjectStage",
        },
        auth: false,
        handler: projectStageController.createProjectStage,
    },
    {
        method: "PUT",
        path: "/v1/projectStage/update",
        joiSchemaForSwagger: {
            body: {
                projectStageId: Joi.number().required().description("ID of the project stage"),
                name: Joi.string().description("Name of the stage"),
                description: Joi.string().description("Description of the stage"),
                startDate: Joi.date().description("Start date of the stage"),
                endDate: Joi.date().description("End date of the stage"),
                order: Joi.number().description("Order/sequence of the stage"),
                percentage: Joi.number().description("Percentage of completion"),
                status: Joi.string().valid(...Object.values(PROJECT_STAGE_STATUS_LIST)).default(PROJECT_STAGE_STATUS_LIST.PENDING)
                    .description("Status of the stage (default: pending)")
            },
            group: "ProjectStage",
            description: "Route to update a project stage",
            model: "updateProjectStage",
        },
        auth: false,
        handler: projectStageController.updateProjectStage,
    },
    {
        method: "GET",
        path: "/v1/projectStage/list",
        joiSchemaForSwagger: {
            query: {
                projectId: Joi.number().required().description("ID of the project"),
                page: Joi.number().description("Page number for pagination"),
                size: Joi.number().description("Number of items per page")
            },
            group: "ProjectStage",
            description: "Route to list project stages",
            model: "getProjectStagesList",
        },
        auth: false,
        handler: projectStageController.getProjectStagesList,
    },
    {
        method: "GET",
        path: "/v1/projectStage/details",
        joiSchemaForSwagger: {
            query: {
                projectStageId: Joi.number().required().description("ID of the project stage")
            },
            group: "ProjectStage",
            description: "Route to get project stage details",
            model: "getProjectStageById",
        },
        auth: false,
        handler: projectStageController.getProjectStageById,
    },
    {
        method: "DELETE",
        path: "/v1/projectStage",
        joiSchemaForSwagger: {
            body: {
                projectStageId: Joi.number().required().description("ID of the project stage")
            },
            group: "ProjectStage",
            description: "Route to delete a project stage",
            model: "deleteProjectStage",
        },
        auth: false,
        handler: projectStageController.deleteProjectStage,
    },
    {
        method: "POST",
        path: "/v1/projectStage/delayReason",
        joiSchemaForSwagger: {
            body: {
                projectStageId: Joi.number().required().description("ID of the project stage"),
                reason: Joi.string().required().description("Reason for delay"),
                originalEndDate: Joi.date().required().description("Original end date before delay")
            },
            group: "ProjectStage",
            description: "Route to add a delay reason to a project stage",
            model: "addProjectStageDelayReason",
        },
        auth: false,
        handler: projectStageController.addProjectStageDelayReason,
    }
];

module.exports = routes; 