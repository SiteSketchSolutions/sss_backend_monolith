"use strict";
const { Joi } = require("../../utils/joiUtils");
const additionalExpenseController = require("../../controllers/additionalExpenseController");

let routes = [
    {
        method: "POST",
        path: "/v1/additionalExpense/create",
        joiSchemaForSwagger: {
            body: {
                userId: Joi.number().required().description("ID of the user"),
                amount: Joi.number().required().description("Expense amount"),
                stageName: Joi.string().required().description("Name of the stage"),
                note: Joi.string().allow('').description("Optional note about the expense")
            },
            group: "AdditionalExpense",
            description: "Route to create an additional expense",
            model: "createAdditionalExpense",
        },
        auth: false,
        handler: additionalExpenseController.createAdditionalExpense,
    },
    {
        method: "PUT",
        path: "/v1/additionalExpense/update",
        joiSchemaForSwagger: {
            body: {
                additionalExpenseId: Joi.number().required().description("ID of the additional expense"),
                amount: Joi.number().description("Expense amount"),
                stageName: Joi.string().description("Name of the stage"),
                note: Joi.string().allow('').description("Note about the expense"),
                status: Joi.string().valid('unpaid', 'settled').description("Status of the expense")
            },
            group: "AdditionalExpense",
            description: "Route to update an additional expense",
            model: "updateAdditionalExpense",
        },
        auth: false,
        handler: additionalExpenseController.updateAdditionalExpense,
    },
    {
        method: "GET",
        path: "/v1/additionalExpense/list",
        joiSchemaForSwagger: {
            query: {
                userId: Joi.number().description("ID of the user (optional)"),
                status: Joi.string().valid('unpaid', 'settled').description("Status filter (optional)"),
                page: Joi.number().description("Page number for pagination"),
                size: Joi.number().description("Number of items per page")
            },
            group: "AdditionalExpense",
            description: "Route to list additional expenses",
            model: "getAdditionalExpensesList",
        },
        auth: false,
        handler: additionalExpenseController.getAdditionalExpensesList,
    },
    {
        method: "GET",
        path: "/v1/additionalExpense/details",
        joiSchemaForSwagger: {
            query: {
                additionalExpenseId: Joi.number().required().description("ID of the additional expense")
            },
            group: "AdditionalExpense",
            description: "Route to get additional expense details",
            model: "getAdditionalExpenseById",
        },
        auth: false,
        handler: additionalExpenseController.getAdditionalExpenseById,
    },
    {
        method: "DELETE",
        path: "/v1/additionalExpense",
        joiSchemaForSwagger: {
            body: {
                additionalExpenseId: Joi.number().required().description("ID of the additional expense")
            },
            group: "AdditionalExpense",
            description: "Route to delete an additional expense",
            model: "deleteAdditionalExpense",
        },
        auth: false,
        handler: additionalExpenseController.deleteAdditionalExpense,
    },
    {
        method: "PUT",
        path: "/v1/additionalExpense/status",
        joiSchemaForSwagger: {
            body: {
                additionalExpenseId: Joi.number().required().description("ID of the additional expense"),
                status: Joi.string().valid('unpaid', 'settled').required().description("New status for the expense")
            },
            group: "AdditionalExpense",
            description: "Route to update additional expense status",
            model: "updateAdditionalExpenseStatus",
        },
        auth: false,
        handler: additionalExpenseController.updateAdditionalExpenseStatus,
    }
];

module.exports = routes; 