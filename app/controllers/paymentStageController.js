const HELPERS = require("../helpers");
const { Op } = require("sequelize");
const { MESSAGES, ERROR_TYPES, PAYMENT_STAGE_STATUS, PAYMENT_STATUS, TRANSACTION_TYPE, ORDER_TYPE } = require("../utils/constants");
const paymentStageModel = require("../models/paymentStageModel");
const walletService = require("../services/walletService");

/**************************************************
 ***************** Payment Stage controller ***************
 **************************************************/
let paymentStageController = {};

/**
 * Function to create payment stage
 * @param {*} payload
 * @returns
 */
paymentStageController.createPaymentStage = async (payload) => {
    try {
        const { walletId, name, description, totalAmount, paidAmount, dueDate, status, paymentStatus, approved, order, fullPayment } = payload;
        let stagePayload = {
            walletId,
            name,
            description,
            totalAmount,
            paidAmount,
            dueDate,
            status,
            paymentStatus,
            approved,
            order,
            fullPayment
        };
        const stageExist = await paymentStageModel.findOne({
            where: {
                walletId: walletId,
                order: order,
                isDeleted: { [Op.ne]: true },
            },
            attributes: ['id']
        });

        if (stageExist) {
            return HELPERS.responseHelper.createErrorResponse(
                MESSAGES.STAGE_ALREADY_EXIST,
                ERROR_TYPES.BAD_REQUEST
            );
        }

        if (fullPayment) {
            stagePayload.status = PAYMENT_STAGE_STATUS.COMPLETED,
                stagePayload.paymentStatus = PAYMENT_STATUS.PAID
            stagePayload.paidAmount = stagePayload.totalAmount
        }
        const stage = await paymentStageModel.create(stagePayload);
        await walletService.handleWalletTransaction(walletId, totalAmount, TRANSACTION_TYPE.DEBIT, ORDER_TYPE.PAYMENT_STAGE, stage.id)

        const response = {
            id: stage?.id,
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
paymentStageController.updatePaymentStage = async (payload) => {
    try {
        const { stageId, name, description, totalAmount, paidAmount, dueDate, status, paymentStatus, approved, order } = payload;
        let updatePayload = {
            name,
            description,
            totalAmount,
            paidAmount,
            dueDate,
            status,
            paymentStatus,
            approved,
            order
        };

        // const existingStage = await paymentStageModel.findOne({
        //     where: { id: stageId },
        //     attributes: ['id', 'walletId', 'totalAmount']
        // });

        await paymentStageModel.update(updatePayload, {
            where: { id: stageId, isDeleted: { [Op.ne]: true } },
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
paymentStageController.paymentStageList = async (payload) => {
    try {
        const { walletId } = payload;
        const stages = await paymentStageModel.findAll({
            where: {
                walletId: walletId,
                isDeleted: { [Op.ne]: true },
            },
            attributes: ["id", "name", "description", "totalAmount", "paidAmount", "dueDate", "status", "paymentStatus", 'approved', 'order'],
            order: [["order", "ASC"]],
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
paymentStageController.getPaymentStageDetails = async (payload) => {
    try {
        const { stageId } = payload;
        const stages = await paymentStageModel.findOne({
            where: {
                id: stageId,
                isDeleted: { [Op.ne]: true },
            },
            attributes: ["id", "name", "description", "totalAmount", "paidAmount", "dueDate", "status", "paymentStatus", 'approved', 'order'],
            order: [["order", "ASC"]],
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
paymentStageController.deletePaymentStage = async (payload) => {
    try {
        const { stageId } = payload;

        await paymentStageModel.update(
            { isDeleted: true },
            { where: { id: stageId } }
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

module.exports = paymentStageController;
