"use strict";
const { Joi } = require("../../utils/joiUtils");
//load controllers
const analyticsController = require("../../controllers/analyticsController");

let routes = [
    {
        method: "GET",
        path: "/v1/analytics/project/:projectId",
        joiSchemaForSwagger: {
            params: {
                projectId: Joi.number().required()
                    .description("Enter project id")
            },
            group: "Analytics",
            description: "Route to get project financial analytics",
            model: "projectAnalytics",
        },
        auth: ["admin", "user"],
        handler: analyticsController.getProjectAnalytics
    },
    {
        method: "GET",
        path: "/v1/analytics/overall",
        joiSchemaForSwagger: {
            group: "Analytics",
            description: "Route to get overall financial analytics",
            model: "overallAnalytics",
        },
        auth: ["admin", "user"],
        handler: analyticsController.getOverallAnalytics
    },
    {
        method: "GET",
        path: "/v1/analytics/client/:userId",
        joiSchemaForSwagger: {
            params: {
                userId: Joi.number().required()
                    .description("Enter user id")
            },
            group: "Analytics",
            description: "Route to get client payment analytics",
            model: "clientPaymentAnalytics",
        },
        auth: ["admin", "user"],
        handler: analyticsController.getClientPaymentAnalytics
    },
];

module.exports = routes; 
