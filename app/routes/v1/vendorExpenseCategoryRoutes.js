"use strict";
const { Joi } = require("../../utils/joiUtils");
//load controllers
const vendorExpenseCategoryController = require("../../controllers/vendorExpenseCategoryController");

let routes = [
    {
        method: "POST",
        path: "/v1/vendorExpenseCategory/create",
        joiSchemaForSwagger: {
            body: {
                name: Joi.string().required()
                    .description("Enter category name"),
                description: Joi.string()
                    .description("Enter category description"),
                status: Joi.string()
                    .description("Enter category status")
            },
            group: "Vendor Expense Category",
            description: "Route to create vendor expense category",
            model: "createVendorExpenseCategory",
        },
        auth: false,
        handler: vendorExpenseCategoryController.createVendorExpenseCategory,
    },
    {
        method: "PUT",
        path: "/v1/vendorExpenseCategory/update",
        joiSchemaForSwagger: {
            body: {
                categoryId: Joi.number().required()
                    .description("Enter category id"),
                name: Joi.string()
                    .description("Enter category name"),
                description: Joi.string().allow('')
                    .description("Enter category description"),
                status: Joi.string()
                    .description("Enter category status")
            },
            group: "Vendor Expense Category",
            description: "Route to update vendor expense category",
            model: "updateVendorExpenseCategory",
        },
        auth: false,
        handler: vendorExpenseCategoryController.updateVendorExpenseCategory,
    },
    {
        method: "GET",
        path: "/v1/vendorExpenseCategory/list",
        joiSchemaForSwagger: {
            query: {
                categoryId: Joi.number()
                    .description("Enter category id"),
                status: Joi.string()
                    .description("Enter category status")
            },
            group: "Vendor Expense Category",
            description: "Route to list vendor expense categories",
            model: "vendorExpenseCategoryList",
        },
        auth: false,
        handler: vendorExpenseCategoryController.vendorExpenseCategoryList,
    },
    {
        method: "DELETE",
        path: "/v1/vendorExpenseCategory/delete",
        joiSchemaForSwagger: {
            body: {
                categoryId: Joi.number().required()
                    .description("Enter category id")
            },
            group: "Vendor Expense Category",
            description: "Route to delete vendor expense category",
            model: "deleteVendorExpenseCategory",
        },
        auth: false,
        handler: vendorExpenseCategoryController.deleteVendorExpenseCategory,
    }
];

module.exports = routes; 