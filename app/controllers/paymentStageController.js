const HELPERS = require("../helpers");
const { Op } = require("sequelize");
const { MESSAGES, ERROR_TYPES, PAYMENT_STAGE_STATUS, PAYMENT_STATUS, TRANSACTION_TYPE, ORDER_TYPE } = require("../utils/constants");
const paymentStageModel = require("../models/paymentStageModel");
const walletService = require("../services/walletService");
const partPaymentStage = require("../models/partPaymentStageModel");

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
        } else if (paidAmount > 0) {
            stagePayload.paymentStatus = PAYMENT_STATUS.PARTIALLY_PAID
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
        const { stageId, name, description, totalAmount, paidAmount, dueDate, status, paymentStatus, approved, order, fullPayment } = payload;
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

        // Fetch the existing payment stage to get current values
        const existingStage = await paymentStageModel.findOne({
            where: { id: stageId, isDeleted: { [Op.ne]: true } },
            attributes: ['id', 'walletId', 'totalAmount', 'paidAmount', 'fullPayment']
        });

        if (!existingStage) {
            return HELPERS.responseHelper.createErrorResponse(
                MESSAGES.STAGE_NOT_FOUND,
                ERROR_TYPES.DATA_NOT_FOUND
            );
        }

        // Handle fullPayment case if provided.
        if (fullPayment !== undefined) {
            updatePayload.fullPayment = fullPayment;
            if (fullPayment) {
                updatePayload.status = PAYMENT_STAGE_STATUS.COMPLETED;
                updatePayload.paymentStatus = PAYMENT_STATUS.PAID;
                updatePayload.paidAmount = totalAmount || existingStage.totalAmount;
            }
        }

        // Calculate the difference in total amount
        const oldTotalAmount = parseFloat(existingStage.totalAmount);
        const newTotalAmount = totalAmount ? parseFloat(totalAmount) : oldTotalAmount;
        const amountDifference = Math.abs(newTotalAmount - oldTotalAmount);

        // Determine payment status based on conditions if not explicitly provided
        if (paymentStatus === undefined) {
            const currentPaidAmount = paidAmount !== undefined ? parseFloat(paidAmount) : parseFloat(existingStage.paidAmount);
            const finalTotalAmount = totalAmount !== undefined ? parseFloat(totalAmount) : parseFloat(existingStage.totalAmount);
            const currentDueDate = dueDate || existingStage.dueDate;
            const isPastDue = currentDueDate && new Date(currentDueDate) < new Date();

            // Determine payment status based on paid amount and due date
            if (currentPaidAmount >= finalTotalAmount) {
                // Fully paid
                updatePayload.paymentStatus = PAYMENT_STATUS.PAID;
                // If fully paid, also update status to completed
                if (status === undefined) {
                    updatePayload.status = PAYMENT_STAGE_STATUS.COMPLETED;
                }
            } else if (isPastDue) {
                // Past due date and not fully paid
                updatePayload.paymentStatus = PAYMENT_STATUS.OVERDUE;
            } else if (currentPaidAmount > 0) {
                // Partially paid
                updatePayload.paymentStatus = PAYMENT_STATUS.PARTIALLY_PAID;
            } else {
                // Not paid at all
                updatePayload.paymentStatus = PAYMENT_STATUS.UNPAID;
            }
        }

        // Update the payment stage
        await paymentStageModel.update(updatePayload, {
            where: { id: stageId, isDeleted: { [Op.ne]: true } },
        });

        // Handle wallet transaction if total amount has changed
        if (newTotalAmount !== oldTotalAmount && amountDifference > 0) {
            try {
                if (newTotalAmount < oldTotalAmount) {
                    // Credit the difference back to wallet if new amount is less
                    await walletService.handleWalletTransaction(
                        existingStage.walletId,
                        amountDifference,
                        TRANSACTION_TYPE.CREDIT,
                        ORDER_TYPE.PAYMENT_STAGE,
                        stageId
                    );
                } else {
                    // Debit the additional amount from wallet if new amount is more
                    await walletService.handleWalletTransaction(
                        existingStage.walletId,
                        amountDifference,
                        TRANSACTION_TYPE.DEBIT,
                        ORDER_TYPE.PAYMENT_STAGE,
                        stageId
                    );
                }
            } catch (transactionError) {
                console.error("Error handling wallet transaction:", transactionError);
                // Consider whether to revert the payment stage update or just log the error
                // For now, we'll just log the error and continue
            }
        }

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

        // First, check and update any overdue stages
        await paymentStageController.updateOverduePaymentStages();

        const stages = await paymentStageModel.findAll({
            where: {
                walletId: walletId,
                isDeleted: { [Op.ne]: true },
            },
            attributes: ["id", "name", "description", "totalAmount", "paidAmount", "dueDate", "status", "paymentStatus", 'approved', 'order', 'fullPayment'],
            order: [["order", "ASC"]],
            include: [
                {
                    model: partPaymentStage,
                    attributes: ['id', 'referenceId', 'method', 'invoiceNo', 'amount']
                }
            ]
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
 * Function to get payment stage details
 * @param {*} payload
 * @returns
 */
paymentStageController.getPaymentStageDetails = async (payload) => {
    try {
        const { stageId } = payload;

        // First, check if this specific stage is overdue
        const currentDate = new Date();
        const stage = await paymentStageModel.findOne({
            where: {
                id: stageId,
                isDeleted: { [Op.ne]: true },
            },
            attributes: ["id", "name", "description", "totalAmount", "paidAmount", "dueDate", "status", "paymentStatus", 'approved', 'order', 'fullPayment'],
        });

        if (!stage) {
            return HELPERS.responseHelper.createErrorResponse(
                MESSAGES.STAGE_NOT_FOUND,
                ERROR_TYPES.DATA_NOT_FOUND
            );
        }

        // Check if stage is overdue but not marked as such
        if (stage.dueDate && new Date(stage.dueDate) < currentDate &&
            stage.paymentStatus !== PAYMENT_STATUS.PAID &&
            stage.paymentStatus !== PAYMENT_STATUS.OVERDUE) {

            // Update to overdue status
            await paymentStageModel.update(
                { paymentStatus: PAYMENT_STATUS.OVERDUE },
                { where: { id: stageId } }
            );

            // Refresh the stage data
            stage.paymentStatus = PAYMENT_STATUS.OVERDUE;
        }

        return Object.assign(
            HELPERS.responseHelper.createSuccessResponse(
                MESSAGES.STAGE_LIST_SUCCESSFULLY
            ),
            { data: stage }
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

/**
 * Function to check and update overdue payment stages
 * @returns {Promise<void>}
 */
paymentStageController.updateOverduePaymentStages = async () => {
    try {
        const currentDate = new Date();

        // Find all payment stages that are:
        // 1. Not deleted
        // 2. Due date has passed
        // 3. Not fully paid (payment status is not PAID)
        // 4. Not already marked as OVERDUE
        const overdueStages = await paymentStageModel.findAll({
            where: {
                isDeleted: { [Op.ne]: true },
                dueDate: { [Op.lt]: currentDate },
                paymentStatus: { [Op.notIn]: [PAYMENT_STATUS.PAID, PAYMENT_STATUS.OVERDUE] }
            },
            attributes: ['id']
        });

        if (overdueStages.length > 0) {
            console.log(`Found ${overdueStages.length} overdue payment stages to update`);

            // Update all overdue stages to OVERDUE status
            await paymentStageModel.update(
                { paymentStatus: PAYMENT_STATUS.OVERDUE },
                {
                    where: {
                        id: { [Op.in]: overdueStages.map(stage => stage.id) }
                    }
                }
            );
        }

        return Object.assign(
            HELPERS.responseHelper.createSuccessResponse(
                MESSAGES.STAGE_UPDATED_SUCCESSFULLY
            ),
            { data: { updatedCount: overdueStages.length } }
        );
    } catch (error) {
        throw HELPERS.responseHelper.createErrorResponse(
            error.message,
            ERROR_TYPES.SOMETHING_WENT_WRONG
        );
    }
};

module.exports = paymentStageController;
