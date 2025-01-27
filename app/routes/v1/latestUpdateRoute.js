"use strict";
const { Joi } = require("../../utils/joiUtils");
const latestUpdateController = require("../../controllers/latestUpdateController");

let routes = [
    {
        method: "GET",
        path: "/v1/latestUpdates",
        joiSchemaForSwagger: {
            query: {
                userId: Joi.number().required().description("Enter user id"),
            },
            group: "LatestUpdate",
            description: "Route to get latest update",
            model: "getLatestUpdates",
        },
        auth: false,
        handler: latestUpdateController.getLatestUpdate,
    },
];

module.exports = routes;
