"use strict";
const { Joi } = require("../../utils/joiUtils");
const userSessionController = require("../../controllers/userSessionController");

let routes = [
    {
        method: "POST",
        path: "/v1/userSession/track",
        joiSchemaForSwagger: {
            body: {
                userId: Joi.number().required().description("User ID"),
                deviceInfo: Joi.string().description("Device information"),
                ipAddress: Joi.string().description("IP address"),
            },
            group: "UserSession",
            description: "Route to track user session",
            model: "trackUserSession",
        },
        auth: false,
        handler: userSessionController.trackUserSession,
    },
    {
        method: "GET",
        path: "/v1/userSession/analytics",
        joiSchemaForSwagger: {
            query: {
                userId: Joi.number().description("User ID (optional)"),
                startDate: Joi.date().description("Start date for analytics (optional)"),
                endDate: Joi.date().description("End date for analytics (optional)"),
            },
            group: "UserSession",
            description: "Route to get user session analytics",
            model: "getUserSessionAnalytics",
        },
        auth: false,
        handler: userSessionController.getUserSessionAnalytics,
    },
];

module.exports = routes; 