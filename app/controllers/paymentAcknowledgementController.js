const HELPERS = require("../helpers");
const { MESSAGES, ERROR_TYPES } = require("../utils/constants");
const paymentAcknowledgementService = require("../services/paymentAcknowledgementService");

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
        const { paymentStageId, partPaymentId } = payload;

        if (!paymentStageId && !partPaymentId) {
            return HELPERS.responseHelper.createErrorResponse(
                MESSAGES.MISSING_REQUIRED_FIELDS,
                ERROR_TYPES.BAD_REQUEST
            );
        }

        const response = await paymentAcknowledgementService.sendPaymentAcknowledgementEmail({
            paymentStageId,
            partPaymentId
        });

        return Object.assign(
            HELPERS.responseHelper.createSuccessResponse(
                MESSAGES.EMAIL_SENT_SUCCESSFULLY
            ),
            { data: response }
        );
    } catch (error) {
        return HELPERS.responseHelper.createErrorResponse(
            error.message,
            ERROR_TYPES.SOMETHING_WENT_WRONG
        );
    }
};

module.exports = paymentAcknowledgementController; 