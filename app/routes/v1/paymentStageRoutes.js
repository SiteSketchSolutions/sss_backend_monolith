"use strict";
const { Joi } = require("../../utils/joiUtils");
const paymentStageController = require("../../controllers/paymentStageController");
const { PAYMENT_STAGE_STATUS, PAYMENT_STATUS } = require("../../utils/constants");


/**
 * 1. payment stage can be created with an help of walletId, name, desc,totalAmount,paidAmount, dueDate,status.order
 * 2. stagePartPayments can have an stageId, status,method,referenceId,invoiceNo,approved.
 * 3.vendorWisePaymentStage will have an stageId, name,desc,totalAmount,status,paidAmount,status
 */

let routes = [
    {
        method: "POST",
        path: "/v1/paymentStage/create",
        joiSchemaForSwagger: {
            body: {
                walletId: Joi.number().required().description("Enter wallet id"),
                name: Joi.string().required().description("Enter stage name"),
                description: Joi.string().allow("").description("Enter stage description"),
                totalAmount: Joi.number().required().description("Enter stage total amount"),
                dueDate: Joi.date().description("Enter payment due date"),
                status: Joi.string().required().valid(...Object.values(PAYMENT_STAGE_STATUS)).default(PAYMENT_STAGE_STATUS.PENDING).description("Enter stage status"),
                paymentStatus: Joi.string().required().valid(...Object.values(PAYMENT_STATUS)).default(PAYMENT_STATUS.UNPAID).description("Enter payment status"),
                approved: Joi.boolean().required().default(false).description("approved true or false"),
                order: Joi.number().required().description("order number")
            },
            group: "PaymentStage",
            description: "Route to create payment stage",
            model: "createPaymentStage",
        },
        auth: false,
        handler: paymentStageController.createPaymentStage,
    },
    {
        method: "PUT",
        path: "/v1/paymentStage/update",
        joiSchemaForSwagger: {
            body: {
                stageId: Joi.number().required().description("Enter stage id"),
                name: Joi.string().description("Enter stage name"),
                description: Joi.string().description("Enter stage description"),
                totalAmount: Joi.number().description("Enter stage total amount"),
                dueDate: Joi.date().description("Enter payment due date"),
                status: Joi.string().valid(...Object.values(PAYMENT_STAGE_STATUS)).description("Enter stage status"),
                approved: Joi.boolean().description("approved true or false"),
                order: Joi.number().description("order number")
            },
            group: "PaymentStage",
            description: "Route to update payment stage",
            model: "updatePaymentStage",
        },
        auth: false,
        handler: paymentStageController.updatePaymentStage,
    },
    {
        method: "GET",
        path: "/v1/paymentStage",
        joiSchemaForSwagger: {
            query: {
                stageId: Joi.number().required().description("Enter stage id"),
            },
            group: "PaymentStage",
            description: "Route to get payment stage details",
            model: "getPaymentStageDetails",
        },
        auth: false,
        handler: paymentStageController.getPaymentStageDetails,
    },
    {
        method: "GET",
        path: "/v1/paymentStage/list",
        joiSchemaForSwagger: {
            query: {
                walletId: Joi.number().required().description("Enter wallet id"),
            },
            group: "PaymentStage",
            description: "Route to list payment stages",
            model: "paymentStageList",
        },
        auth: false,
        handler: paymentStageController.paymentStageList,
    },
    {
        method: "DELETE",
        path: "/v1/paymentStage",
        joiSchemaForSwagger: {
            body: {
                stageId: Joi.number().required().description("payment stage ID"),
            },
            group: "PaymentStage",
            description: "Route to delete payment stage",
            model: "deletePaymentStage",
        },
        auth: false,
        handler: paymentStageController.deletePaymentStage,
    },
];

module.exports = routes;
