"use strict";
const HELPERS = require("../helpers");
const { Op } = require("sequelize");
const { MESSAGES, ERROR_TYPES } = require('../utils/constants');

const vendorExpenseTrackerModel = require('../models/vendorExpenseTrackerModel');
const vendorModel = require('../models/vendorModel');

/**************************************************
 ******** Vendor Expense Tracker controller *******
 **************************************************/
let vendorExpenseTrackerController = {};

/**
 * Function to create a vendor expense
 * @param {*} payload 
 * @returns 
 */
vendorExpenseTrackerController.createVendorExpense = async (payload) => {
    try {
        const { vendorId, projectId, stageId, amount, note } = payload;

        // Verify vendor exists
        let vendorDetails = await vendorModel.findOne({
            where: { id: vendorId, isDeleted: { [Op.ne]: true } },
            attributes: ['id']
        });

        if (!vendorDetails) {
            return HELPERS.responseHelper.createErrorResponse(MESSAGES.VENDOR_NOT_FOUND || "Vendor not found", ERROR_TYPES.DATA_NOT_FOUND);
        }

        const expensePayload = {
            vendorId,
            projectId,
            stageId,
            amount,
            note,
            status: "active"
        }

        const expenseResponse = await vendorExpenseTrackerModel.create(expensePayload);

        const response = {
            id: expenseResponse?.id
        }
        return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.VENDOR_EXPENSE_TRACKER_CREATED_SUCCESSFULLY || "Vendor expense tracker created successfully"), { data: response });
    } catch (error) {
        console.error(error);
        throw HELPERS.responseHelper.createErrorResponse(error.msg || "Something went wrong", ERROR_TYPES.SOMETHING_WENT_WRONG);
    }
};

/**
 * Function to update a vendor expense
 * @param {*} payload 
 * @returns 
 */
vendorExpenseTrackerController.updateVendorExpense = async (payload) => {
    try {
        const { expenseId, vendorId, projectId, stageId, amount, note, status } = payload;

        let expenseDetails = await vendorExpenseTrackerModel.findOne({
            where: { id: expenseId, isDeleted: { [Op.ne]: true } },
            attributes: ['id']
        });

        if (!expenseDetails) {
            return HELPERS.responseHelper.createErrorResponse(MESSAGES.VENDOR_EXPENSE_TRACKER_NOT_FOUND || "Vendor expense tracker not found", ERROR_TYPES.DATA_NOT_FOUND);
        }

        // If vendor ID is being updated, verify the vendor exists
        if (vendorId) {
            let vendorDetails = await vendorModel.findOne({
                where: { id: vendorId, isDeleted: { [Op.ne]: true } },
                attributes: ['id']
            });

            if (!vendorDetails) {
                return HELPERS.responseHelper.createErrorResponse(MESSAGES.VENDOR_NOT_FOUND || "Vendor not found", ERROR_TYPES.DATA_NOT_FOUND);
            }
        }

        const expensePayload = {
            vendorId,
            projectId,
            stageId,
            amount,
            note,
            status
        }

        // Remove undefined fields
        Object.keys(expensePayload).forEach(key =>
            expensePayload[key] === undefined && delete expensePayload[key]
        );

        await vendorExpenseTrackerModel.update(expensePayload, {
            where: { id: expenseId }
        });

        const response = {
            id: expenseId
        }
        return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.VENDOR_EXPENSE_TRACKER_UPDATED_SUCCESSFULLY || "Vendor expense tracker updated successfully"), { data: response });
    } catch (error) {
        console.error(error);
        throw HELPERS.responseHelper.createErrorResponse(error.msg || "Something went wrong", ERROR_TYPES.SOMETHING_WENT_WRONG);
    }
};

/**
 * Function to list vendor expenses
 * @param {*} payload 
 * @returns 
 */
vendorExpenseTrackerController.vendorExpenseList = async (payload) => {
    try {
        const { expenseId, vendorId, projectId, stageId } = payload;
        let criteria = { isDeleted: { [Op.ne]: true } }

        if (expenseId) criteria.id = expenseId;
        if (vendorId) criteria.vendorId = vendorId;
        if (projectId) criteria.projectId = projectId;
        if (stageId) criteria.stageId = stageId;

        const expenseList = await vendorExpenseTrackerModel.findAll({
            where: criteria,
            attributes: ['id', 'vendorId', 'projectId', 'stageId', 'amount', 'note', 'status', 'createdAt'],
            include: [
                {
                    model: vendorModel,
                    as: 'vendor',
                    attributes: ['id', 'name'],
                    required: false
                }
            ]
        });

        return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.VENDOR_EXPENSE_TRACKER_LIST_SUCCESSFULLY || "Vendor expense tracker list fetched successfully"), { data: expenseList });
    } catch (error) {
        console.error(error);
        throw HELPERS.responseHelper.createErrorResponse(error.msg || "Something went wrong", ERROR_TYPES.SOMETHING_WENT_WRONG);
    }
};

/**
 * Function to get vendor expense by id
 * @param {*} payload 
 * @returns 
 */
vendorExpenseTrackerController.getVendorExpenseById = async (payload) => {
    try {
        const { expenseId } = payload;

        const expenseDetails = await vendorExpenseTrackerModel.findOne({
            where: { id: expenseId, isDeleted: { [Op.ne]: true } },
            include: [
                {
                    model: vendorModel,
                    as: 'vendor',
                    attributes: ['id', 'name'],
                    required: false
                }
            ]
        });

        if (!expenseDetails) {
            return HELPERS.responseHelper.createErrorResponse(MESSAGES.VENDOR_EXPENSE_TRACKER_NOT_FOUND || "Vendor expense tracker not found", ERROR_TYPES.DATA_NOT_FOUND);
        }

        return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.VENDOR_EXPENSE_TRACKER_DETAILS_FETCHED_SUCCESSFULLY || "Vendor expense tracker details fetched successfully"), { data: expenseDetails });
    } catch (error) {
        console.error(error);
        throw HELPERS.responseHelper.createErrorResponse(error.msg || "Something went wrong", ERROR_TYPES.SOMETHING_WENT_WRONG);
    }
};

/**
 * Function to delete vendor expense
 * @param {*} payload 
 * @returns 
 */
vendorExpenseTrackerController.deleteVendorExpense = async (payload) => {
    try {
        const { expenseId } = payload;

        let expenseDetails = await vendorExpenseTrackerModel.findOne({
            where: { id: expenseId, isDeleted: { [Op.ne]: true } },
            attributes: ['id']
        });

        if (!expenseDetails) {
            return HELPERS.responseHelper.createErrorResponse(MESSAGES.VENDOR_EXPENSE_TRACKER_NOT_FOUND || "Vendor expense tracker not found", ERROR_TYPES.DATA_NOT_FOUND);
        }

        await vendorExpenseTrackerModel.update({ isDeleted: true }, {
            where: { id: expenseId }
        });

        return HELPERS.responseHelper.createSuccessResponse(MESSAGES.VENDOR_EXPENSE_TRACKER_DELETED_SUCCESSFULLY || "Vendor expense tracker deleted successfully");
    } catch (error) {
        console.error(error);
        throw HELPERS.responseHelper.createErrorResponse(error.msg || "Something went wrong", ERROR_TYPES.SOMETHING_WENT_WRONG);
    }
};

/* export vendorExpenseTrackerController */
module.exports = vendorExpenseTrackerController; 