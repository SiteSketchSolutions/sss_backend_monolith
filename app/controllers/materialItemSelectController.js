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
    const { userId, materialItemId, selected } = payload;

    // Check if the item already exists
    const materialItemExist = await materialSelectedItemModel.findOne({
      where: {
        userId: userId,
        materialItemId: materialItemId,
        isDeleted: { [Op.ne]: true },
      },
    });

    if (materialItemExist) {
      // If it already exists and is selected, return error
      return HELPERS.responseHelper.createErrorResponse(
        MESSAGES.MATERIAL_SELECT_ITEM_ALREADY_EXIST,
        ERROR_TYPES.BAD_REQUEST
      );
    }

    // Create new selected item
    const materialItemPayload = {
      userId,
      materialItemId,
      selected: selected,  // Always create as selected
    };

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
    const { materialSelectedItemId, materialItemId, userId, selected } = payload;
    let materialItem;

    // Check if we're updating by materialSelectedItemId or by materialItemId + userId
    if (materialSelectedItemId) {
      // Find by materialSelectedItemId (original method)
      materialItem = await materialSelectedItemModel.findOne({
        where: {
          id: materialSelectedItemId,
          isDeleted: { [Op.ne]: true }
        }
      });
    } else if (materialItemId && userId) {
      // Find by materialItemId and userId
      materialItem = await materialSelectedItemModel.findOne({
        where: {
          materialItemId: materialItemId,
          userId: userId,
          isDeleted: { [Op.ne]: true }
        }
      });

      // If no selection record exists and we want to mark as selected, create one
      if (!materialItem) {
        // Create a new selection record
        const newMaterialItem = await materialSelectedItemModel.create({
          materialItemId,
          userId,
          selected: selected
        });

        return Object.assign(
          HELPERS.responseHelper.createSuccessResponse(
            MESSAGES.MATERIAL_SELECT_ITEM_CREATED_SUCCESSFULLY
          ),
          {
            data: {
              id: newMaterialItem.id,
              materialItemId: newMaterialItem.materialItemId,
              selected: selected
            }
          }
        );
      }
    } else {
      return HELPERS.responseHelper.createErrorResponse(
        "Either materialSelectedItemId or both materialItemId and userId are required",
        ERROR_TYPES.BAD_REQUEST
      );
    }

    if (!materialItem) {
      return HELPERS.responseHelper.createErrorResponse(
        "Material selected item not found",
        ERROR_TYPES.DATA_NOT_FOUND
      );
    }


    // Otherwise update the item to selected status
    await materialSelectedItemModel.update(
      { selected: selected },
      { where: { id: materialItem.id } }
    );

    return Object.assign(
      HELPERS.responseHelper.createSuccessResponse(
        MESSAGES.MATERIAL_SELECT_ITEM_UPDATED_SUCCESSFULLY
      ),
      {
        data: {
          id: materialItem.id,
          materialItemId: materialItem.materialItemId,
          selected: selected
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

/**
 * Function to update material item approval
 * @param {*} payload
 * @returns
 */
materialSelectedItemController.updateMaterialItemApproval = async (payload) => {
  try {
    const { materialSelectedItemId, approvalStatus, approvalNote } = payload;

    // Validate approvalStatus is one of the allowed values
    const allowedStatuses = ['approved', 'rejected'];
    if (!allowedStatuses.includes(approvalStatus)) {
      return HELPERS.responseHelper.createErrorResponse(
        "Invalid approval status. Must be 'approved' or 'rejected'",
        ERROR_TYPES.BAD_REQUEST
      );
    }

    // Find the material selected item
    const materialItem = await materialSelectedItemModel.findOne({
      where: {
        id: materialSelectedItemId,
        isDeleted: { [Op.ne]: true }
      },
      include: [
        {
          model: materialItemModel,
          attributes: ['id', 'name'],
          required: false
        }
      ]
    });

    if (!materialItem) {
      return HELPERS.responseHelper.createErrorResponse(
        "Material selected item not found",
        ERROR_TYPES.DATA_NOT_FOUND
      );
    }

    // Check if the item is selected
    if (!materialItem.selected) {
      return HELPERS.responseHelper.createErrorResponse(
        "Cannot approve/reject an unselected material item",
        ERROR_TYPES.BAD_REQUEST
      );
    }

    // Check if the item has already been approved or rejected
    if (materialItem.approvalStatus && materialItem.approvalStatus !== 'pending') {
      return HELPERS.responseHelper.createErrorResponse(
        `This material item has already been ${materialItem.approvalStatus}. Cannot change approval status.`,
        ERROR_TYPES.BAD_REQUEST
      );
    }

    // Update the item's approval status
    await materialSelectedItemModel.update(
      {
        approvalStatus: approvalStatus,
        approvalNote: approvalNote,
        approvedAt: new Date()
      },
      { where: { id: materialSelectedItemId } }
    );

    // Get item details after update for the response
    const updatedItem = await materialSelectedItemModel.findOne({
      where: { id: materialSelectedItemId },
      include: [
        {
          model: materialItemModel,
          attributes: ['id', 'name'],
          required: false
        }
      ]
    });

    return Object.assign(
      HELPERS.responseHelper.createSuccessResponse(
        `Material item has been ${approvalStatus} successfully`
      ),
      {
        data: {
          id: updatedItem.id,
          materialItemId: updatedItem.materialItemId,
          materialItemName: updatedItem.materialItem?.name,
          selected: updatedItem.selected,
          approvalStatus: updatedItem.approvalStatus,
          approvalNote: updatedItem.approvalNote,
          approvedAt: updatedItem.approvedAt
        }
      }
    );
  } catch (error) {
    console.error("Error in updateMaterialItemApproval:", error);
    throw HELPERS.responseHelper.createErrorResponse(
      error.message || error.msg,
      ERROR_TYPES.SOMETHING_WENT_WRONG
    );
  }
};

/**
 * Function to list material items with user selection status
 * @param {*} payload
 * @returns
 */
materialSelectedItemController.materialSelectedItemList = async (payload) => {
  try {
    const { materialCategoryId, userId } = payload;

    // Get all selected items for this user and category
    const materialSelectedItems = await materialSelectedItemModel.findAll({
      where: {
        isDeleted: { [Op.ne]: true },
        userId: userId,
        selected: true // Only get items that are actually selected
      },
      attributes: ['id', 'materialItemId', 'selected', 'approvalStatus', 'approvalNote', 'approvedAt'],
      include: [
        {
          model: materialItemModel,
          as: 'materialItem',
          where: {
            materialCategoryId: materialCategoryId,
            isDeleted: { [Op.ne]: true }
          },
          attributes: ['id', 'name', 'image', 'description']
        }
      ]
    });

    // Format the response to include only selected items
    const response = materialSelectedItems.map(item => ({
      id: item.materialItem.id,
      selected: item.selected, // These are all selected items
      selectionId: item.id,
      approvalStatus: item.approvalStatus || null,
      approvalNote: item.approvalNote || null,
      approvedAt: item.approvedAt || null,
      itemName: item.materialItem.name,
      itemImage: item.materialItem.image,
      itemDescription: item.materialItem.description,
    }));


    // Return the formatted response with only selected items
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

/**
 * Function to delete material selected item
 * @param {*} payload
 * @returns
 */
materialSelectedItemController.deleteMaterialSelectedItem = async (payload) => {
  try {
    const { materialSelectedItemId } = payload;

    await materialSelectedItemModel.update({ isDeleted: true }, { where: { id: materialSelectedItemId } });

    return Object.assign(
      HELPERS.responseHelper.createSuccessResponse(
        MESSAGES.MATERIAL_SELECT_ITEM_DELETED_SUCCESSFULLY
      ),
      { data: null }
    );
  } catch (error) {
    console.error("Error in deleteMaterialSelectedItem:", error);
    throw HELPERS.responseHelper.createErrorResponse(
      error.message || error.msg,
      ERROR_TYPES.SOMETHING_WENT_WRONG
    );
  }
}

module.exports = materialSelectedItemController;
