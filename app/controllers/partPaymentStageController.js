const HELPERS = require("../helpers");
const { Op } = require("sequelize");
const { MESSAGES, ERROR_TYPES, TRANSACTION_TYPE, ORDER_TYPE, PAYMENT_STAGE_STATUS } = require("../utils/constants");
const partPaymentStageModel = require("../models/partPaymentStageModel");
const { handleWalletTransaction } = require("../services/walletService");
const paymentStage = require("../models/paymentStageModel");

/**************************************************
 ***************** Part Payment Stage controller ***************
 **************************************************/
let partPaymentStageController = {};

/**
 * Function to create payment stage
 * @param {*} payload
 * @returns
 */
partPaymentStageController.createPartPayment = async (payload) => {
    try {
        /**
         * 1. get the amount which is going to pay .
         * 2. create an wallet transaction with how much money to be added to wallet and get walletId by payment stage.
         * 3. update the stage payment status to be partially paid, and increment the paidAmount to be that much.
         * 
         * 1.payement stage 10 lakh wallet deduct 10lakh. -10lakh status completed
         * 2.part payment is add the amount to wallet
         */
        const { stageId, amount, method, referenceId, invoiceNo } = payload;
        let stagePayload = {
            stageId, amount, method, referenceId, invoiceNo
        };
        const stageExist = await paymentStage.findOne({
            where: {
                id: stageId,
                isDeleted: { [Op.ne]: true }
            },
            attributes: ['id', 'walletId', 'status']
        });
        if (!stageExist) {
            return HELPERS.responseHelper.createErrorResponse(
                MESSAGES.STAGE_NOT_EXIST,
                ERROR_TYPES.DATA_NOT_FOUND
            );
        }

        if (stageExist?.status == PAYMENT_STAGE_STATUS.COMPLETED) {
            return HELPERS.responseHelper.createErrorResponse(
                MESSAGES.STAGE_ALREADY_COMPLETED,
                ERROR_TYPES.DATA_NOT_FOUND
            );
        }
        const partPaymentDetails = await partPaymentStageModel.create(stagePayload);
        await handleWalletTransaction(stageExist.walletId, amount, TRANSACTION_TYPE.CREDIT, ORDER_TYPE.PART_PAYMENT, partPaymentDetails?.id)
        await paymentStage.increment('paidAmount', { by: amount, where: { id: stageId } });
        const response = {
            id: partPaymentDetails?.id,
        };
        return Object.assign(
            HELPERS.responseHelper.createSuccessResponse(
                MESSAGES.STAGE_CREATED_SUCCESSFULLY
            ),
            { data: response }
        );
    } catch (error) {
        throw HELPERS.responseHelper.createErrorResponse(
            error.message,
            ERROR_TYPES.SOMETHING_WENT_WRONG
        );
    }
};

/**
 * Function to update payment stage
 * @param {*} payload
 * @returns
 */
partPaymentStageController.updatePartPayment = async (payload) => {
    try {
        const { paymentId, amount, method, referenceId, invoiceNo } = payload;
        let updatePayload = {
            amount, method, referenceId, invoiceNo
        };

        await partPaymentStageModel.update(updatePayload, {
            where: { id: paymentId, isDeleted: { [Op.ne]: true } },
        });

        return Object.assign(
            HELPERS.responseHelper.createSuccessResponse(
                MESSAGES.STAGE_UPDATED_SUCCESSFULLY
            ),
            { data: null }
        );
    } catch (error) {
        throw HELPERS.responseHelper.createErrorResponse(
            error.message,
            ERROR_TYPES.SOMETHING_WENT_WRONG
        );
    }
};

/**
 * Function to list payment stages
 * @param {*} payload
 * @returns
 */
partPaymentStageController.getPartPaymentList = async (payload) => {
    try {
        const { stageId } = payload;
        const stages = await partPaymentStageModel.findAll({
            where: {
                stageId: stageId,
                isDeleted: { [Op.ne]: true },
            },
            attributes: ["id", "amount", "method", "referenceId", "invoiceNo"],
            order: [["id", "ASC"]],
        });

        return Object.assign(
            HELPERS.responseHelper.createSuccessResponse(
                MESSAGES.STAGE_LIST_SUCCESSFULLY
            ),
            { data: stages }
        );
    } catch (error) {
        throw HELPERS.responseHelper.createErrorResponse(
            error.message,
            ERROR_TYPES.SOMETHING_WENT_WRONG
        );
    }
};


/**
 * Function to list payment stages
 * @param {*} payload
 * @returns
 */
partPaymentStageController.getPartPaymentDetails = async (payload) => {
    try {
        const { paymentId } = payload;
        const stages = await partPaymentStageModel.findOne({
            where: {
                id: paymentId,
                isDeleted: { [Op.ne]: true },
            },
            attributes: ["id", "amount", "method", "referenceId", "invoiceNo"],
            order: [["id", "ASC"]],
        });

        return Object.assign(
            HELPERS.responseHelper.createSuccessResponse(
                MESSAGES.STAGE_LIST_SUCCESSFULLY
            ),
            { data: stages }
        );
    } catch (error) {
        throw HELPERS.responseHelper.createErrorResponse(
            error.message,
            ERROR_TYPES.SOMETHING_WENT_WRONG
        );
    }
};
partPaymentStageController.deletePartPayment = async (payload) => {
    try {
        const { paymentId } = payload;

        await partPaymentStageModel.update(
            { isDeleted: true },
            { where: { id: paymentId } }
        );

        return Object.assign(
            HELPERS.responseHelper.createSuccessResponse(
                MESSAGES.STAGE_DELETED_SUCCESSFULLY
            ),
            { data: null }
        );
    } catch (error) {
        throw HELPERS.responseHelper.createErrorResponse(
            error.message,
            ERROR_TYPES.SOMETHING_WENT_WRONG
        );
    }
};

module.exports = partPaymentStageController;
