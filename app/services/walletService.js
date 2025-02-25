const { TRANSACTION_STATUS, TRANSACTION_TYPE, USER_TYPES } = require("../utils/constants");
const walletModel = require("../models/walletModel");
const transactionModel = require("../models/transactionModel")
const sequelize = require("../startup/dbConfig");
const { getCurrencyFromCountryCode } = require("../utils/utils");

let walletService = {};

/**
 * Helper function to create and handle wallet transaction with type ( credit, debit)
 * @param {*} walletId 
 * @param {*} transactionAmount 
 * @param {*} transactionType 
 * @param {*} orderType 
 * @param {*} referenceId 
 * @returns 
 */
walletService.handleWalletTransaction = async (walletId, transactionAmount, transactionType, orderType, referenceId = null) => {
    let transactionCriteria;
    try {
        const transactionPayload = {
            walletId,
            amount: transactionAmount,
            transactionType,
            orderType,
            referenceId: referenceId !== null ? String(referenceId) : null
        }
        const transactionDetails = await transactionModel.create(transactionPayload);
        transactionCriteria = { id: transactionDetails.id };

        const transactionResult = await sequelize.transaction(async (t) => {
            if (transactionType === TRANSACTION_TYPE["DEBIT"]) {
                await walletModel.decrement('balance', { by: transactionAmount, where: { id: walletId }, transaction: t });
            } else {
                await walletModel.increment('balance', { by: transactionAmount, where: { id: walletId }, transaction: t });
            }
            await transactionModel.update({ status: TRANSACTION_STATUS["COMPLETED"] }, { where: transactionCriteria });
            return 'Transaction completed successfully!';
        });
    } catch (error) {
        await transactionModel.update({ status: TRANSACTION_STATUS["FAILED"] }, { where: transactionCriteria });
        return error
    }
}

/**
 * Helper function to hold the balance from wallet 
 * @param {*} walletId 
 * @param {*} amountToHold 
 * @returns 
 */
walletService.holdWalletBalance = async (walletId, amountToHold) => {
    try {
        const holdTransaction = await sequelize.transaction(async (t) => {
            await walletModel.increment('holdBalance', { by: amountToHold, where: { id: walletId }, transaction: t });
            return 'Transaction hold balance completed!';
        });
    } catch (error) {
        return error
    }
}

/**
 * Helper function to release the holden balance from wallet
 * @param {*} walletId 
 * @param {*} amountToRelease 
 */
walletService.releaseHoldenWalletBalance = async (walletId, amountToRelease) => {
    const releaseTransaction = await sequelize.transaction(async (t) => {
        await walletModel.decrement('holdBalance', { by: amountToRelease, where: { id: walletId }, transaction: t });
        return 'Transaction release Holden balance completed!';
    });
    console.log(releaseTransaction, "releaseTransaction");
}

/**
 * Helper function to create wallet and map wallet id to user based on user type.
 * @param {Number} userType - User's userType
 * @param {Number} id - The id of the user who are wanting to create
 * @param {String} country  -the country code of user located
 * @returns {Object} - Returns created wallet details
 */
walletService.createWalletAndMapByUserType = async (userType, id, country) => {
    try {
        const currencyFromCountry = getCurrencyFromCountryCode(country)
        const walletDetails = await walletModel.create({ currency: currencyFromCountry });
        let criteria = { id };
        let dataToUpdate = { walletId: walletDetails.id }
        switch (userType) {
            case USER_TYPES.USER:
                await userModel.update(dataToUpdate, { where: criteria });
                break;
            case USER_TYPES.COLLECTOR:
                await collectorModel.update(dataToUpdate, { where: criteria });
                break;
            case USER_TYPES.RECYCLER:
                await recyclerModel.update(dataToUpdate, { where: criteria });
                break;
            default:
                break;
        }
        return walletDetails;
    } catch (error) {
        throw error
    }
}

/**
 * Function to process wallet transaction
 * @param {*} walletId 
 * @param {*} walletAmount 
 * @param {*} transactionType 
 */
walletService.processWalletTransaction = async (walletId, walletAmount, transactionType) => {
    try {
        if (transactionType === TRANSACTION_TYPE.CREDIT) {
            await walletModel.increment('balance', { by: walletAmount, where: { id: walletId } })
        } else if (transactionType === TRANSACTION_TYPE.DEBIT) {
            await walletModel.decrement('balance', { by: walletAmount, where: { id: walletId } })
        }
    } catch (error) {
        throw error
    }
}
module.exports = walletService;