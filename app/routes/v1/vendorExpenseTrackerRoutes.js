"use strict";
const { Joi } = require("../../utils/joiUtils");
//load controllers
const vendorExpenseTrackerController = require("../../controllers/vendorExpenseTrackerController");

let routes = [
    {
        method: "POST",
        path: "/v1/vendorExpenseTracker/create",
        joiSchemaForSwagger: {
            body: {
                vendorId: Joi.number().required()
                    .description("Enter vendor id"),
                projectId: Joi.number().required()
                    .description("Enter project id"),
                categoryId: Joi.number().required()
                    .description("Enter expense category id"),
                amount: Joi.number().required()
                    .description("Enter expense amount"),
                note: Joi.string()
                    .description("Enter additional notes for expense"),
                status: Joi.string().valid('paid', 'unpaid')
                    .description("Enter expense status (paid/unpaid)")
            },
            group: "Vendor Expense Tracker",
            description: "Route to create vendor expense",
            model: "createVendorExpense",
        },
        auth: false,
        handler: vendorExpenseTrackerController.createVendorExpense,
    },
    {
        method: "PUT",
        path: "/v1/vendorExpenseTracker/update",
        joiSchemaForSwagger: {
            body: {
                expenseId: Joi.number().required()
                    .description("Enter expense id"),
                vendorId: Joi.number()
                    .description("Enter vendor id"),
                projectId: Joi.number()
                    .description("Enter project id"),
                categoryId: Joi.number()
                    .description("Enter expense category id"),
                amount: Joi.number()
                    .description("Enter expense amount"),
                note: Joi.string()
                    .description("Enter additional notes for expense"),
                status: Joi.string().valid('paid', 'unpaid')
                    .description("Enter expense status (paid/unpaid)")
            },
            group: "Vendor Expense Tracker",
            description: "Route to update vendor expense",
            model: "updateVendorExpense",
        },
        auth: false,
        handler: vendorExpenseTrackerController.updateVendorExpense,
    },
    {
        method: "GET",
        path: "/v1/vendorExpenseTracker/list",
        joiSchemaForSwagger: {
            query: {
                expenseId: Joi.number()
                    .description("Enter expense id"),
                vendorId: Joi.number()
                    .description("Enter vendor id"),
                projectId: Joi.number()
                    .description("Enter project id"),
                categoryId: Joi.number()
                    .description("Enter expense category id"),
                status: Joi.string().valid('paid', 'unpaid')
                    .description("Enter expense status (paid/unpaid)")
            },
            group: "Vendor Expense Tracker",
            description: "Route to list vendor expenses",
            model: "vendorExpenseList",
        },
        auth: false,
        handler: vendorExpenseTrackerController.vendorExpenseList,
    },
    {
        method: "GET",
        path: "/v1/vendorExpenseTracker",
        joiSchemaForSwagger: {
            query: {
                expenseId: Joi.number().required()
                    .description("Enter expense id")
            },
            group: "Vendor Expense Tracker",
            description: "Route to get vendor expense details",
            model: "vendorExpenseDetails",
        },
        auth: false,
        handler: vendorExpenseTrackerController.getVendorExpenseById,
    },
    {
        method: "DELETE",
        path: "/v1/vendorExpenseTracker/delete",
        joiSchemaForSwagger: {
            body: {
                expenseId: Joi.number().required()
                    .description("Enter expense id")
            },
            group: "Vendor Expense Tracker",
            description: "Route to delete vendor expense",
            model: "deleteVendorExpense",
        },
        auth: false,
        handler: vendorExpenseTrackerController.deleteVendorExpense,
    }
];

module.exports = routes; 