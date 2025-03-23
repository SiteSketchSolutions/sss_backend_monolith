"use strict";
const { Joi } = require("../../utils/joiUtils");
//load controllers
const projectAnalyticsController = require("../../controllers/projectAnalyticsController");

let routes = [
    {
        method: "GET",
        path: "/v1/project-analytics",
        joiSchemaForSwagger: {
            query: {
                projectId: Joi.number().required()
                    .description("Enter project id")
            },
            group: "Project Analytics",
            description: "Route to get project financial analytics",
            model: "projectAnalytics",
        },
        auth: false,
        handler: projectAnalyticsController.getProjectAnalytics
    }
];

module.exports = routes; 