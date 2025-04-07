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
    const { materialCategoryId, search } = payload;

    // Build the where criteria based on input parameters
    let criteria = {
      isDeleted: { [Op.ne]: true }
    };

    // Add materialCategoryId filter if provided
    if (materialCategoryId) {
      criteria.materialCategoryId = materialCategoryId;
    }

    // Add search by name if provided
    if (search) {
      criteria.name = {
        [Op.like]: `%${search}%`
      };
    }

    const materialItems = await materialItemModel.findAll({
      where: criteria,
      attributes: ["id", "name", "description", "image", "materialCategoryId"],
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
      error.msg || error.message,
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

/**
 * Function to search material items across all categories
 * @param {*} payload
 * @returns
 */
materialItemController.searchMaterialItems = async (payload) => {
  try {
    const { search, page = 1, limit = 10 } = payload;

    // Build the where criteria based on input parameters
    let criteria = {
      isDeleted: { [Op.ne]: true }
    };

    // Add search by name if provided
    if (search) {
      criteria.name = {
        [Op.like]: `%${search}%`
      };
    }

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Get total count and paginated results
    const { count, rows: materialItems } = await materialItemModel.findAndCountAll({
      where: criteria,
      attributes: ["id", "name", "description", "image", "materialCategoryId"],
      order: [["name", "ASC"]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Format the response with pagination information
    const response = {
      totalItems: count,
      items: materialItems,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      itemsPerPage: parseInt(limit)
    };

    return Object.assign(
      HELPERS.responseHelper.createSuccessResponse(
        "Material items searched successfully"
      ),
      { data: response }
    );
  } catch (error) {
    console.error("Error in searchMaterialItems:", error);
    throw HELPERS.responseHelper.createErrorResponse(
      error.msg || error.message,
      ERROR_TYPES.SOMETHING_WENT_WRONG
    );
  }
};

module.exports = materialItemController;
