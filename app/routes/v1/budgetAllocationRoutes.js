"use strict";
const { Joi } = require("../../utils/joiUtils");
const budgetAllocationController = require("../../controllers/budgetAllocationController");

let routes = [
    {
        method: "POST",
        path: "/v1/budgetAllocation/create",
        joiSchemaForSwagger: {
            body: {
                projectId: Joi.number().required().description("ID of the project"),
                vendorId: Joi.number().required().description("ID of the vendor"),
                amount: Joi.number().required().description("Allocation amount"),
                note: Joi.string().allow('').description("Optional note about the allocation"),
                allocatedBy: Joi.number().required().description("ID of the admin making the allocation")
            },
            group: "BudgetAllocation",
            description: "Route to create a budget allocation",
            model: "createBudgetAllocation",
        },
        auth: false,
        handler: budgetAllocationController.createBudgetAllocation,
    },
    {
        method: "PUT",
        path: "/v1/budgetAllocation/update",
        joiSchemaForSwagger: {
            body: {
                budgetAllocationId: Joi.number().required().description("ID of the budget allocation"),
                vendorId: Joi.number().description("ID of the vendor"),
                amount: Joi.number().description("Allocation amount"),
                note: Joi.string().allow('').description("Note about the allocation")
            },
            group: "BudgetAllocation",
            description: "Route to update a budget allocation",
            model: "updateBudgetAllocation",
        },
        auth: false,
        handler: budgetAllocationController.updateBudgetAllocation,
    },
    {
        method: "GET",
        path: "/v1/budgetAllocation/list",
        joiSchemaForSwagger: {
            query: {
                projectId: Joi.number().description("ID of the project (optional)"),
                page: Joi.number().description("Page number for pagination"),
                size: Joi.number().description("Number of items per page")
            },
            group: "BudgetAllocation",
            description: "Route to list budget allocations",
            model: "getBudgetAllocationsList",
        },
        auth: false,
        handler: budgetAllocationController.getBudgetAllocationsList,
    },
    {
        method: "GET",
        path: "/v1/budgetAllocation/details",
        joiSchemaForSwagger: {
            query: {
                budgetAllocationId: Joi.number().required().description("ID of the budget allocation")
            },
            group: "BudgetAllocation",
            description: "Route to get budget allocation details",
            model: "getBudgetAllocationById",
        },
        auth: false,
        handler: budgetAllocationController.getBudgetAllocationById,
    },
    {
        method: "DELETE",
        path: "/v1/budgetAllocation",
        joiSchemaForSwagger: {
            body: {
                budgetAllocationId: Joi.number().required().description("ID of the budget allocation")
            },
            group: "BudgetAllocation",
            description: "Route to delete a budget allocation",
            model: "deleteBudgetAllocation",
        },
        auth: false,
        handler: budgetAllocationController.deleteBudgetAllocation,
    },
    {
        method: "GET",
        path: "/v1/project/budgetSummary",
        joiSchemaForSwagger: {
            query: {
                projectId: Joi.number().required().description("ID of the project")
            },
            group: "BudgetAllocation",
            description: "Route to get budget summary for a project",
            model: "getProjectBudgetSummary",
        },
        auth: false,
        handler: budgetAllocationController.getProjectBudgetSummary,
    }
];

module.exports = routes; 