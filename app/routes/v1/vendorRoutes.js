"use strict";
const { Joi } = require("../../utils/joiUtils");
//load controllers
const vendorController = require("../../controllers/vendorController");
const CONSTANTS = require("../../utils/constants");

let routes = [
    {
        method: "POST",
        path: "/v1/vendor/create",
        joiSchemaForSwagger: {
            body: {
                name: Joi.string().required()
                    .description("Enter vendor name"),
                note: Joi.string()
                    .description("Enter additional notes for vendor")
            },
            group: "Vendor",
            description: "Route to create vendor",
            model: "createVendor",
        },
        auth: false,
        handler: vendorController.createVendor,
    },
    {
        method: "PUT",
        path: "/v1/vendor/update",
        joiSchemaForSwagger: {
            body: {
                vendorId: Joi.number().required()
                    .description("Enter vendor id"),
                name: Joi.string()
                    .description("Enter vendor name"),
                note: Joi.string()
                    .description("Enter additional notes for vendor"),
                status: Joi.string()
                    .description("Enter status")
                    .valid(CONSTANTS.VENDOR_STATUS.ACTIVE, CONSTANTS.VENDOR_STATUS.INACTIVE)
            },
            group: "Vendor",
            description: "Route to update vendor",
            model: "updateVendor",
        },
        auth: false,
        handler: vendorController.updateVendor,
    },
    {
        method: "GET",
        path: "/v1/vendor/list",
        joiSchemaForSwagger: {
            query: {
                vendorId: Joi.number()
                    .description("Enter vendor id")
            },
            group: "Vendor",
            description: "Route to list vendors",
            model: "vendorList",
        },
        auth: false,
        handler: vendorController.vendorList,
    },
    {
        method: "GET",
        path: "/v1/vendor",
        joiSchemaForSwagger: {
            query: {
                vendorId: Joi.number().required()
                    .description("Enter vendor id")
            },
            group: "Vendor",
            description: "Route to get vendor details",
            model: "vendorDetails",
        },
        auth: false,
        handler: vendorController.getVendorById,
    },
    {
        method: "DELETE",
        path: "/v1/vendor/delete",
        joiSchemaForSwagger: {
            body: {
                vendorId: Joi.number().required()
                    .description("Enter vendor id")
            },
            group: "Vendor",
            description: "Route to delete vendor",
            model: "deleteVendor",
        },
        auth: false,
        handler: vendorController.deleteVendor,
    }
];

module.exports = routes; 