"use strict";
const { Joi } = require("../../utils/joiUtils");
const partPaymentStageController = require("../../controllers/partPaymentStageController");


let routes = [
    {
        method: "POST",
        path: "/v1/partPaymentStage/create",
        joiSchemaForSwagger: {
            body: {
                stageId: Joi.number().required().description("Enter stage id"),
                amount: Joi.number().required().description("Enter part payment amount"),
                method: Joi.string().required().description("Enter payment method like upi or card"),
                referenceId: Joi.string().description("Enter payment reference id"),
                note: Joi.string().description("Additional notes for the payment")
            },
            group: "PartPaymentStage",
            description: "Route to create part payment",
            model: "createPartPayment",
        },
        auth: false,
        handler: partPaymentStageController.createPartPayment,
    },
    {
        method: "PUT",
        path: "/v1/partPaymentStage/update",
        joiSchemaForSwagger: {
            body: {
                paymentId: Joi.number().required().description("Enter part payment id"),
                amount: Joi.number().description("Enter part payment amount"),
                method: Joi.string().description("Enter payment method like upi or card"),
                referenceId: Joi.string().allow("").description("Enter payment reference id"),
                note: Joi.string().description("Additional notes for the payment")
            },
            group: "PartPaymentStage",
            description: "Route to update  part payment",
            model: "updatePartPaymentStage",
        },
        auth: false,
        handler: partPaymentStageController.updatePartPayment,
    },
    {
        method: "GET",
        path: "/v1/partPaymentStage",
        joiSchemaForSwagger: {
            query: {
                stageId: Joi.number().required().description("Enter stage id"),
            },
            group: "PartPaymentStage",
            description: "Route to get part payment details",
            model: "getPartPaymentStage",
        },
        auth: false,
        handler: partPaymentStageController.getPartPaymentDetails,
    },
    {
        method: "GET",
        path: "/v1/partPaymentStage/list",
        joiSchemaForSwagger: {
            query: {
                stageId: Joi.number().required().description("Enter stage id"),
            },
            group: "PartPaymentStage",
            description: "Route to list part payment",
            model: "partPaymentStageList",
        },
        auth: false,
        handler: partPaymentStageController.getPartPaymentList,
    },
    {
        method: "DELETE",
        path: "/v1/partPaymentStage",
        joiSchemaForSwagger: {
            body: {
                paymentId: Joi.number().required().description("payment stage ID"),
            },
            group: "PartPaymentStage",
            description: "Route to delete part payment",
            model: "deletePartPaymentStage",
        },
        auth: false,
        handler: partPaymentStageController.deletePartPayment,
    },
];

module.exports = routes;
