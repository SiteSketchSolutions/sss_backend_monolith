const HELPERS = require("../helpers");
const { Op } = require("sequelize");
const { MESSAGES, ERROR_TYPES } = require("../utils/constants");
const materialSelectedItemModel = require("../models/materialSelectedItemModel");
const materialItemModel = require("../models/materialItemModel");
/**************************************************
 ***************** Material Selected Item controller ***************
 **************************************************/
let materialSelectedItemController = {};

/**
 * Function to create material selected item
 * @param {*} payload
 * @returns
 */
materialSelectedItemController.createMaterialSelectedItem = async (payload) => {
  try {
    const { userId, materialItemId } = payload;
    const materialItemPayload = {
      userId,
      materialItemId,
      selected: true,
    };
    const materialItemExist = await materialSelectedItemModel.findOne({
      where: {
        userId: userId,
        materialItemId: materialItemId,
        isDeleted: { [Op.ne]: true },
      },
    });

    if (materialItemExist) {
      return HELPERS.responseHelper.createErrorResponse(
        MESSAGES.MATERIAL_SELECT_ITEM_ALREADY_EXIST,
        ERROR_TYPES.BAD_REQUEST
      );
    }

    const materialItem = await materialSelectedItemModel.create(
      materialItemPayload
    );
    const response = {
      id: materialItem?.id,
    };
    return Object.assign(
      HELPERS.responseHelper.createSuccessResponse(
        MESSAGES.MATERIAL_SELECT_ITEM_CREATED_SUCCESSFULLY
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
materialSelectedItemController.updateMaterialSelectedItem = async (payload) => {
  try {
    const { materialSelectedItemId, selected } = payload;

    let updatePayload = {
      selected: selected,
    };
    await materialItemModel.update(updatePayload, {
      where: { id: materialSelectedItemId },
    });

    return Object.assign(
      HELPERS.responseHelper.createSuccessResponse(
        MESSAGES.MATERIAL_SELECT_ITEM_UPDATED_SUCCESSFULLY
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

// /**
//  * Function to list material item
//  * @param {*} payload
//  * @returns
//  */
// materialSelectedItemController.materialSelectedItemList = async (payload) => {
//   try {
//     const { materialCategoryId, userId } = payload;
//     const materialItemList = await materialItemModel.findAll({
//       where: { materialCategoryId: materialCategoryId },
//     });
//     const materialItemIds = [];
//     materialItemList.forEach((_item) => {
//       materialItemIds.push(_item?.id);
//     });
//     const [materialSelectedItems, allMaterialItemList] = await Promise.all([
//       materialSelectedItemModel.findAll({
//         where: {
//           isDeleted: { [Op.ne]: true },
//           userId: userId,
//           materialItemId: materialItemIds,
//         },
//         order: [["id", "ASC"]],
//         include: [{
//           model: materialItemModel,
//           attributes: ['id', 'name', 'image', 'description'],
//           required: true
//         }],
//         raw: true
//       }),
//       materialItemModel.findAll({
//         where: {
//           isDeleted: { [Op.ne]: true },
//           materialCategoryId: materialCategoryId,
//         },
//         attributes: ['id', 'name', 'image', 'description'],
//         raq: true
//       })
//     ])
//     console.log(JSON.stringify(allMaterialItemList, null, 2), "allMaterialItemList====>", JSON.stringify(materialSelectedItems, null, 2), "materialSelectedItems===>")
//     return Object.assign(
//       HELPERS.responseHelper.createSuccessResponse(
//         MESSAGES.MATERIAL_SELECT_ITEM_LIST_SUCCESSFULLY
//       ),
//       { data: materialSelectedItems }
//     );
//   } catch (error) {
//     throw HELPERS.responseHelper.createErrorResponse(
//       error.msg,
//       ERROR_TYPES.SOMETHING_WENT_WRONG
//     );
//   }
// };

/**
 * Function to list material items with user selection status
 * @param {*} payload
 * @returns
 */
materialSelectedItemController.materialSelectedItemList = async (payload) => {
  try {
    const { materialCategoryId, userId } = payload;

    // Fetch all material items and user-selected items
    const [allMaterialItemList, materialSelectedItems] = await Promise.all([
      materialItemModel.findAll({
        where: {
          isDeleted: { [Op.ne]: true },
          materialCategoryId: materialCategoryId,
        },
        attributes: ['id', 'name', 'image', 'description'],
        raw: true,
      }),
      materialSelectedItemModel.findAll({
        where: {
          isDeleted: { [Op.ne]: true },
          userId: userId,
        },
        attributes: ['materialItemId'],
        raw: true,
      }),
    ]);
    // Extract selected material item IDs for the user
    const selectedItemIds = new Set(
      materialSelectedItems.map((item) => item.materialItemId)
    );
    // Map all material items with their selection status
    const response = allMaterialItemList.map((item) => ({
      id: item.id,
      selected: selectedItemIds.has(item.id),
      itemName: item.name,
      itemImage: item.image,
      itemDescription: item.description,
    }));

    // Return the formatted response
    return Object.assign(
      HELPERS.responseHelper.createSuccessResponse(
        MESSAGES.MATERIAL_SELECT_ITEM_LIST_SUCCESSFULLY
      ),
      { data: response }
    );
  } catch (error) {
    // Handle errors
    throw HELPERS.responseHelper.createErrorResponse(
      error.message || 'Something went wrong',
      ERROR_TYPES.SOMETHING_WENT_WRONG
    );
  }
};

module.exports = materialSelectedItemController;
