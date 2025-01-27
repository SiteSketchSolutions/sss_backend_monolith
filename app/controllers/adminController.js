// "use strict";
const path = require("path");
const { Op } = require("sequelize");
const HELPERS = require("../helpers");
const { MESSAGES, ERROR_TYPES } = require("../utils/constants");
const adminModel = require("../models/adminModel");
const { hashPassword } = require('../utils/utils')

/**************************************************
 ***************** ADMIN controller ***************
 **************************************************/

let adminController = {};

/**
 * function to create new admin
 * @param {*} payload 
 * @returns 
 */
adminController.create = async (payload) => {
  try {
    // payload.password = hashPassword(payload.password)
    const newUser = await adminModel.create(payload);
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.USER_REGISTERED_SUCCESSFULLY), newUser);
  } catch (error) {
    throw HELPERS.responseHelper.createErrorResponse(error.message, ERROR_TYPES.SOMETHING_WENT_WRONG);
  }
};

/**
 * function to update admin details
 * @param {*} payload 
 * @returns 
 */
adminController.update = async (payload) => {
  try {
    // if (payload?.password) {
    //   payload.password = hashPassword(payload.password)
    // }
    let criteria = { id: payload.userId }
    await adminModel.update(payload, { where: criteria });
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.USER_UPDATED_SUCCESSFULLY));
  } catch (error) {
    throw HELPERS.responseHelper.createErrorResponse(error.message, ERROR_TYPES.SOMETHING_WENT_WRONG);
  }
};

/**
 * function to get admin details
 * @param {*} payload 
 * @returns 
 */
adminController.getById = async (payload) => {
  try {
    let criteria = { id: payload.userId, isDeleted: { [Op.ne]: true } }
    let adminDetails = await adminModel.findOne({ where: criteria });
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.USER_PROFILE_FETCHED_SUCCESSFULLY), { data: adminDetails });
  } catch (error) {
    throw HELPERS.responseHelper.createErrorResponse(error.message, ERROR_TYPES.SOMETHING_WENT_WRONG);
  }
};


/* export adminController */
module.exports = adminController;
