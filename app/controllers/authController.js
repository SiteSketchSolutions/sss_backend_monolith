// "use strict";
const HELPERS = require("../helpers");
const { Op } = require("sequelize");
const { MESSAGES, ERROR_TYPES, USER_TYPES, PROJECT_STAGE_STATUS_LIST, USER_STATUS_LIST } = require("../utils/constants");
const projectModel = require("../models/projectModel");
const userModel = require("../models/userModel");
const adminModel = require("../models/adminModel");
const walletModel = require("../models/walletModel");
const projectStageModel = require("../models/projectStageModel");
const { encryptJwt, generateUniqueId } = require("../utils/utils");
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
    const { phoneNumber, password, deviceToken } = payload;
    if (!phoneNumber && !password) {
      throw HELPERS.responseHelper.createErrorResponse(
        MESSAGES.USER_ID_OR_PASSWORD_REQUIRED,
        ERROR_TYPES.BAD_REQUEST
      );
    }

    let userDetails = await userModel.findOne({
      where: { phoneNumber: phoneNumber, isDeleted: { [Op.ne]: true } },
      attributes: ["id", "uniqueId", "name", "status", "deviceToken"],
    });

    if (!userDetails) {
      throw HELPERS.responseHelper.createErrorResponse(
        MESSAGES.NO_USER_FOUND,
        ERROR_TYPES.DATA_NOT_FOUND
      );
    }
    if (deviceToken) {
      await userModel.update({ deviceToken }, { where: { id: userDetails?.id } });
    }

    const [validPassword, projectDetails] = await Promise.all([
      userModel.findOne({
        where: { id: userDetails?.id, password: password },
        attributes: ["id"],
      }),
      // If user is test status, fetch dummy user's project (id=1)
      projectModel.findOne({
        where: {
          userId: userDetails?.status === USER_STATUS_LIST.PENDING ? 17 : userDetails?.id,
          isDeleted: { [Op.ne]: true }
        },
        attributes: [
          "id",
          "name",
          "area",
          "numberOfFloor",
          "percentageOfCompletion",
          "package",
          "images",
          "location",
          "startDate",
          "status"
        ],
      }),
    ]);

    if (!validPassword) {
      return HELPERS.responseHelper.createErrorResponse(
        MESSAGES.INVALID_PASSWORD,
        ERROR_TYPES.BAD_REQUEST
      );
    }

    let walletId = null;
    let projectStage = null;
    if (projectDetails) {
      const [walletDetails, inProgressProjectStage] = await Promise.all([
        walletModel.findOne({
          where: {
            projectId: projectDetails?.id,
            isDeleted: { [Op.ne]: true }
          },
          attributes: ['id']
        }),
        projectStageModel.findOne({
          where: {
            projectId: projectDetails?.id,
            status: PROJECT_STAGE_STATUS_LIST.IN_PROGRESS,
            isDeleted: { [Op.ne]: true }
          },
          attributes: ['id', 'name', 'status', 'percentage']
        })
      ]);
      walletId = walletDetails?.id;
      projectStage = inProgressProjectStage;
    }

    // If user is test status, fetch dummy user details (id=1)
    if (userDetails.status === USER_STATUS_LIST.PENDING) {
      userDetails = await userModel.findOne({
        where: { id: 17, isDeleted: { [Op.ne]: true } },
        attributes: ["id", "uniqueId", "name", "status"],
      });
    }

    const response = {
      id: userDetails?.id,
      uniqueId: userDetails?.uniqueId,
      name: userDetails?.name,
      status: userDetails?.status,
      deviceToken: userDetails?.deviceToken,
      currentProjectStage: projectStage,
      projectDetails: projectDetails,
      walletId: walletId,
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
      attributes: ["id", "firstName", "lastName", "email", "role", "status"],
    });
    if (!userInfo) {
      throw HELPERS.responseHelper.createErrorResponse(
        MESSAGES.USER_NOT_FOUND,
        ERROR_TYPES.UNAUTHORIZED
      );
    }
    if (payload.deviceToken) {
      await adminModel.update({ deviceToken: payload.deviceToken }, { where: { id: userInfo?.id } });
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

    // No need to create a new admin record here, just use the existing one
    const response = {
      id: userInfo?.id,
      firstName: userInfo.firstName,
      lastName: userInfo.lastName,
      email: userInfo?.email,
      role: userInfo?.role, // Include the role in the response
      token: encryptJwt({
        userId: userInfo.id,
        userType: USER_TYPES.ADMIN,
        email: userInfo.email,
        role: userInfo.role, // Include role in the JWT token
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

    // if(secretMessage === "sss+borewells#construction@2025$")
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

/**
 * Function to handle user signup
 * @param {*} payload 
 * @returns 
 */
authController.userSignup = async (payload) => {
  try {
    const { name, email, phoneNumber, password, deviceToken } = payload;

    // Check if user already exists with the same phone number
    const existingUser = await userModel.findOne({
      where: {
        phoneNumber: phoneNumber,
        isDeleted: { [Op.ne]: true }
      }
    });

    if (existingUser) {
      throw HELPERS.responseHelper.createErrorResponse(
        MESSAGES.USER_ALREADY_EXIST,
        ERROR_TYPES.ALREADY_EXISTS
      );
    }

    // Create new user with test status
    const userPayload = {
      name,
      email,
      phoneNumber,
      password,
      uniqueId: generateUniqueId(),
      status: USER_STATUS_LIST.PENDING,
      deviceToken: deviceToken
    };

    const userResponse = await userModel.create(userPayload);

    // Fetch dummy project for test status user (id=1)
    const projectDetails = await projectModel.findOne({
      where: {
        userId: 17, // Using dummy user's project
        isDeleted: { [Op.ne]: true }
      },
      attributes: [
        "id",
        "name",
        "area",
        "numberOfFloor",
        "percentageOfCompletion",
        "package",
        "images",
        "location",
        "startDate",
        "status"
      ],
    });

    let walletId = null;
    let projectStage = null;
    if (projectDetails) {
      const [walletDetails, inProgressProjectStage] = await Promise.all([
        walletModel.findOne({
          where: {
            projectId: projectDetails?.id,
            isDeleted: { [Op.ne]: true }
          },
          attributes: ['id']
        }),
        projectStageModel.findOne({
          where: {
            projectId: projectDetails?.id,
            status: PROJECT_STAGE_STATUS_LIST.IN_PROGRESS,
            isDeleted: { [Op.ne]: true }
          },
          attributes: ['id', 'name', 'status', 'percentage']
        })
      ]);
      walletId = walletDetails?.id;
      projectStage = inProgressProjectStage;
    }

    // Fetch dummy user details (id=17)
    const dummyUserDetails = await userModel.findOne({
      where: { id: 17, isDeleted: { [Op.ne]: true } },
      attributes: ["id", "uniqueId", "name", "status"],
    });

    const response = {
      id: dummyUserDetails?.id,
      uniqueId: dummyUserDetails?.uniqueId,
      name: dummyUserDetails?.name,
      status: dummyUserDetails?.status,
      currentProjectStage: projectStage,
      projectDetails: projectDetails,
      walletId: walletId,
      token: encryptJwt({
        userId: dummyUserDetails?.id,
        userType: USER_TYPES.USER,
        uniqueId: dummyUserDetails?.uniqueId,
      }),
    };

    return Object.assign(
      HELPERS.responseHelper.createSuccessResponse(MESSAGES.USER_CREATED_SUCCESSFULLY),
      { data: response }
    );
  } catch (error) {
    console.error("Error in userSignup:", error);
    throw HELPERS.responseHelper.createErrorResponse(
      error.msg || "Something went wrong",
      ERROR_TYPES.SOMETHING_WENT_WRONG
    );
  }
};
/* export authController */
module.exports = authController;
