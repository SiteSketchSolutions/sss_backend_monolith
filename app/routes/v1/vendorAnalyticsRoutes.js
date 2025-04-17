"use strict";
const { Joi } = require("../../utils/joiUtils");
const vendorAnalyticsController = require("../../controllers/vendorAnalyticsController");

let routes = [
    {
        method: "GET",
        path: "/v1/vendor-analytics",
        joiSchemaForSwagger: {
            query: {
                vendorId: Joi.number().required()
                    .description("Enter vendor id"),
                projectId: Joi.number()
                    .description("Enter project id (optional)"),
                startDate: Joi.date()
                    .description("Start date for filtering (optional)"),
                endDate: Joi.date()
                    .description("End date for filtering (optional)")
            },
            group: "Vendor Analytics",
            description: "Route to get vendor expense analytics",
            model: "vendorAnalytics",
        },
        auth: false,
        handler: vendorAnalyticsController.getVendorAnalytics
    }
];

module.exports = routes; 