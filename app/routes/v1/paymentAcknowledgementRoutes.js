"use strict";
const { Joi } = require("../../utils/joiUtils");
const paymentAcknowledgementController = require("../../controllers/paymentAcknowledgementController");

let routes = [
    {
        method: "POST",
        path: "/v1/payment/acknowledgement",
        joiSchemaForSwagger: {
            body: {
                partPaymentId: Joi.number().description("Enter part payment ID"),
                comment: Joi.string().allow("").description("Enter comment"),
            },
            group: "Payment",
            description: "Route to send payment acknowledgement email",
            model: "sendPaymentAcknowledgement",
        },
        auth: false,
        handler: paymentAcknowledgementController.sendPaymentAcknowledgement,
    }
];

module.exports = routes; 