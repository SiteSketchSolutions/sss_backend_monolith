const HELPERS = require("../helpers");
const { Op } = require("sequelize");
const { MESSAGES, ERROR_TYPES } = require("../utils/constants");
const folderDocumentModel = require("../models/folderDocumentModel");
const path = require("path");
const fs = require("fs");

/**************************************************
 ***************** Folder Document controller ***************
 **************************************************/
let folderDocumentController = {};

/**
 * Function to create folder document
 * @param {*} payload
 * @returns
 */
folderDocumentController.createFolderDocument = async (payload) => {
  try {
    const { folderId } = payload?.fields;
    const folderDocumentPayload = {
      folderId: folderId,
      url: `${process.env.SERVER_URL}/uploads/${payload?.file?.filename}`,
    };
    const folderDocument = await folderDocumentModel.create(
      folderDocumentPayload
    );
    return Object.assign(
      HELPERS.responseHelper.createSuccessResponse(
        MESSAGES.FOLDER_DOCUMENT_UPLOADED_SUCCESSFULLY
      ),
      { data: folderDocument?.id }
    );
  } catch (error) {
    throw HELPERS.responseHelper.createErrorResponse(
      error.msg || error.message,
      ERROR_TYPES.SOMETHING_WENT_WRONG
    );
  }
};

/**
 * Function to update folder document
 * @param {*} payload
 * @returns
 */
folderDocumentController.updateFolderDocument = async (payload) => {
  try {
    const { folderDocumentId } = payload?.fields;

    const folderDocumentPayload = {
      url: `${process.env.SERVER_URL}/uploads/${payload?.file?.filename}`,
    };
    const folderDocumentExist = await folderDocumentModel.findOne({
      where: { id: folderDocumentId },
    });
    if (!folderDocumentExist) {
      return HELPERS.responseHelper.createErrorResponse(
        MESSAGES.FOLDER_DOCUMENT_NOT_FOUND,
        ERROR_TYPES.DATA_NOT_FOUND
      );
    }
    await folderDocumentModel.update(folderDocumentPayload, {
      where: { id: folderDocumentId },
    });

    return Object.assign(
      HELPERS.responseHelper.createSuccessResponse(
        MESSAGES.FOLDER_DOCUMENT_UPDATED_SUCCESSFULLY
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
folderDocumentController.getFolderDocumentList = async (payload) => {
  try {
    const { folderId } = payload;
    const folderDocumentList = await folderDocumentModel.findAll({
      where: {
        folderId: folderId,
        isDeleted: { [Op.ne]: true },
      },
    });

    return Object.assign(
      HELPERS.responseHelper.createSuccessResponse(
        MESSAGES.FOLDER_DOCUMENT_LIST_SUCCESSFULLY
      ),
      { data: folderDocumentList }
    );
  } catch (error) {
    throw HELPERS.responseHelper.createErrorResponse(
      error.msg || error.message,
      error.statusCode || ERROR_TYPES.SOMETHING_WENT_WRONG
    );
  }
};

/**
 * Function to get document by id
 * @param {*} payload
 * @returns
 */
folderDocumentController.getDocumentById = async (payload) => {
  try {
    const { documentId } = payload;
    const folderDocument = await folderDocumentModel.findAll({
      where: {
        id: documentId,
        isDeleted: { [Op.ne]: true },
      },
    });

    return Object.assign(
      HELPERS.responseHelper.createSuccessResponse(
        MESSAGES.FOLDER_DOCUMENT_FETCHED_SUCCESSFULLY
      ),
      { data: folderDocument }
    );
  } catch (error) {
    throw HELPERS.responseHelper.createErrorResponse(
      error.msg || error.message,
      error.statusCode || ERROR_TYPES.SOMETHING_WENT_WRONG
    );
  }
};

folderDocumentController.deleteFolderDocument = async (payload) => {
  try {
    const { folderDocumentId } = payload;

    const folderDocumentExist = await folderDocumentModel.findOne({
      where: { id: folderDocumentId },
    });
    if (!folderDocumentExist) {
      return HELPERS.responseHelper.createErrorResponse(
        MESSAGES.FOLDER_DOCUMENT_NOT_FOUND,
        ERROR_TYPES.DATA_NOT_FOUND
      );
    }

    await folderDocumentModel.update(
      { isDeleted: true },
      { where: { id: folderDocumentId } }
    );

    return Object.assign(
      HELPERS.responseHelper.createSuccessResponse(
        MESSAGES.FOLDER_DOCUMENT_DELETED_SUCCESSFULLY
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
module.exports = folderDocumentController;
