"use strict";
const { Joi } = require("../../utils/joiUtils");
const migrationController = require("../../controllers/migrationController");

let routes = [
    {
        method: "POST",
        path: "/v1/migration/imageToImages",
        joiSchemaForSwagger: {
            body: {
                secret: Joi.string().required().description("Secret key for authentication"),
                modelType: Joi.string().description("Model to migrate: 'siteUpdate', 'project', or 'all' (default)")
            },
            group: "Migration",
            description: "Route to migrate image fields to images arrays",
            model: "migrateImageToImages",
        },
        auth: false,
        handler: migrationController.migrateImageToImages,
    }
];

module.exports = routes; 