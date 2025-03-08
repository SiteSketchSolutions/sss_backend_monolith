const HELPERS = require("../helpers");
const { Op } = require("sequelize");
const { MESSAGES, ERROR_TYPES } = require("../utils/constants");
const bankAccountModel = require("../models/bankAccountModel");

/**************************************************
 ***************** Bank Account Controller ***************
 **************************************************/
let bankAccountController = {};

/**
 * Function to create bank account
 * @param {*} payload
 * @returns
 */
bankAccountController.createBankAccount = async (payload) => {
    try {
        const { name, accountNumber, ifscCode, bankName, accountType, branchName, description, isActive } = payload;

        // Check if account number already exists
        const accountExists = await bankAccountModel.findOne({
            where: {
                accountNumber,
                isDeleted: { [Op.ne]: true }
            }
        });

        if (accountExists) {
            return HELPERS.responseHelper.createErrorResponse(
                MESSAGES.BANK_ACCOUNT_ALREADY_EXISTS,
                ERROR_TYPES.ALREADY_EXISTS
            );
        }

        // Create bank account
        const bankAccountData = {
            name,
            accountNumber,
            ifscCode,
            bankName,
            accountType: accountType || "Savings",
            branchName,
            description,
            isActive: isActive !== undefined ? isActive : true
        };

        const bankAccount = await bankAccountModel.create(bankAccountData);

        return Object.assign(
            HELPERS.responseHelper.createSuccessResponse(
                MESSAGES.BANK_ACCOUNT_CREATED_SUCCESSFULLY
            ),
            { data: { id: bankAccount.id } }
        );
    } catch (error) {
        throw HELPERS.responseHelper.createErrorResponse(
            error.message,
            ERROR_TYPES.SOMETHING_WENT_WRONG
        );
    }
};

/**
 * Function to update bank account
 * @param {*} payload
 * @returns
 */
bankAccountController.updateBankAccount = async (payload) => {
    try {
        const { accountId, name, accountNumber, ifscCode, bankName, accountType, branchName, description, isActive } = payload;

        // Check if bank account exists
        const bankAccount = await bankAccountModel.findOne({
            where: {
                id: accountId,
                isDeleted: { [Op.ne]: true }
            }
        });

        if (!bankAccount) {
            return HELPERS.responseHelper.createErrorResponse(
                MESSAGES.BANK_ACCOUNT_NOT_FOUND,
                ERROR_TYPES.DATA_NOT_FOUND
            );
        }

        // If account number is being changed, check if new account number already exists
        if (accountNumber && accountNumber !== bankAccount.accountNumber) {
            const accountExists = await bankAccountModel.findOne({
                where: {
                    accountNumber,
                    id: { [Op.ne]: accountId },
                    isDeleted: { [Op.ne]: true }
                }
            });

            if (accountExists) {
                return HELPERS.responseHelper.createErrorResponse(
                    MESSAGES.BANK_ACCOUNT_ALREADY_EXISTS,
                    ERROR_TYPES.ALREADY_EXISTS
                );
            }
        }

        // Update bank account
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (accountNumber !== undefined) updateData.accountNumber = accountNumber;
        if (ifscCode !== undefined) updateData.ifscCode = ifscCode;
        if (bankName !== undefined) updateData.bankName = bankName;
        if (accountType !== undefined) updateData.accountType = accountType;
        if (branchName !== undefined) updateData.branchName = branchName;
        if (description !== undefined) updateData.description = description;
        if (isActive !== undefined) updateData.isActive = isActive;

        await bankAccountModel.update(updateData, {
            where: { id: accountId }
        });

        return HELPERS.responseHelper.createSuccessResponse(
            MESSAGES.BANK_ACCOUNT_UPDATED_SUCCESSFULLY
        );
    } catch (error) {
        throw HELPERS.responseHelper.createErrorResponse(
            error.message,
            ERROR_TYPES.SOMETHING_WENT_WRONG
        );
    }
};

/**
 * Function to get bank account details
 * @param {*} payload
 * @returns
 */
bankAccountController.getBankAccountDetails = async (payload) => {
    try {
        const { accountId } = payload;

        const bankAccount = await bankAccountModel.findOne({
            where: {
                id: accountId,
                isDeleted: { [Op.ne]: true }
            },
            attributes: [
                'id', 'name', 'accountNumber', 'ifscCode', 'bankName',
                'accountType', 'branchName', 'description', 'isActive',
                'createdAt', 'updatedAt'
            ]
        });

        if (!bankAccount) {
            return HELPERS.responseHelper.createErrorResponse(
                MESSAGES.BANK_ACCOUNT_NOT_FOUND,
                ERROR_TYPES.DATA_NOT_FOUND
            );
        }

        return Object.assign(
            HELPERS.responseHelper.createSuccessResponse(
                MESSAGES.BANK_ACCOUNT_FETCHED_SUCCESSFULLY
            ),
            { data: bankAccount }
        );
    } catch (error) {
        throw HELPERS.responseHelper.createErrorResponse(
            error.message,
            ERROR_TYPES.SOMETHING_WENT_WRONG
        );
    }
};

/**
 * Function to list all bank accounts
 * @param {*} payload
 * @returns
 */
bankAccountController.listBankAccounts = async (payload) => {
    try {
        const { isActive } = payload;

        const whereClause = {
            isDeleted: { [Op.ne]: true }
        };

        // Filter by active status if provided
        if (isActive !== undefined) {
            whereClause.isActive = isActive;
        }

        const bankAccounts = await bankAccountModel.findAll({
            where: whereClause,
            attributes: [
                'id', 'name', 'accountNumber', 'ifscCode', 'bankName',
                'accountType', 'branchName', 'description', 'isActive',
                'createdAt', 'updatedAt'
            ],
            order: [['createdAt', 'DESC']]
        });

        return Object.assign(
            HELPERS.responseHelper.createSuccessResponse(
                MESSAGES.BANK_ACCOUNT_LIST_FETCHED_SUCCESSFULLY
            ),
            { data: bankAccounts }
        );
    } catch (error) {
        throw HELPERS.responseHelper.createErrorResponse(
            error.message,
            ERROR_TYPES.SOMETHING_WENT_WRONG
        );
    }
};

/**
 * Function to delete bank account (soft delete)
 * @param {*} payload
 * @returns
 */
bankAccountController.deleteBankAccount = async (payload) => {
    try {
        const { accountId } = payload;

        // Check if bank account exists
        const bankAccount = await bankAccountModel.findOne({
            where: {
                id: accountId,
                isDeleted: { [Op.ne]: true }
            }
        });

        if (!bankAccount) {
            return HELPERS.responseHelper.createErrorResponse(
                MESSAGES.BANK_ACCOUNT_NOT_FOUND,
                ERROR_TYPES.DATA_NOT_FOUND
            );
        }

        // Soft delete the bank account
        await bankAccountModel.update(
            { isDeleted: true },
            { where: { id: accountId } }
        );

        return HELPERS.responseHelper.createSuccessResponse(
            MESSAGES.BANK_ACCOUNT_DELETED_SUCCESSFULLY
        );
    } catch (error) {
        throw HELPERS.responseHelper.createErrorResponse(
            error.message,
            ERROR_TYPES.SOMETHING_WENT_WRONG
        );
    }
};

/**
 * Function to activate/deactivate bank account
 * @param {*} payload
 * @returns
 */
bankAccountController.toggleBankAccountStatus = async (payload) => {
    try {
        const { accountId, isActive } = payload;

        // Check if bank account exists
        const bankAccount = await bankAccountModel.findOne({
            where: {
                id: accountId,
                isDeleted: { [Op.ne]: true }
            }
        });

        if (!bankAccount) {
            return HELPERS.responseHelper.createErrorResponse(
                MESSAGES.BANK_ACCOUNT_NOT_FOUND,
                ERROR_TYPES.DATA_NOT_FOUND
            );
        }

        // Update the active status
        await bankAccountModel.update(
            { isActive },
            { where: { id: accountId } }
        );

        const message = isActive ?
            MESSAGES.BANK_ACCOUNT_ACTIVATED_SUCCESSFULLY :
            MESSAGES.BANK_ACCOUNT_DEACTIVATED_SUCCESSFULLY;

        return HELPERS.responseHelper.createSuccessResponse(message);
    } catch (error) {
        throw HELPERS.responseHelper.createErrorResponse(
            error.message,
            ERROR_TYPES.SOMETHING_WENT_WRONG
        );
    }
};

module.exports = bankAccountController; 