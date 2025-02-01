const HELPERS = require("../helpers");
const { Op } = require("sequelize");
const { MESSAGES, ERROR_TYPES } = require("../utils/constants");
const materialCategoryModel = require("../models/materialCategoryModel");

/**************************************************
 ***************** Material Category controller ***************
 **************************************************/
let materialCategoryController = {};

/**
 * Function to create material category
 * @param {*} payload
 * @returns
 */
materialCategoryController.createMaterialCategory = async (payload) => {
  try {
    const { name, description, url } = payload;
    const materialCategoryPayload = {
      name,
      description,
      image: url
    };
    const materialCategoryExist = await materialCategoryModel.findOne({
      where: {
        name: name,
        isDeleted: { [Op.ne]: true },
      },
    });

    if (materialCategoryExist) {
      return HELPERS.responseHelper.createErrorResponse(
        MESSAGES.MATERIAL_CATEGORY_ALREADY_EXIST,
        ERROR_TYPES.BAD_REQUEST
      );
    }

    const stage = await materialCategoryModel.create(materialCategoryPayload);
    const response = {
      id: stage?.id,
    };
    return Object.assign(
      HELPERS.responseHelper.createSuccessResponse(
        MESSAGES.MATERIAL_CATEGORY_CREATED_SUCCESSFULLY
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
 * Function to update material category
 * @param {*} payload
 * @returns
 */
materialCategoryController.updateMaterialCategory = async (payload) => {
  try {
    const { materialCategoryId, name, description, url } = payload;

    let updatePayload = {
      name,
      description
    };
    if (url) {
      updatePayload.image = url
    }
    await materialCategoryModel.update(updatePayload, {
      where: { id: materialCategoryId, isDeleted: { [Op.ne]: true } },
    });

    return Object.assign(
      HELPERS.responseHelper.createSuccessResponse(
        MESSAGES.MATERIAL_CATEGORY_UPDATED_SUCCESSFULLY
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
 * Function to list development stages
 * @param {*} payload
 * @returns
 */
materialCategoryController.materialCategoryList = async (payload) => {
  try {
    const materialCategories = await materialCategoryModel.findAll({
      where: {
        isDeleted: { [Op.ne]: true },
      },
      attributes: ["id", "name", "description", "image"],
      order: [["id", "ASC"]],
    });

    return Object.assign(
      HELPERS.responseHelper.createSuccessResponse(
        MESSAGES.MATERIAL_CATEGORY_LIST_SUCCESSFULLY
      ),
      { data: materialCategories }
    );
  } catch (error) {
    throw HELPERS.responseHelper.createErrorResponse(
      error.msg,
      ERROR_TYPES.SOMETHING_WENT_WRONG
    );
  }
};

materialCategoryController.deleteMaterialCategory = async (payload) => {
  try {
    const { materialCategoryId } = payload;

    await materialCategoryModel.update(
      { isDeleted: true },
      { where: { id: materialCategoryId } }
    );

    return Object.assign(
      HELPERS.responseHelper.createSuccessResponse(
        MESSAGES.MATERIAL_CATEGORY_DELETED_SUCCESSFULLY
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

module.exports = materialCategoryController;
