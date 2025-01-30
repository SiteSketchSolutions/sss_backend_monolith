// "use strict";
const HELPERS = require("../helpers");
const { Op } = require("sequelize");
const { MESSAGES, ERROR_TYPES, USER_TYPES } = require("../utils/constants");
const projectModel = require("../models/projectModel");
const userModel = require("../models/userModel");
const adminModel = require("../models/adminModel");
const { encryptJwt } = require("../utils/utils");
const s3Utils = require("../utils/s3Utils");

/**************************************************
 ***************** Auth controller ***************
 **************************************************/
let authController = {};

/**
 * function to check server.
 */
authController.getServerResponse = async () => {
  throw HELPERS.responseHelper.createSuccessResponse(MESSAGES.SUCCESS);
};

/**
 * Function to test user auth
 * @param {*} payload
 * @returns
 */
authController.authTest = async (payload) => {
  return Object.assign(
    HELPERS.responseHelper.createSuccessResponse(MESSAGES.SUCCESS),
    { user: payload.user }
  );
};

/**
 * function to user login with client id and password
 */
authController.userLogin = async (payload) => {
  try {
    const { phoneNumber, password } = payload;
    if (!phoneNumber && !password) {
      throw HELPERS.responseHelper.createErrorResponse(
        MESSAGES.USER_ID_OR_PASSWORD_REQUIRED,
        ERROR_TYPES.BAD_REQUEST
      );
    }
    let userDetails = await userModel.findOne({
      where: { phoneNumber: phoneNumber, isDeleted: { [Op.ne]: true } },
      attributes: ["id", "uniqueId", "name", "status"],
    });
    if (!userDetails) {
      throw HELPERS.responseHelper.createErrorResponse(
        MESSAGES.NO_USER_FOUND,
        ERROR_TYPES.DATA_NOT_FOUND
      );
    }
    const [validPassword, projectDetails] = await Promise.all([
      userModel.findOne({
        where: { id: userDetails?.id, password: password },
        attributes: ["id"],
      }),
      projectModel.findOne({
        where: { userId: userDetails?.id, isDeleted: { [Op.ne]: true } },
        attributes: [
          "id",
          "name",
          "area",
          "numberOfFloor",
          "percentageOfCompletion",
          "package",
          "image",
          "location",
          "startDate",
          "status",
        ],
      }),
    ]);

    if (!validPassword) {
      return HELPERS.responseHelper.createErrorResponse(
        MESSAGES.INVALID_PASSWORD,
        ERROR_TYPES.BAD_REQUEST
      );
    }

    const response = {
      id: userDetails?.id,
      uniqueId: userDetails?.uniqueId,
      name: userDetails?.name,
      status: userDetails?.status,
      projectDetails: projectDetails,
      token: encryptJwt({
        userId: userDetails?.id,
        userType: USER_TYPES.USER,
        uniqueId: userDetails?.uniqueId,
      }),
    };

    return Object.assign(
      HELPERS.responseHelper.createSuccessResponse(
        MESSAGES.LOGGED_IN_SUCCESSFULLY
      ),
      { data: response }
    );
  } catch (error) {
    console.log(error, "error===>");
    throw HELPERS.responseHelper.createErrorResponse(
      error.msg,
      ERROR_TYPES.SOMETHING_WENT_WRONG
    );
  }
};

/**
 * function to admin login
 */
authController.adminLogin = async (payload) => {
  try {
    let userInfo = await adminModel.findOne({
      where: { email: payload.email, isDeleted: { [Op.ne]: true } },
      attributes: ["id"],
    });
    if (!userInfo) {
      throw HELPERS.responseHelper.createErrorResponse(
        MESSAGES.USER_NOT_FOUND,
        ERROR_TYPES.UNAUTHORIZED
      );
    }
    const validatePassword = await adminModel.findOne({
      where: { id: userInfo.id, password: payload.password },
      attributes: ["id"],
    });
    if (!validatePassword) {
      throw HELPERS.responseHelper.createErrorResponse(
        MESSAGES.INVALID_PASSWORD,
        ERROR_TYPES.BAD_REQUEST
      );
    }
    const adminPayload = {
      // firstName: payload.firstName,
      // lastName: payload.lastName,
      email: payload.email,
      password: payload.password,
      // mobileNumber: payload.mobileNumber,
      status: "pending",
    };
    userInfo = await adminModel.create(adminPayload);
    const response = {
      id: userInfo?.id,
      firstName: userInfo.firstName,
      lastName: userInfo.lastName,
      email: userInfo?.email,
      token: encryptJwt({
        userId: userInfo.id,
        userType: USER_TYPES.ADMIN,
        email: userInfo.email,
      }),
    };
    return Object.assign(
      HELPERS.responseHelper.createSuccessResponse(
        MESSAGES.LOGGED_IN_SUCCESSFULLY
      ),
      { data: response }
    );
  } catch (error) {
    throw HELPERS.responseHelper.createErrorResponse(
      error.msg,
      ERROR_TYPES.SOMETHING_WENT_WRONG
    );
  }
};

authController.generatePresignedUrl = async (payload) => {
  try {
    /**
     * 1. get the filename,fileType,folderPath from the FE.
     * 2. Make an request to s3 to get the presigned URl and return to FE.
     * 3. UI makes a PUT request to S3 to upload the file with the returned presigned URL.
     */
    const { fileName, fileType, folderPath } = payload;

    // Generate S3 key with folder structure
    const s3Key = `${folderPath}/${fileName}`;
    const preSignedUrl = await s3Utils.generatePresignedUrl(process.env.AWS_S3_MEDIA_BUCKET_NAME, s3Key, fileType);
    const response = {
      uploadUrl: preSignedUrl,
      publicUrl: `${process.env.CLOUDFRONT_URL}/${s3Key}`
    }
    return Object.assign(
      HELPERS.responseHelper.createSuccessResponse(
        MESSAGES.SUCCESS
      ),
      { data: response }
    );
  } catch (error) {
    console.log(error, "errro")
    throw HELPERS.responseHelper.createErrorResponse(
      error.msg,
      ERROR_TYPES.SOMETHING_WENT_WRONG
    );
  }
}
/* export authController */
module.exports = authController;
