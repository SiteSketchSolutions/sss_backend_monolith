// "use strict";
const HELPERS = require("../helpers");
const { Op } = require("sequelize");
const { MESSAGES, ERROR_TYPES } = require('../utils/constants');

const userModel = require('../models/userModel');
const { generateUniqueId } = require("../utils/utils");

/**************************************************
 ***************** User controller ***************
 **************************************************/
let userController = {};

/**
 * Function to create a user
 * @param {*} payload 
 * @returns 
 */
userController.createUser = async (payload) => {
    try {
        const { name, email, password, phoneNumber, status } = payload;
        const userPayload = {
            name,
            email,
            password,
            phoneNumber,
            uniqueId: generateUniqueId(),
            status: status || USER_STATUS_LIST.ACTIVE
        }
        let userDetails = await userModel.findOne({
            where: { phoneNumber: phoneNumber, isDeleted: { [Op.ne]: true } },
            attributes: ['id']
        });

        if (userDetails) {
            throw HELPERS.responseHelper.createErrorResponse(MESSAGES.USER_ALREADY_EXIST, ERROR_TYPES.ALREADY_EXISTS);
        }

        const userResponse = await userModel.create(userPayload);

        const response = {
            id: userResponse?.id
        }
        return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.USER_CREATED_SUCCESSFULLY), { data: response });
    } catch (error) {
        throw HELPERS.responseHelper.createErrorResponse(error.msg, ERROR_TYPES.SOMETHING_WENT_WRONG);
    }
};

/**
 * Function to update a user
 * @param {*} payload 
 * @returns 
 */
userController.updateUser = async (payload) => {
    try {
        const { userId, name, email, password, phoneNumber, status } = payload;
        const userPayload = {
            name,
            email,
            password,
            phoneNumber,
            status
        }
        let userDetails = await userModel.findOne({
            where: { id: userId, isDeleted: { [Op.ne]: true } },
            attributes: ['id']
        });

        if (!userDetails) {
            return HELPERS.responseHelper.createErrorResponse(MESSAGES.USER_NOT_FOUND, ERROR_TYPES.DATA_NOT_FOUND);
        }

        const userResponse = await userModel.update(userPayload, {
            where: { id: userId }
        });

        const response = {
            id: userResponse?.id
        }
        return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.USER_UPDATED_SUCCESSFULLY), { data: response });
    } catch (error) {
        throw HELPERS.responseHelper.createErrorResponse(error.msg, ERROR_TYPES.SOMETHING_WENT_WRONG);
    }
};

userController.userList = async (payload) => {
    try {
        const { userId } = payload;
        let criteria = { isDeleted: { [Op.ne]: true } }
        if (userId) {
            criteria.id = userId
        }
        const userList = await userModel.findAll({
            where: criteria,
            attributes: ['id', 'uniqueId', 'name', 'email', 'password', 'phoneNumber', 'status']
        });
        return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.USER_LIST_SUCCESSFULLY), { data: userList });
    } catch (error) {
        console.log(error, "error")
        throw HELPERS.responseHelper.createErrorResponse(error.msg, ERROR_TYPES.SOMETHING_WENT_WRONG);
    }
};

userController.getUserById = async (payload) => {
    try {
        const { userId } = payload;
        let criteria = { isDeleted: { [Op.ne]: true } }
        if (userId) {
            criteria.id = userId
        }
        const userDetails = await userModel.findOne({
            where: criteria,
        });
        return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.USER_DETAILS_FETCHED_SUCCESSFULLY), { data: userDetails });
    } catch (error) {
        console.log(error, "error")
        throw HELPERS.responseHelper.createErrorResponse(error.msg, ERROR_TYPES.SOMETHING_WENT_WRONG);
    }
}

/**
 * Function to delete a user
 * @param {*} payload 
 * @returns 
 */
userController.deleteUser = async (payload) => {
    try {
        const { userId } = payload;

        // Check if the user exists
        let userDetails = await userModel.findOne({
            where: { id: userId, isDeleted: { [Op.ne]: true } },
            attributes: ['id']
        });

        if (!userDetails) {
            return HELPERS.responseHelper.createErrorResponse(MESSAGES.USER_NOT_FOUND, ERROR_TYPES.DATA_NOT_FOUND);
        }

        // Soft delete the user
        await userModel.update(
            { isDeleted: true },
            { where: { id: userId } }
        );

        return HELPERS.responseHelper.createSuccessResponse(MESSAGES.USER_DELETED_SUCCESSFULLY);
    } catch (error) {
        console.log(error, "error");
        throw HELPERS.responseHelper.createErrorResponse(error.msg || "Something went wrong", ERROR_TYPES.SOMETHING_WENT_WRONG);
    }
};

/* export userController */
module.exports = userController;
