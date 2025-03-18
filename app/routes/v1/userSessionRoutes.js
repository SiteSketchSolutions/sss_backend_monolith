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
        path: "/v1/userSession/list",
        joiSchemaForSwagger: {
            query: {
                userId: Joi.number().description("User ID (optional)"),
                date: Joi.date().description("Date to filter sessions (optional, format: YYYY-MM-DD)"),
            },
            group: "UserSession",
            description: "Route to list user sessions with optional filters",
            model: "getSessions",
        },
        auth: false,
        handler: userSessionController.getSessions,
    }
];

module.exports = routes; 