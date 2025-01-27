const HELPERS = require("../helpers");
const { Op } = require("sequelize");
const { MESSAGES, ERROR_TYPES } = require("../utils/constants");
const materialCategoryModel = require("../models/materialCategoryModel");
const path = require("path");
const fs = require("fs");

/**************************************************
 ***************** Document  controller ***************
 **************************************************/
let documentController = {};

/**
 * Function to create material category
 * @param {*} payload
 * @returns
 */
documentController.uploadDocument = async (payload) => {
  try {
    const file = payload.file;
    const userId = payload.user.userId || "default";
    // Create response with file details and path information
    const response = {
      originalName: file.originalname,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      path: `documents/${userId}/${file.filename}`, // Include relative path
    };

    return Object.assign(
      HELPERS.responseHelper.createSuccessResponse(
        MESSAGES.DOCUMENT_UPLOADED_SUCCESSFULLY
      ),
      { data: response }
    );
  } catch (error) {
    throw HELPERS.responseHelper.createErrorResponse(
      error.msg || error.message,
      ERROR_TYPES.SOMETHING_WENT_WRONG
    );
  }
};

/**
 * Function to get uploaded document
 * @param {*} payload
 * @returns
 */
documentController.getDocument = async (payload) => {
  try {
    const { filename } = payload;
    const userId = payload.user?.id || "default";

    // Construct the full path including user's directory
    const userUploadPath = path.join(
      process.cwd(),
      "uploads",
      "documents",
      userId.toString()
    );
    const filePath = path.join(userUploadPath, filename);

    try {
      if (!fs.existsSync(filePath)) {
        return HELPERS.responseHelper.createErrorResponse(
          MESSAGES.FILE_NOT_FOUND,
          ERROR_TYPES.DATA_NOT_FOUND
        );
      }

      return {
        filePath: filePath,
        statusCode: 200,
      };
    } catch (err) {
      return HELPERS.responseHelper.createErrorResponse(
        MESSAGES.FILE_NOT_FOUND,
        ERROR_TYPES.DATA_NOT_FOUND
      );
    }
  } catch (error) {
    throw HELPERS.responseHelper.createErrorResponse(
      error.msg || error.message,
      error.statusCode || ERROR_TYPES.SOMETHING_WENT_WRONG
    );
  }
};

module.exports = documentController;
