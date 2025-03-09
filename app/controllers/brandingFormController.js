"use strict";
const HELPERS = require("../helpers");
const { MESSAGES, ERROR_TYPES } = require("../utils/constants");
const brandFormModel = require("../models/brandingFormModel");

/**************************************************
 ***************** Bank Account Controller ***************
 **************************************************/
let brandingFormController = {};

/**
 * Create a new branding form submission
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
brandingFormController.createFormSubmission = async (payload) => {
    try {
        const { name, email, phone, service, message } = payload;
        const payloadData = {
            name,
            email,
            phone,
            service,
            message: message || "",
        }
        // Create new form submission
        await brandFormModel.create(payloadData);
        return Object.assign(
            HELPERS.responseHelper.createSuccessResponse(
                MESSAGES.BRANDING_FORM_CREATED_SUCCESSFULLY
            )
        );
    } catch (error) {
        return HELPERS.responseHelper.createErrorResponse(
            error.message,
            ERROR_TYPES.SOMETHING_WENT_WRONG
        );
    }
};

/**
 * Get all branding form submissions
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
brandingFormController.getAllFormSubmissions = async (payload) => {
    try {
        const formSubmissions = await brandFormModel.findAll({
            order: [["createdAt", "DESC"]],
        });

        return Object.assign(
            HELPERS.responseHelper.createSuccessResponse(
                MESSAGES.BRANDING_FORM_LIST_FETCHED_SUCCESSFULLY
            ),
            { data: formSubmissions }
        );
    } catch (error) {
        return HELPERS.responseHelper.createErrorResponse(
            error.message,
            ERROR_TYPES.SOMETHING_WENT_WRONG
        );
    }
};

/**
 * Update a branding form submission status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
brandingFormController.updateFormSubmissionStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;


        // Find the form submission
        const formSubmission = await brandFormModel.findByPk(id);
        if (!formSubmission) {
            return res.status(404).json({
                status: false,
                message: "Form submission not found",
            });
        }

        // Update the status
        formSubmission.status = status;
        await formSubmission.save();

        return Object.assign(
            HELPERS.responseHelper.createSuccessResponse(
                MESSAGES.BRANDING_FORM_UPDATED_SUCCESSFULLY
            ),
            { data: formSubmission }
        );
    } catch (error) {
        return HELPERS.responseHelper.createErrorResponse(
            error.message,
            ERROR_TYPES.SOMETHING_WENT_WRONG
        );
    }
};

module.exports = brandingFormController;