const HELPERS = require("../helpers");
const { Op } = require("sequelize");
const { MESSAGES, ERROR_TYPES } = require("../utils/constants");
const folderModel = require("../models/folderModel");
const path = require("path");
const fs = require("fs");

/**************************************************
 ***************** Folder  controller ***************
 **************************************************/
let folderController = {};

/**
 * Function to create folder
 * @param {*} payload
 * @returns
 */
folderController.createFolder = async (payload) => {
  try {
    const { userId, name } = payload;
    const folderPayload = {
      name: name,
      userId: userId,
    };
    const folder = await folderModel.create(folderPayload);

    return Object.assign(
      HELPERS.responseHelper.createSuccessResponse(
        MESSAGES.FOLDER_CREATED_SUCCESSFULLY
      ),
      { data: folder?.id }
    );
  } catch (error) {
    throw HELPERS.responseHelper.createErrorResponse(
      error.msg || error.message,
      ERROR_TYPES.SOMETHING_WENT_WRONG
    );
  }
};

/**
 * Function to update folder
 * @param {*} payload
 * @returns
 */
folderController.updateFolder = async (payload) => {
  try {
    const { folderId, name } = payload;

    const folderExist = await folderModel.findOne({ where: { id: folderId } });
    if (!folderExist) {
      return HELPERS.responseHelper.createErrorResponse(
        MESSAGES.FOLDER_NOT_FOUND,
        ERROR_TYPES.DATA_NOT_FOUND
      );
    }
    await folderModel.update({ name }, { where: { id: folderId } });

    return Object.assign(
      HELPERS.responseHelper.createSuccessResponse(
        MESSAGES.FOLDER_UPDATED_SUCCESSFULLY
      ),
      { data: null }
    );
  } catch (error) {
    throw HELPERS.responseHelper.createErrorResponse(
      error.msg || error.message,
      ERROR_TYPES.SOMETHING_WENT_WRONG
    );
  }
};
/**
 * Function to get folder list
 * @param {*} payload
 * @returns
 */
folderController.getFolderList = async (payload) => {
  try {
    const { userId } = payload;
    const folderList = await folderModel.findAll({
      where: {
        userId: userId,
        isDeleted: { [Op.ne]: true },
      },
    });

    return Object.assign(
      HELPERS.responseHelper.createSuccessResponse(
        MESSAGES.FOLDER_LIST_SUCCESSFULLY
      ),
      { data: folderList }
    );
  } catch (error) {
    throw HELPERS.responseHelper.createErrorResponse(
      error.msg || error.message,
      error.statusCode || ERROR_TYPES.SOMETHING_WENT_WRONG
    );
  }
};

folderController.deleteFolder = async (payload) => {
  try {
    const { folderId } = payload;

    const folderExist = await folderModel.findOne({ where: { id: folderId } });
    if (!folderExist) {
      return HELPERS.responseHelper.createErrorResponse(
        MESSAGES.FOLDER_NOT_FOUND,
        ERROR_TYPES.DATA_NOT_FOUND
      );
    }

    await folderModel.update({ isDeleted: true }, { where: { id: folderId } });

    return Object.assign(
      HELPERS.responseHelper.createSuccessResponse(
        MESSAGES.FOLDER_DELETED_SUCCESSFULLY
      ),
      { data: null }
    );
  } catch (error) {
    throw HELPERS.responseHelper.createErrorResponse(
      error.msg,
      ERROR_TYPES.SOMETHING_WENT_WRONG
    );
  }
};
module.exports = folderController;
