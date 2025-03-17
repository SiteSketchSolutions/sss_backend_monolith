const HELPERS = require("../helpers");
const { MESSAGES, ERROR_TYPES } = require("../utils/constants");
const paymentAcknowledgementService = require("../services/paymentAcknowledgementService");
const partPaymentStageModel = require("../models/partPaymentStageModel");
/**************************************************
 ************* Payment Acknowledgement Controller ***************
 **************************************************/
let paymentAcknowledgementController = {};

/**
 * Function to send payment acknowledgement email
 * @param {Object} payload - Request payload
 * @param {Number} payload.paymentStageId - ID of the payment stage (optional if partPaymentId is provided)
 * @param {Number} payload.partPaymentId - ID of the part payment (optional if paymentStageId is provided)
 * @returns {Object} - Response object
 */
paymentAcknowledgementController.sendPaymentAcknowledgement = async (payload) => {
    try {
        const { partPaymentId, comment } = payload;

        if (!partPaymentId) {
            return HELPERS.responseHelper.createErrorResponse(
                MESSAGES.MISSING_REQUIRED_FIELDS,
                ERROR_TYPES.BAD_REQUEST
            );
        }

        const response = await paymentAcknowledgementService.sendPaymentAcknowledgementEmail({
            partPaymentId,
            comment
        });

        await partPaymentStageModel.update({
            acknowledgementSent: true
        }, {
            where: {
                id: partPaymentId
            }
        });

        return Object.assign(
            HELPERS.responseHelper.createSuccessResponse(
                MESSAGES.EMAIL_SENT_SUCCESSFULLY
            ),
            { data: response }
        );
    } catch (error) {
        console.error("Error sending payment acknowledgement:", error);
        return HELPERS.responseHelper.createErrorResponse(
            error.message,
            ERROR_TYPES.SOMETHING_WENT_WRONG
        );
    }
};

module.exports = paymentAcknowledgementController; 