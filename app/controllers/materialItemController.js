const HELPERS = require("../helpers");
const { Op } = require("sequelize");
const { MESSAGES, ERROR_TYPES } = require("../utils/constants");
const materialItemModel = require("../models/materialItemModel");

/**************************************************
 ***************** Material Item controller ***************
 **************************************************/
let materialItemController = {};

/**
 * Function to create material item
 * @param {*} payload
 * @returns
 */
materialItemController.createMaterialItem = async (payload) => {
  try {
    const { name, description, materialCategoryId, url } = payload;
    const materialItemPayload = {
      name,
      description,
      materialCategoryId: materialCategoryId,
      image: url
    };
    const materialItemExist = await materialItemModel.findOne({
      where: {
        name: name,
        materialCategoryId: materialCategoryId,
        isDeleted: { [Op.ne]: true },
      },
    });

    if (materialItemExist) {
      return HELPERS.responseHelper.createErrorResponse(
        MESSAGES.MATERIAL_ITEM_ALREADY_EXIST,
        ERROR_TYPES.BAD_REQUEST
      );
    }

    const materialItem = await materialItemModel.create(materialItemPayload);
    const response = {
      id: materialItem?.id,
    };
    return Object.assign(
      HELPERS.responseHelper.createSuccessResponse(
        MESSAGES.MATERIAL_ITEM_CREATED_SUCCESSFULLY
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

/**
 * Function to update material item
 * @param {*} payload
 * @returns
 */
materialItemController.updateMaterialItem = async (payload) => {
  try {
    const { materialItemId, name, description, url } = payload;

    let updatePayload = {
      name,
      description,
    };
    if (url) {
      updatePayload.image = url;
    }
    await materialItemModel.update(updatePayload, {
      where: { id: materialItemId, isDeleted: { [Op.ne]: true } },
    });

    return Object.assign(
      HELPERS.responseHelper.createSuccessResponse(
        MESSAGES.MATERIAL_ITEM_UPDATED_SUCCESSFULLY
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

/**
 * Function to list material item
 * @param {*} payload
 * @returns
 */
materialItemController.materialItemList = async (payload) => {
  try {
    const { materialCategoryId } = payload;
    const materialItems = await materialItemModel.findAll({
      where: {
        isDeleted: { [Op.ne]: true },
        materialCategoryId: materialCategoryId,
      },
      attributes: ["id", "name", "description", "image"],
      order: [["id", "ASC"]],
    });

    return Object.assign(
      HELPERS.responseHelper.createSuccessResponse(
        MESSAGES.MATERIAL_ITEM_LIST_SUCCESSFULLY
      ),
      { data: materialItems }
    );
  } catch (error) {
    throw HELPERS.responseHelper.createErrorResponse(
      error.msg,
      ERROR_TYPES.SOMETHING_WENT_WRONG
    );
  }
};

materialItemController.deleteMaterialItem = async (payload) => {
  try {
    const { materialItemId } = payload;

    await materialItemModel.update(
      { isDeleted: true },
      { where: { id: materialItemId } }
    );

    return Object.assign(
      HELPERS.responseHelper.createSuccessResponse(
        MESSAGES.MATERIAL_ITEM_DELETED_SUCCESSFULLY
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

module.exports = materialItemController;
