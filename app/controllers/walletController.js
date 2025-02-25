// "use strict";
const HELPERS = require("../helpers");
const { MESSAGES, ERROR_TYPES, TRANSACTION_STATUS, TRANSACTION_TYPE, ORDER_TYPE, USER_TYPES } = require("../utils/constants");
const walletModel = require("../models/walletModel");
const transactionModel = require("../models/transactionModel")
const { handleWalletTransaction } = require("../services/walletService");
const { Op } = require("sequelize");
/**************************************************
 ***************** Wallet controller ***************
 **************************************************/

let walletController = {};

walletController.createWallet = async (payload) => {
    const { projectId } = payload;
    try {
        let walletDetails = await walletModel.findOne({
            where: { projectId: projectId, isDeleted: { [Op.ne]: true } },
            attributes: ['id']
        });
        if (!walletDetails) {
            const walletPayload = {
                projectId: projectId
            }
            walletDetails = await walletModel.create(walletPayload)
        } else {
            return Object.assign(
                HELPERS.responseHelper.createErrorResponse(MESSAGES.WALLET_ALREADY_EXIST, ERROR_TYPES.ALREADY_EXISTS));
        }
        return Object.assign(
            HELPERS.responseHelper.createSuccessResponse(MESSAGES.WALLET_CREATED_SUCCESSFULLY), { data: walletDetails });
    } catch (error) {
        throw HELPERS.responseHelper.createErrorResponse(error.message, ERROR_TYPES.SOMETHING_WENT_WRONG);
    }
};

walletController.addMoneyToWallet = async (payload) => {
    const { walletId, amount } = payload;
    let transactionCriteria;
    try {
        const walletDetails = await walletModel.findByPk(walletId);
        if (!walletDetails) {
            HELPERS.responseHelper.createErrorResponse(MESSAGES.NO_WALLET_FOUND, ERROR_TYPES.ALREADY_EXISTS);
        }
        await handleWalletTransaction(walletDetails.id, amount, TRANSACTION_TYPE["CREDIT"], ORDER_TYPE["WALLET_TOPUP"])
        return Object.assign(
            HELPERS.responseHelper.createSuccessResponse(MESSAGES.WALLET.ADDED_MONEY_TO_WALLET));
    } catch (error) {
        await transactionModel.update({ status: TRANSACTION_STATUS["FAILED"] }, { where: transactionCriteria });
        throw HELPERS.responseHelper.createErrorResponse(error.message, ERROR_TYPES.SOMETHING_WENT_WRONG);
    }
};

walletController.withdrawMoneyFromWallet = async (payload) => {
    const { walletId, amount } = payload;
    let transactionCriteria;
    try {
        let walletDetails = await walletModel.findByPk(walletId);
        if (!walletDetails) {
            HELPERS.responseHelper.createErrorResponse(MESSAGES.NO_WALLET_FOUND, ERROR_TYPES.ALREADY_EXISTS);
        }
        const availableBalance = walletDetails.balance - walletDetails.holdBalance;
        if (availableBalance >= payload.amount) {
            await handleWalletTransaction(walletDetails.id, amount, TRANSACTION_TYPE["DEBIT"], ORDER_TYPE["WALLET_WITHDRAWAL"], null);
        } else {
            return Object.assign(HELPERS.responseHelper.createErrorResponse(MESSAGES.INSUFFICIENT_BALANCE, ERROR_TYPES.FORBIDDEN));
        }
        return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.WITHDRAW_MONEY_FROM_WALLET));
    } catch (error) {
        await transactionModel.update({ status: TRANSACTION_STATUS["FAILED"] }, { where: transactionCriteria });
        throw HELPERS.responseHelper.createErrorResponse(error.message, ERROR_TYPES.SOMETHING_WENT_WRONG);
    }
};

walletController.getWalletDetails = async (payload) => {
    try {
        const { walletId } = payload;
        const walletDetails = await walletModel.findByPk(walletId);
        return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.WALLET_DETAILS_FETCHED_SUCCESSFULLY), { data: walletDetails });
    } catch (error) {
        throw HELPERS.responseHelper.createErrorResponse(error.message, ERROR_TYPES.SOMETHING_WENT_WRONG);
    }
};


walletController.getTransactionList = async (payload) => {
    try {
        const { walletId, transactionType } = payload;
        const transactionStatusList = [TRANSACTION_STATUS.IN_PROGRESS, TRANSACTION_STATUS.COMPLETED, TRANSACTION_STATUS.FAILED, TRANSACTION_STATUS.REQUESTED, TRANSACTION_STATUS.REVERTED, TRANSACTION_STATUS.CANCELLED]
        let criteria = { walletId: walletId, status: transactionStatusList };
        if (transactionType) {
            criteria.transactionType = transactionType
        }
        const transactionList = await transactionModel.findAll({ where: criteria, order: [['id', 'DESC']] });
        const transactionListWithCurrency = transactionList.map((transaction) => {
            return {
                ...transaction.toJSON(),
                referenceId: transaction.referenceId ?? "-",
                currency: ""
            }
        })
        return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.TRANSACTION_LIST_FETCHED_SUCCESSFULLY), { data: transactionListWithCurrency });
    } catch (error) {
        throw HELPERS.responseHelper.createErrorResponse(error.message, ERROR_TYPES.SOMETHING_WENT_WRONG);
    }
};

// walletController.getQuickAmountList = async (payload) => {
//     try {
//         const locale = payload.headers["content-language"];
//         const { country, userType } = payload.user;
//         let quickAmountList = [];
//         if (CONSTANTS.WALLET_QUICK_AMOUNT_LIST[userType].hasOwnProperty(country)) {
//             quickAmountList = CONSTANTS.WALLET_QUICK_AMOUNT_LIST[userType][country]
//         } else {
//             quickAmountList = CONSTANTS.WALLET_QUICK_AMOUNT_LIST[userType]['US']
//         }
//         return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.WALLET.QUICK_AMOUNT_LIST_FETCHED_SUCCESSFULLY, locale), { data: quickAmountList });
//     } catch (error) {
//         throw HELPERS.responseHelper.createErrorResponse(error.message, ERROR_TYPES.SOMETHING_WENT_WRONG);
//     }
// }
/* export walletController */
module.exports = walletController;
