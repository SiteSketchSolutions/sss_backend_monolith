const HELPERS = require("../helpers");
const { Op } = require("sequelize");
const { MESSAGES, ERROR_TYPES, TRANSACTION_TYPE, ORDER_TYPE, PAYMENT_STAGE_STATUS, PAYMENT_STATUS } = require("../utils/constants");
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
        const { stageId, amount, method, referenceId, note } = payload;
        let stagePayload = {
            stageId, amount, method, referenceId, note
        };
        const stageExist = await paymentStage.findOne({
            where: {
                id: stageId,
                isDeleted: { [Op.ne]: true }
            },
            attributes: ['id', 'walletId', 'status', 'totalAmount', 'paidAmount', 'dueDate']
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
        await handleWalletTransaction(stageExist.walletId, amount, TRANSACTION_TYPE.CREDIT, ORDER_TYPE.PART_PAYMENT, partPaymentDetails?.id);

        // Increment the paidAmount
        await paymentStage.increment('paidAmount', { by: amount, where: { id: stageId } });

        // Get the updated payment stage to check total vs paid amount
        const updatedStage = await paymentStage.findOne({
            where: { id: stageId },
            attributes: ['totalAmount', 'paidAmount', 'dueDate']
        });

        // Determine the new payment status
        let newStatus = null;
        let newPaymentStatus = null;

        const totalAmount = parseFloat(updatedStage.totalAmount);
        const paidAmount = parseFloat(updatedStage.paidAmount);
        const currentDate = new Date();
        const dueDate = updatedStage.dueDate ? new Date(updatedStage.dueDate) : null;
        const isPastDue = dueDate && dueDate < currentDate;

        if (paidAmount >= totalAmount) {
            // Fully paid
            newPaymentStatus = PAYMENT_STATUS.PAID;
            newStatus = PAYMENT_STAGE_STATUS.COMPLETED;
        } else if (isPastDue) {
            // Past due date and not fully paid
            newPaymentStatus = PAYMENT_STATUS.OVERDUE;
        } else if (paidAmount > 0) {
            // Partially paid
            newPaymentStatus = PAYMENT_STATUS.PARTIALLY_PAID;
        }

        // Update the payment stage status if needed
        if (newPaymentStatus || newStatus) {
            const updateData = {};
            if (newPaymentStatus) updateData.paymentStatus = newPaymentStatus;
            if (newStatus) updateData.status = newStatus;

            await paymentStage.update(updateData, { where: { id: stageId } });
        }

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
        const { paymentId, amount, method, referenceId } = payload;

        // Get the existing part payment to calculate the difference in amount
        const existingPartPayment = await partPaymentStageModel.findOne({
            where: { id: paymentId, isDeleted: { [Op.ne]: true } },
            attributes: ['id', 'stageId', 'amount']
        });

        if (!existingPartPayment) {
            return HELPERS.responseHelper.createErrorResponse(
                "Part payment not found",
                ERROR_TYPES.DATA_NOT_FOUND
            );
        }

        const oldAmount = parseFloat(existingPartPayment.amount);
        const newAmount = amount !== undefined ? parseFloat(amount) : oldAmount;
        const amountDifference = newAmount - oldAmount;

        // Update the part payment
        let updatePayload = {};
        if (amount !== undefined) updatePayload.amount = amount;
        if (method !== undefined) updatePayload.method = method;
        if (referenceId !== undefined) updatePayload.referenceId = referenceId;

        await partPaymentStageModel.update(updatePayload, {
            where: { id: paymentId, isDeleted: { [Op.ne]: true } },
        });

        // If amount has changed, update the payment stage's paidAmount and status
        if (amountDifference !== 0) {
            const stageId = existingPartPayment.stageId;

            // Get the payment stage
            const paymentStageDetails = await paymentStage.findOne({
                where: { id: stageId },
                attributes: ['id', 'walletId', 'totalAmount', 'paidAmount', 'dueDate']
            });

            if (!paymentStageDetails) {
                return HELPERS.responseHelper.createErrorResponse(
                    MESSAGES.STAGE_NOT_EXIST,
                    ERROR_TYPES.DATA_NOT_FOUND
                );
            }

            // Update the wallet transaction if amount has changed
            if (amountDifference > 0) {
                // Additional amount paid - credit to wallet
                await handleWalletTransaction(
                    paymentStageDetails.walletId,
                    Math.abs(amountDifference),
                    TRANSACTION_TYPE.CREDIT,
                    ORDER_TYPE.PART_PAYMENT,
                    paymentId
                );
            } else if (amountDifference < 0) {
                // Amount reduced - debit from wallet
                await handleWalletTransaction(
                    paymentStageDetails.walletId,
                    Math.abs(amountDifference),
                    TRANSACTION_TYPE.DEBIT,
                    ORDER_TYPE.PART_PAYMENT,
                    paymentId
                );
            }

            // Update the paidAmount in the payment stage
            if (amountDifference > 0) {
                await paymentStage.increment('paidAmount', { by: amountDifference, where: { id: stageId } });
            } else {
                await paymentStage.decrement('paidAmount', { by: Math.abs(amountDifference), where: { id: stageId } });
            }

            // Get the updated payment stage to check total vs paid amount
            const updatedStage = await paymentStage.findOne({
                where: { id: stageId },
                attributes: ['totalAmount', 'paidAmount', 'dueDate']
            });

            // Determine the new payment status
            let newStatus = null;
            let newPaymentStatus = null;

            const totalAmount = parseFloat(updatedStage.totalAmount);
            const paidAmount = parseFloat(updatedStage.paidAmount);
            const currentDate = new Date();
            const dueDate = updatedStage.dueDate ? new Date(updatedStage.dueDate) : null;
            const isPastDue = dueDate && dueDate < currentDate;

            if (paidAmount >= totalAmount) {
                // Fully paid
                newPaymentStatus = PAYMENT_STATUS.PAID;
                newStatus = PAYMENT_STAGE_STATUS.COMPLETED;
            } else if (isPastDue) {
                // Past due date and not fully paid
                newPaymentStatus = PAYMENT_STATUS.OVERDUE;
            } else if (paidAmount > 0) {
                // Partially paid
                newPaymentStatus = PAYMENT_STATUS.PARTIALLY_PAID;
            } else {
                // Not paid at all
                newPaymentStatus = PAYMENT_STATUS.UNPAID;
            }

            // Update the payment stage status if needed
            if (newPaymentStatus || newStatus) {
                const updateData = {};
                if (newPaymentStatus) updateData.paymentStatus = newPaymentStatus;
                if (newStatus) updateData.status = newStatus;

                await paymentStage.update(updateData, { where: { id: stageId } });
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
partPaymentStageController.getPartPaymentList = async (payload) => {
    try {
        const { stageId } = payload;
        const stages = await partPaymentStageModel.findAll({
            where: {
                stageId: stageId,
                isDeleted: { [Op.ne]: true },
            },
            attributes: ["id", "amount", "method", "referenceId", "invoiceNo", "acknowledgementSent"],
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
            attributes: ["id", "amount", "method", "referenceId", "invoiceNo", "acknowledgementSent"],
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

        // Get the part payment details before deleting
        const partPaymentDetails = await partPaymentStageModel.findOne({
            where: { id: paymentId, isDeleted: { [Op.ne]: true } },
            attributes: ['id', 'stageId', 'amount']
        });

        if (!partPaymentDetails) {
            return HELPERS.responseHelper.createErrorResponse(
                "Part payment not found",
                ERROR_TYPES.DATA_NOT_FOUND
            );
        }

        const stageId = partPaymentDetails.stageId;
        const amount = parseFloat(partPaymentDetails.amount);

        // Mark the part payment as deleted
        await partPaymentStageModel.update(
            { isDeleted: true },
            { where: { id: paymentId } }
        );

        // Get the payment stage details
        const paymentStageDetails = await paymentStage.findOne({
            where: { id: stageId },
            attributes: ['id', 'walletId', 'totalAmount', 'paidAmount', 'dueDate']
        });

        if (!paymentStageDetails) {
            return HELPERS.responseHelper.createErrorResponse(
                MESSAGES.STAGE_NOT_EXIST,
                ERROR_TYPES.DATA_NOT_FOUND
            );
        }

        // Debit the amount from wallet since the payment is being deleted
        await handleWalletTransaction(
            paymentStageDetails.walletId,
            amount,
            TRANSACTION_TYPE.DEBIT,
            ORDER_TYPE.PART_PAYMENT,
            paymentId
        );

        // Decrement the paidAmount in the payment stage
        await paymentStage.decrement('paidAmount', { by: amount, where: { id: stageId } });

        // Get the updated payment stage to check total vs paid amount
        const updatedStage = await paymentStage.findOne({
            where: { id: stageId },
            attributes: ['totalAmount', 'paidAmount', 'dueDate']
        });

        // Determine the new payment status
        let newStatus = null;
        let newPaymentStatus = null;

        const totalAmount = parseFloat(updatedStage.totalAmount);
        const paidAmount = parseFloat(updatedStage.paidAmount);
        const currentDate = new Date();
        const dueDate = updatedStage.dueDate ? new Date(updatedStage.dueDate) : null;
        const isPastDue = dueDate && dueDate < currentDate;

        if (paidAmount >= totalAmount) {
            // Fully paid
            newPaymentStatus = PAYMENT_STATUS.PAID;
            newStatus = PAYMENT_STAGE_STATUS.COMPLETED;
        } else if (isPastDue) {
            // Past due date and not fully paid
            newPaymentStatus = PAYMENT_STATUS.OVERDUE;
        } else if (paidAmount > 0) {
            // Partially paid
            newPaymentStatus = PAYMENT_STATUS.PARTIALLY_PAID;
        } else {
            // Not paid at all
            newPaymentStatus = PAYMENT_STATUS.UNPAID;
        }

        // Update the payment stage status if needed
        if (newPaymentStatus || newStatus) {
            const updateData = {};
            if (newPaymentStatus) updateData.paymentStatus = newPaymentStatus;
            if (newStatus) updateData.status = newStatus;

            await paymentStage.update(updateData, { where: { id: stageId } });
        }

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
