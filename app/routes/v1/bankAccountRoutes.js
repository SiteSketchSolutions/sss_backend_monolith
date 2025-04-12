"use strict";
const { Joi } = require("../../utils/joiUtils");
const bankAccountController = require("../../controllers/bankAccountController");
const { BANK_ACCOUNT_TYPE } = require("../../utils/constants");

let routes = [
    {
        method: "POST",
        path: "/v1/bankAccount/create",
        joiSchemaForSwagger: {
            body: {
                name: Joi.string().required().description("Account holder name"),
                accountNumber: Joi.string().required().description("Bank account number"),
                ifscCode: Joi.string().required().description("IFSC code of the bank"),
                bankName: Joi.string().required().description("Name of the bank"),
                accountType: Joi.string()
                    .valid(BANK_ACCOUNT_TYPE.SAVINGS, BANK_ACCOUNT_TYPE.CURRENT, BANK_ACCOUNT_TYPE.OTHER)
                    .default(BANK_ACCOUNT_TYPE.SAVINGS)
                    .description("Type of account (Savings, Current, Other)"),
                branchName: Joi.string().description("Name of the bank branch"),
                description: Joi.string().allow('').description("Additional details about the account"),
                isActive: Joi.boolean().default(true).description("Whether the account is active")
            },
            group: "BankAccount",
            description: "Route to create bank account",
            model: "createBankAccount",
        },
        auth: false, // You might want to set this to true for admin-only access
        handler: bankAccountController.createBankAccount,
    },
    {
        method: "PUT",
        path: "/v1/bankAccount/update",
        joiSchemaForSwagger: {
            body: {
                accountId: Joi.number().required().description("Bank account ID"),
                name: Joi.string().description("Account holder name"),
                accountNumber: Joi.string().description("Bank account number"),
                ifscCode: Joi.string().description("IFSC code of the bank"),
                bankName: Joi.string().description("Name of the bank"),
                accountType: Joi.string()
                    .valid(BANK_ACCOUNT_TYPE.SAVINGS, BANK_ACCOUNT_TYPE.CURRENT, BANK_ACCOUNT_TYPE.OTHER)
                    .description("Type of account (Savings, Current, Other)"),
                branchName: Joi.string().description("Name of the bank branch"),
                description: Joi.string().allow('').description("Additional details about the account"),
                isActive: Joi.boolean().description("Whether the account is active")
            },
            group: "BankAccount",
            description: "Route to update bank account",
            model: "updateBankAccount",
        },
        auth: false, // You might want to set this to true for admin-only access
        handler: bankAccountController.updateBankAccount,
    },
    {
        method: "GET",
        path: "/v1/bankAccount/details",
        joiSchemaForSwagger: {
            query: {
                accountId: Joi.number().required().description("Bank account ID"),
            },
            group: "BankAccount",
            description: "Route to get bank account details",
            model: "getBankAccountDetails",
        },
        auth: false,
        handler: bankAccountController.getBankAccountDetails,
    },
    {
        method: "GET",
        path: "/v1/bankAccount/list",
        joiSchemaForSwagger: {
            query: {
                isActive: Joi.boolean().description("Filter by active status"),
            },
            group: "BankAccount",
            description: "Route to list bank accounts",
            model: "listBankAccounts",
        },
        auth: false,
        handler: bankAccountController.listBankAccounts,
    },
    {
        method: "DELETE",
        path: "/v1/bankAccount/delete",
        joiSchemaForSwagger: {
            body: {
                accountId: Joi.number().required().description("Bank account ID"),
            },
            group: "BankAccount",
            description: "Route to delete bank account",
            model: "deleteBankAccount",
        },
        auth: false, // You might want to set this to true for admin-only access
        handler: bankAccountController.deleteBankAccount,
    },
    {
        method: "PUT",
        path: "/v1/bankAccount/toggleStatus",
        joiSchemaForSwagger: {
            body: {
                accountId: Joi.number().required().description("Bank account ID"),
                isActive: Joi.boolean().required().description("Set account active status"),
            },
            group: "BankAccount",
            description: "Route to activate/deactivate bank account",
            model: "toggleBankAccountStatus",
        },
        auth: false, // You might want to set this to true for admin-only access
        handler: bankAccountController.toggleBankAccountStatus,
    },
];

module.exports = routes; 