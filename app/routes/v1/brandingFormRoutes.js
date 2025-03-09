"use strict";
const brandingFormController = require("../../controllers/brandingFormController");
const { Joi } = require("../../utils/joiUtils");

let brandingFormRoutes = [
    {
        method: "POST",
        path: "/v1/brandingForm/create",
        joiSchemaForSwagger: {
            body: {
                name: Joi.string().required().description("Name of the form submission"),
                email: Joi.string().allow("").description("Email of the form submission"),
                phone: Joi.string().required().description("Phone number of the form submission"),
                service: Joi.string().required().description("Service of the form submission"),
                message: Joi.string().description("Message of the form submission"),
            },
            group: "BrandingForm",
            description: "Route to create branding form",
            model: "createBrandingForm",
        },
        handler: brandingFormController.createFormSubmission,
    },
    {
        method: "GET",
        path: "/v1/brandingForm/getAll",
        joiSchemaForSwagger: {
            group: "BrandingForm",
            description: "Route to get all branding form submissions",
            model: "getAllBrandingForm",
        },
        handler: brandingFormController.getAllFormSubmissions,
    },
];

module.exports = brandingFormRoutes; 