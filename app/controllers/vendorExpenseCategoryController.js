"use strict";
const HELPERS = require("../helpers");
const { Op } = require("sequelize");
const { MESSAGES, ERROR_TYPES } = require('../utils/constants');

const vendorExpenseCategoryModel = require('../models/vendorExpenseCategoryModel');

/**************************************************
 ******** Vendor Expense Category controller *******
 **************************************************/
let vendorExpenseCategoryController = {};

/**
 * Function to create a vendor expense category
 * @param {*} payload 
 * @returns 
 */
vendorExpenseCategoryController.createVendorExpenseCategory = async (payload) => {
    try {
        const { name, description, status } = payload;

        // Check if category with same name already exists
        const categoryExists = await vendorExpenseCategoryModel.findOne({
            where: {
                name,
                isDeleted: { [Op.ne]: true }
            }
        });

        if (categoryExists) {
            return HELPERS.responseHelper.createErrorResponse(
                MESSAGES.VENDOR_EXPENSE_CATEGORY_ALREADY_EXISTS || "Vendor expense category already exists",
                ERROR_TYPES.ALREADY_EXISTS
            );
        }

        const categoryPayload = {
            name,
            description,
            status: status || 'active'
        }

        const categoryResponse = await vendorExpenseCategoryModel.create(categoryPayload);

        const response = {
            id: categoryResponse.id
        }

        return Object.assign(
            HELPERS.responseHelper.createSuccessResponse(
                MESSAGES.VENDOR_EXPENSE_CATEGORY_CREATED_SUCCESSFULLY || "Vendor expense category created successfully"
            ),
            { data: response }
        );
    } catch (error) {
        console.error(error);
        throw HELPERS.responseHelper.createErrorResponse(
            error.msg || "Something went wrong",
            ERROR_TYPES.SOMETHING_WENT_WRONG
        );
    }
};

/**
 * Function to update a vendor expense category
 * @param {*} payload 
 * @returns 
 */
vendorExpenseCategoryController.updateVendorExpenseCategory = async (payload) => {
    try {
        const { categoryId, name, description, status } = payload;

        // Check if category exists
        const categoryDetails = await vendorExpenseCategoryModel.findOne({
            where: {
                id: categoryId,
                isDeleted: { [Op.ne]: true }
            }
        });

        if (!categoryDetails) {
            return HELPERS.responseHelper.createErrorResponse(
                MESSAGES.VENDOR_EXPENSE_CATEGORY_NOT_FOUND || "Vendor expense category not found",
                ERROR_TYPES.DATA_NOT_FOUND
            );
        }

        // Check if there's another category with the same name
        if (name) {
            const categoryWithSameName = await vendorExpenseCategoryModel.findOne({
                where: {
                    name,
                    id: { [Op.ne]: categoryId },
                    isDeleted: { [Op.ne]: true }
                }
            });

            if (categoryWithSameName) {
                return HELPERS.responseHelper.createErrorResponse(
                    MESSAGES.VENDOR_EXPENSE_CATEGORY_ALREADY_EXISTS || "Another vendor expense category with the same name already exists",
                    ERROR_TYPES.ALREADY_EXISTS
                );
            }
        }

        const updatePayload = {};
        if (name) updatePayload.name = name;
        if (description !== undefined) updatePayload.description = description;
        if (status) updatePayload.status = status;

        await vendorExpenseCategoryModel.update(updatePayload, {
            where: { id: categoryId }
        });

        const response = {
            id: categoryId
        };

        return Object.assign(
            HELPERS.responseHelper.createSuccessResponse(
                MESSAGES.VENDOR_EXPENSE_CATEGORY_UPDATED_SUCCESSFULLY || "Vendor expense category updated successfully"
            ),
            { data: response }
        );
    } catch (error) {
        console.error(error);
        throw HELPERS.responseHelper.createErrorResponse(
            error.msg || "Something went wrong",
            ERROR_TYPES.SOMETHING_WENT_WRONG
        );
    }
};

/**
 * Function to list vendor expense categories
 * @param {*} payload 
 * @returns 
 */
vendorExpenseCategoryController.vendorExpenseCategoryList = async (payload) => {
    try {
        const { categoryId, status } = payload;
        let criteria = { isDeleted: { [Op.ne]: true } };

        if (categoryId) criteria.id = categoryId;
        if (status) criteria.status = status;

        const categories = await vendorExpenseCategoryModel.findAll({
            where: criteria,
            attributes: ['id', 'name', 'description', 'status', 'createdAt']
        });

        return Object.assign(
            HELPERS.responseHelper.createSuccessResponse(
                MESSAGES.VENDOR_EXPENSE_CATEGORY_LIST_SUCCESSFULLY || "Vendor expense categories fetched successfully"
            ),
            { data: categories }
        );
    } catch (error) {
        console.error(error);
        throw HELPERS.responseHelper.createErrorResponse(
            error.msg || "Something went wrong",
            ERROR_TYPES.SOMETHING_WENT_WRONG
        );
    }
};

/**
 * Function to delete a vendor expense category
 * @param {*} payload 
 * @returns 
 */
vendorExpenseCategoryController.deleteVendorExpenseCategory = async (payload) => {
    try {
        const { categoryId } = payload;

        // Check if category exists
        const categoryDetails = await vendorExpenseCategoryModel.findOne({
            where: {
                id: categoryId,
                isDeleted: { [Op.ne]: true }
            }
        });

        if (!categoryDetails) {
            return HELPERS.responseHelper.createErrorResponse(
                MESSAGES.VENDOR_EXPENSE_CATEGORY_NOT_FOUND || "Vendor expense category not found",
                ERROR_TYPES.DATA_NOT_FOUND
            );
        }

        await vendorExpenseCategoryModel.update(
            { isDeleted: true },
            { where: { id: categoryId } }
        );

        return HELPERS.responseHelper.createSuccessResponse(
            MESSAGES.VENDOR_EXPENSE_CATEGORY_DELETED_SUCCESSFULLY || "Vendor expense category deleted successfully"
        );
    } catch (error) {
        console.error(error);
        throw HELPERS.responseHelper.createErrorResponse(
            error.msg || "Something went wrong",
            ERROR_TYPES.SOMETHING_WENT_WRONG
        );
    }
};

/* export vendorExpenseCategoryController */
module.exports = vendorExpenseCategoryController; 