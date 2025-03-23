"use strict";
const HELPERS = require("../helpers");
const { Op } = require("sequelize");
const { MESSAGES, ERROR_TYPES } = require('../utils/constants');

const vendorModel = require('../models/vendorModel');
const CONSTANTS = require("../utils/constants");

/**************************************************
 *************** Vendor controller ***************
 **************************************************/
let vendorController = {};

/**
 * Function to create a vendor
 * @param {*} payload 
 * @returns 
 */
vendorController.createVendor = async (payload) => {
    try {
        const { name, note } = payload;
        const vendorPayload = {
            name,
            note,
            status: CONSTANTS.VENDOR_STATUS.ACTIVE
        }

        let vendorDetails = await vendorModel.findOne({
            where: { name: name, isDeleted: { [Op.ne]: true } },
            attributes: ['id']
        });

        if (vendorDetails) {
            throw HELPERS.responseHelper.createErrorResponse(MESSAGES.VENDOR_ALREADY_EXISTS || "Vendor already exists", ERROR_TYPES.ALREADY_EXISTS);
        }

        const vendorResponse = await vendorModel.create(vendorPayload);

        const response = {
            id: vendorResponse?.id
        }
        return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.VENDOR_CREATED_SUCCESSFULLY || "Vendor created successfully"), { data: response });
    } catch (error) {
        throw HELPERS.responseHelper.createErrorResponse(error.msg || "Something went wrong", ERROR_TYPES.SOMETHING_WENT_WRONG);
    }
};

/**
 * Function to update a vendor
 * @param {*} payload 
 * @returns 
 */
vendorController.updateVendor = async (payload) => {
    try {
        const { vendorId, name, note, status } = payload;
        const vendorPayload = {
            name,
            note,
            status
        }

        let vendorDetails = await vendorModel.findOne({
            where: { id: vendorId, isDeleted: { [Op.ne]: true } },
            attributes: ['id']
        });

        if (!vendorDetails) {
            return HELPERS.responseHelper.createErrorResponse(MESSAGES.VENDOR_NOT_FOUND || "Vendor not found", ERROR_TYPES.DATA_NOT_FOUND);
        }

        await vendorModel.update(vendorPayload, {
            where: { id: vendorId }
        });

        const response = {
            id: vendorId
        }
        return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.VENDOR_UPDATED_SUCCESSFULLY || "Vendor updated successfully"), { data: response });
    } catch (error) {
        throw HELPERS.responseHelper.createErrorResponse(error.msg || "Something went wrong", ERROR_TYPES.SOMETHING_WENT_WRONG);
    }
};

/**
 * Function to list vendors
 * @param {*} payload 
 * @returns 
 */
vendorController.vendorList = async (payload) => {
    try {
        const { vendorId } = payload;
        let criteria = { isDeleted: { [Op.ne]: true } }
        if (vendorId) {
            criteria.id = vendorId
        }

        const vendorList = await vendorModel.findAll({
            where: criteria,
            attributes: ['id', 'name', 'note', 'status']
        });

        return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.VENDOR_LIST_SUCCESSFULLY || "Vendor list fetched successfully"), { data: vendorList });
    } catch (error) {
        console.log(error, "error")
        throw HELPERS.responseHelper.createErrorResponse(error.msg || "Something went wrong", ERROR_TYPES.SOMETHING_WENT_WRONG);
    }
};

/**
 * Function to get vendor by id
 * @param {*} payload 
 * @returns 
 */
vendorController.getVendorById = async (payload) => {
    try {
        const { vendorId } = payload;
        let criteria = { isDeleted: { [Op.ne]: true }, id: vendorId }

        const vendorDetails = await vendorModel.findOne({
            where: criteria,
        });

        if (!vendorDetails) {
            return HELPERS.responseHelper.createErrorResponse(MESSAGES.VENDOR_NOT_FOUND || "Vendor not found", ERROR_TYPES.DATA_NOT_FOUND);
        }

        return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.VENDOR_DETAILS_FETCHED_SUCCESSFULLY || "Vendor details fetched successfully"), { data: vendorDetails });
    } catch (error) {
        console.log(error, "error")
        throw HELPERS.responseHelper.createErrorResponse(error.msg || "Something went wrong", ERROR_TYPES.SOMETHING_WENT_WRONG);
    }
};

/**
 * Function to delete vendor
 * @param {*} payload 
 * @returns 
 */
vendorController.deleteVendor = async (payload) => {
    try {
        const { vendorId } = payload;

        let vendorDetails = await vendorModel.findOne({
            where: { id: vendorId, isDeleted: { [Op.ne]: true } },
            attributes: ['id']
        });

        if (!vendorDetails) {
            return HELPERS.responseHelper.createErrorResponse(MESSAGES.VENDOR_NOT_FOUND || "Vendor not found", ERROR_TYPES.DATA_NOT_FOUND);
        }

        await vendorModel.update({ isDeleted: true }, {
            where: { id: vendorId }
        });

        return HELPERS.responseHelper.createSuccessResponse(MESSAGES.VENDOR_DELETED_SUCCESSFULLY || "Vendor deleted successfully");
    } catch (error) {
        throw HELPERS.responseHelper.createErrorResponse(error.msg || "Something went wrong", ERROR_TYPES.SOMETHING_WENT_WRONG);
    }
};

/* export vendorController */
module.exports = vendorController; 