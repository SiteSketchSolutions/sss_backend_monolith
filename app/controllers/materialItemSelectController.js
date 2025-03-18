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

    // Check if the item already exists
    const materialItemExist = await materialSelectedItemModel.findOne({
      where: {
        userId: userId,
        materialItemId: materialItemId,
        isDeleted: { [Op.ne]: true },
      },
    });

    if (materialItemExist) {
      // If it exists but is not selected, update it to selected
      if (materialItemExist.selected !== true) {
        await materialSelectedItemModel.update(
          { selected: true },
          {
            where: {
              id: materialItemExist.id
            }
          }
        );

        return Object.assign(
          HELPERS.responseHelper.createSuccessResponse(
            MESSAGES.MATERIAL_SELECT_ITEM_UPDATED_SUCCESSFULLY
          ),
          { data: { id: materialItemExist.id } }
        );
      }

      // If it already exists and is selected, return error
      return HELPERS.responseHelper.createErrorResponse(
        MESSAGES.MATERIAL_SELECT_ITEM_ALREADY_EXIST,
        ERROR_TYPES.BAD_REQUEST
      );
    }

    // Create new selected item with selected explicitly set to true
    const materialItemPayload = {
      userId,
      materialItemId,
      selected: true,
    };

    const materialItem = await materialSelectedItemModel.create(
      materialItemPayload
    );

    console.log("Created new material selected item:", materialItem.id, "with selected =", materialItem.selected);

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
    console.error("Error in createMaterialSelectedItem:", error);
    throw HELPERS.responseHelper.createErrorResponse(
      error.message || error.msg,
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

    // First check if the item exists
    const materialItem = await materialSelectedItemModel.findOne({
      where: {
        id: materialSelectedItemId,
        isDeleted: { [Op.ne]: true }
      }
    });

    if (!materialItem) {
      return HELPERS.responseHelper.createErrorResponse(
        "Material selected item not found",
        ERROR_TYPES.DATA_NOT_FOUND
      );
    }

    // Make sure selected is explicitly set to a boolean value
    const selectedValue = selected === true || selected === false ? selected : true;

    // Update the item
    await materialSelectedItemModel.update(
      { selected: selectedValue },
      { where: { id: materialSelectedItemId } }
    );

    console.log(`Updated material selected item ${materialSelectedItemId} with selected = ${selectedValue}`);

    return Object.assign(
      HELPERS.responseHelper.createSuccessResponse(
        MESSAGES.MATERIAL_SELECT_ITEM_UPDATED_SUCCESSFULLY
      ),
      {
        data: {
          id: materialSelectedItemId,
          selected: selectedValue
        }
      }
    );
  } catch (error) {
    console.error("Error in updateMaterialSelectedItem:", error);
    throw HELPERS.responseHelper.createErrorResponse(
      error.message || error.msg,
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

    // First get all material items for this category
    const allMaterialItemList = await materialItemModel.findAll({
      where: {
        isDeleted: { [Op.ne]: true },
        materialCategoryId: materialCategoryId,
      },
      attributes: ['id', 'name', 'image', 'description'],
      raw: true,
    });

    // Extract all material item IDs for this category
    const materialItemIds = allMaterialItemList.map(item => item.id);

    // Now get only the selected items for this user AND for these material items
    const materialSelectedItems = await materialSelectedItemModel.findAll({
      where: {
        isDeleted: { [Op.ne]: true },
        userId: userId,
        materialItemId: { [Op.in]: materialItemIds },
        selected: true // Only get items that are actually selected
      },
      attributes: ['materialItemId', 'selected'],
      raw: true,
    });

    // Create a map of selected item IDs for faster lookup
    const selectedItemMap = {};
    materialSelectedItems.forEach(item => {
      selectedItemMap[item.materialItemId] = true;
    });

    // Map all material items with their selection status
    const response = allMaterialItemList.map((item) => ({
      id: item.id,
      selected: selectedItemMap[item.id] === true, // Explicitly check for true
      itemName: item.name,
      itemImage: item.image,
      itemDescription: item.description,
    }));

    console.log("Selected items map:", selectedItemMap);
    console.log("Response sample:", response.slice(0, 3));

    // Return the formatted response
    return Object.assign(
      HELPERS.responseHelper.createSuccessResponse(
        MESSAGES.MATERIAL_SELECT_ITEM_LIST_SUCCESSFULLY
      ),
      { data: response }
    );
  } catch (error) {
    console.error("Error in materialSelectedItemList:", error);
    // Handle errors
    throw HELPERS.responseHelper.createErrorResponse(
      error.message || 'Something went wrong',
      ERROR_TYPES.SOMETHING_WENT_WRONG
    );
  }
};

module.exports = materialSelectedItemController;
