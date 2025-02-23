const HELPERS = require("../helpers");
const { Op } = require("sequelize");
const { MESSAGES, ERROR_TYPES } = require("../utils/constants");
const paymentStageModel = require("../models/paymentStageModel");

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
        const { projectId, name, description, amount, dueDate, status, paymentStatus, paymentMethod, paymentDetails, approved, order } = payload;
        let stagePayload = {
            projectId,
            name,
            description,
            amount,
            dueDate,
            status,
            paymentStatus,
            paymentMethod,
            paymentDetails,
            approved,
            order
        };
        const stageExist = await paymentStageModel.findOne({
            where: {
                projectId: projectId,
                order: order,
                isDeleted: { [Op.ne]: true },
            },
        });

        if (stageExist) {
            return HELPERS.responseHelper.createErrorResponse(
                MESSAGES.STAGE_ALREADY_EXIST,
                ERROR_TYPES.BAD_REQUEST
            );
        }

        const stage = await paymentStageModel.create(stagePayload);
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
        const { stageId, name, description, amount, dueDate, status, paymentStatus, paymentMethod, paymentDetails, approved, order } = payload;
        let updatePayload = {
            name,
            description,
            amount,
            dueDate,
            status,
            paymentStatus,
            paymentMethod,
            paymentDetails,
            approved,
            order
        };
        await paymentStageModel.update(updatePayload, {
            where: { id: stageId, isDeleted: { [Op.ne]: true } },
        });

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
        const { projectId } = payload;
        const stages = await paymentStageModel.findAll({
            where: {
                projectId: projectId,
                isDeleted: { [Op.ne]: true },
            },
            attributes: ["id", "name", "description", "amount", "dueDate", "status", "paymentStatus", 'paymentMethod', 'paymentMethod', 'approved', 'order'],
            order: [["order", "ASC"]],
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
paymentStageController.getPaymentStageDetails = async (payload) => {
    try {
        const { stageId } = payload;
        const stages = await paymentStageModel.findOne({
            where: {
                id: stageId,
                isDeleted: { [Op.ne]: true },
            },
            attributes: ["id", "name", "description", "amount", "dueDate", "status", "paymentStatus", 'paymentMethod', 'paymentMethod', 'approved', 'order'],
            order: [["order", "ASC"]],
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

module.exports = paymentStageController;
