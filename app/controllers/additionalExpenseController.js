const HELPERS = require("../helpers");
const { Op } = require("sequelize");
const { MESSAGES, ERROR_TYPES, PAGINATION } = require("../utils/constants");
const additionalExpenseModel = require("../models/additionalExpenseModel");
const userModel = require("../models/userModel");
const { getPaginationResponse } = require("../utils/utils");

/**************************************************
 *********** Additional Expense Controller *********
 **************************************************/
let additionalExpenseController = {};

/**
 * Function to create an additional expense
 * @param {*} payload
 * @returns
 */
additionalExpenseController.createAdditionalExpense = async (payload) => {
    try {
        const { userId, amount, stageName, note } = payload;

        // Check if the user exists
        const user = await userModel.findOne({
            where: {
                id: userId,
                isDeleted: { [Op.ne]: true }
            }
        });

        if (!user) {
            return HELPERS.responseHelper.createErrorResponse(
                MESSAGES.USER_NOT_FOUND,
                ERROR_TYPES.DATA_NOT_FOUND
            );
        }

        // Create new additional expense
        const additionalExpense = await additionalExpenseModel.create({
            userId,
            amount,
            stageName,
            note,
            status: 'unpaid'
        });

        return Object.assign(
            HELPERS.responseHelper.createSuccessResponse(
                MESSAGES.ADDITIONAL_EXPENSE_CREATED_SUCCESSFULLY
            ),
            {
                data: {
                    id: additionalExpense.id
                }
            }
        );
    } catch (error) {
        console.error("Error in createAdditionalExpense:", error);
        throw HELPERS.responseHelper.createErrorResponse(
            error.message || error.msg || "Something went wrong",
            ERROR_TYPES.SOMETHING_WENT_WRONG
        );
    }
};

/**
 * Function to update an additional expense
 * @param {*} payload
 * @returns
 */
additionalExpenseController.updateAdditionalExpense = async (payload) => {
    try {
        const { additionalExpenseId, amount, stageName, note, status } = payload;

        // Check if the additional expense exists
        const additionalExpense = await additionalExpenseModel.findOne({
            where: {
                id: additionalExpenseId,
                isDeleted: { [Op.ne]: true }
            }
        });

        if (!additionalExpense) {
            return HELPERS.responseHelper.createErrorResponse(
                MESSAGES.ADDITIONAL_EXPENSE_NOT_FOUND,
                ERROR_TYPES.DATA_NOT_FOUND
            );
        }

        // Prepare update payload
        const updatePayload = {};
        if (amount) updatePayload.amount = amount;
        if (stageName) updatePayload.stageName = stageName;
        if (note !== undefined) updatePayload.note = note;
        if (status && ['unpaid', 'settled'].includes(status)) updatePayload.status = status;

        // Update the additional expense
        await additionalExpenseModel.update(updatePayload, {
            where: { id: additionalExpenseId }
        });

        return Object.assign(
            HELPERS.responseHelper.createSuccessResponse(
                MESSAGES.ADDITIONAL_EXPENSE_UPDATED_SUCCESSFULLY
            ),
            {
                data: {
                    id: additionalExpenseId
                }
            }
        );
    } catch (error) {
        console.error("Error in updateAdditionalExpense:", error);
        throw HELPERS.responseHelper.createErrorResponse(
            error.message || error.msg || "Something went wrong",
            ERROR_TYPES.SOMETHING_WENT_WRONG
        );
    }
};

/**
 * Function to get additional expense by ID
 * @param {*} payload
 * @returns
 */
additionalExpenseController.getAdditionalExpenseById = async (payload) => {
    try {
        const { additionalExpenseId } = payload;

        const additionalExpense = await additionalExpenseModel.findOne({
            where: {
                id: additionalExpenseId,
                isDeleted: { [Op.ne]: true }
            }
        });

        if (!additionalExpense) {
            return HELPERS.responseHelper.createErrorResponse(
                MESSAGES.ADDITIONAL_EXPENSE_NOT_FOUND,
                ERROR_TYPES.DATA_NOT_FOUND
            );
        }

        return Object.assign(
            HELPERS.responseHelper.createSuccessResponse(
                MESSAGES.ADDITIONAL_EXPENSE_FETCHED_SUCCESSFULLY
            ),
            {
                data: {
                    id: additionalExpense.id,
                    userId: additionalExpense.userId,
                    amount: additionalExpense.amount,
                    stageName: additionalExpense.stageName,
                    note: additionalExpense.note,
                    status: additionalExpense.status,
                    createdAt: additionalExpense.createdAt,
                    updatedAt: additionalExpense.updatedAt
                }
            }
        );
    } catch (error) {
        console.error("Error in getAdditionalExpenseById:", error);
        throw HELPERS.responseHelper.createErrorResponse(
            error.message || error.msg || "Something went wrong",
            ERROR_TYPES.SOMETHING_WENT_WRONG
        );
    }
};

/**
 * Function to list additional expenses
 * @param {*} payload
 * @returns
 */
additionalExpenseController.getAdditionalExpensesList = async (payload) => {
    try {
        const { userId, status, page, size } = payload;

        const pageNo = page || PAGINATION.DEFAULT_PAGE;
        const pageLimit = size || PAGINATION.DEFAULT_PAGE_LIMIT;

        // Build where clause
        let whereClause = {
            isDeleted: { [Op.ne]: true }
        };

        if (userId) {
            whereClause.userId = userId;
        }

        if (status) {
            whereClause.status = status;
        }

        // Find additional expenses
        const { count, rows } = await additionalExpenseModel.findAndCountAll({
            where: whereClause,
            order: [["createdAt", "DESC"]],
            limit: pageLimit,
            offset: (pageNo - 1) * pageLimit
        });

        // Format the response
        const formattedRows = rows.map(expense => ({
            id: expense.id,
            userId: expense.userId,
            amount: expense.amount,
            stageName: expense.stageName,
            note: expense.note,
            status: expense.status,
            createdAt: expense.createdAt,
            updatedAt: expense.updatedAt
        }));

        const paginationData = { count, pageNo, pageLimit, rows: formattedRows };
        const formattedResponse = getPaginationResponse(paginationData);

        return Object.assign(
            HELPERS.responseHelper.createSuccessResponse(
                MESSAGES.ADDITIONAL_EXPENSE_LIST_FETCHED_SUCCESSFULLY
            ),
            formattedResponse
        );
    } catch (error) {
        console.error("Error in getAdditionalExpensesList:", error);
        throw HELPERS.responseHelper.createErrorResponse(
            error.message || error.msg || "Something went wrong",
            ERROR_TYPES.SOMETHING_WENT_WRONG
        );
    }
};

/**
 * Function to delete an additional expense
 * @param {*} payload
 * @returns
 */
additionalExpenseController.deleteAdditionalExpense = async (payload) => {
    try {
        const { additionalExpenseId } = payload;

        // Check if the additional expense exists
        const additionalExpense = await additionalExpenseModel.findOne({
            where: {
                id: additionalExpenseId,
                isDeleted: { [Op.ne]: true }
            }
        });

        if (!additionalExpense) {
            return HELPERS.responseHelper.createErrorResponse(
                MESSAGES.ADDITIONAL_EXPENSE_NOT_FOUND,
                ERROR_TYPES.DATA_NOT_FOUND
            );
        }

        // Soft delete the additional expense
        await additionalExpenseModel.update(
            { isDeleted: true },
            { where: { id: additionalExpenseId } }
        );

        return HELPERS.responseHelper.createSuccessResponse(
            MESSAGES.ADDITIONAL_EXPENSE_DELETED_SUCCESSFULLY
        );
    } catch (error) {
        console.error("Error in deleteAdditionalExpense:", error);
        throw HELPERS.responseHelper.createErrorResponse(
            error.message || error.msg || "Something went wrong",
            ERROR_TYPES.SOMETHING_WENT_WRONG
        );
    }
};

/**
 * Function to update additional expense status
 * @param {*} payload
 * @returns
 */
additionalExpenseController.updateAdditionalExpenseStatus = async (payload) => {
    try {
        const { additionalExpenseId, status } = payload;

        // Validate status
        if (!['unpaid', 'settled'].includes(status)) {
            return HELPERS.responseHelper.createErrorResponse(
                "Invalid status. Must be 'unpaid' or 'settled'",
                ERROR_TYPES.BAD_REQUEST
            );
        }

        // Check if the additional expense exists
        const additionalExpense = await additionalExpenseModel.findOne({
            where: {
                id: additionalExpenseId,
                isDeleted: { [Op.ne]: true }
            }
        });

        if (!additionalExpense) {
            return HELPERS.responseHelper.createErrorResponse(
                MESSAGES.ADDITIONAL_EXPENSE_NOT_FOUND,
                ERROR_TYPES.DATA_NOT_FOUND
            );
        }

        // Update the status
        await additionalExpenseModel.update(
            { status },
            { where: { id: additionalExpenseId } }
        );

        return Object.assign(
            HELPERS.responseHelper.createSuccessResponse(
                MESSAGES.ADDITIONAL_EXPENSE_STATUS_UPDATED_SUCCESSFULLY
            ),
            {
                data: {
                    id: additionalExpenseId,
                    status
                }
            }
        );
    } catch (error) {
        console.error("Error in updateAdditionalExpenseStatus:", error);
        throw HELPERS.responseHelper.createErrorResponse(
            error.message || error.msg || "Something went wrong",
            ERROR_TYPES.SOMETHING_WENT_WRONG
        );
    }
};

module.exports = additionalExpenseController; 