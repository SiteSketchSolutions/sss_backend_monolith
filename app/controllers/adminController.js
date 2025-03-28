// "use strict";
const path = require("path");
const { Op } = require("sequelize");
const HELPERS = require("../helpers");
const { MESSAGES, ERROR_TYPES, ADMIN_ROLES } = require("../utils/constants");
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
    // Ensure only super admins can create new admin users with role specification
    const { user } = payload;

    // If the logged-in user is not a super admin, restrict role to site_engineer
    if (user && user.role !== ADMIN_ROLES.SUPER_ADMIN && payload.role === ADMIN_ROLES.SUPER_ADMIN) {
      return HELPERS.responseHelper.createErrorResponse(
        "Only super admins can create other super admin accounts",
        ERROR_TYPES.FORBIDDEN
      );
    }

    // Check if admin with same email already exists
    if (payload.email) {
      const existingAdmin = await adminModel.findOne({
        where: {
          email: payload.email,
          isDeleted: { [Op.ne]: true }
        }
      });

      if (existingAdmin) {
        return HELPERS.responseHelper.createErrorResponse(
          MESSAGES.EMAIL_ALREADY_EXISTS || "An admin with this email already exists",
          ERROR_TYPES.ALREADY_EXISTS
        );
      }
    }

    // payload.password = hashPassword(payload.password)
    const newUser = await adminModel.create(payload);

    const response = {
      id: newUser.id,
    }
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.USER_REGISTERED_SUCCESSFULLY), { data: response });
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
    // Ensure role changes are properly authorized
    const { user } = payload;

    // If role is being changed to super_admin, only super_admin can do this
    if (payload.role === ADMIN_ROLES.SUPER_ADMIN && user && user.role !== ADMIN_ROLES.SUPER_ADMIN) {
      return HELPERS.responseHelper.createErrorResponse(
        "Only super admins can promote users to super admin role",
        ERROR_TYPES.FORBIDDEN
      );
    }

    // Check if trying to update to an email that already exists for another admin
    if (payload.email) {
      const existingAdmin = await adminModel.findOne({
        where: {
          email: payload.email,
          id: { [Op.ne]: payload.userId }, // Exclude the current admin being updated
          isDeleted: { [Op.ne]: true }
        }
      });

      if (existingAdmin) {
        return HELPERS.responseHelper.createErrorResponse(
          MESSAGES.EMAIL_ALREADY_EXISTS || "An admin with this email already exists",
          ERROR_TYPES.ALREADY_EXISTS
        );
      }
    }

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

/**
 * function to list all admins (only available to super admins)
 * @param {*} payload 
 * @returns 
 */
adminController.listAdmins = async (payload) => {
  try {
    const { user, role } = payload;

    // Only super admins can see all admins
    if (user && user.role !== ADMIN_ROLES.SUPER_ADMIN) {
      return HELPERS.responseHelper.createErrorResponse(
        "Only super admins can view all admin accounts",
        ERROR_TYPES.FORBIDDEN
      );
    }

    let criteria = { isDeleted: { [Op.ne]: true } };

    // Filter by role if specified
    if (role) {
      criteria.role = role;
    }

    let adminList = await adminModel.findAll({
      where: criteria,
      attributes: ['id', 'firstName', 'lastName', 'email', 'mobileNumber', 'role', 'status']
    });

    return Object.assign(
      HELPERS.responseHelper.createSuccessResponse(MESSAGES.ADMIN_LIST_FETCHED_SUCCESSFULLY || "Admin list fetched successfully"),
      { data: adminList }
    );
  } catch (error) {
    throw HELPERS.responseHelper.createErrorResponse(error.message, ERROR_TYPES.SOMETHING_WENT_WRONG);
  }
};

/* export adminController */
module.exports = adminController;
