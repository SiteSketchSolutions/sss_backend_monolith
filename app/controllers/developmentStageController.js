const HELPERS = require("../helpers");
const { Op } = require("sequelize");
const { MESSAGES, ERROR_TYPES } = require("../utils/constants");
const developmentStageModel = require("../models/developmentStageModel");

/**************************************************
 ***************** Development Stage controller ***************
 **************************************************/
let developmentStageController = {};

/**
 * Function to create development stage
 * @param {*} payload
 * @returns
 */
developmentStageController.createDevelopmentStage = async (payload) => {
  try {
    const { projectId, name, description, order, image } = payload?.fields;
    const stagePayload = {
      projectId,
      name,
      description,
      order,
      image: `${process.env.SERVER_URL}/uploads/${payload?.file?.filename}`,
    };
    const stageExist = await developmentStageModel.findOne({
      where: {
        projectId: projectId,
        order: order,
        isDeleted: { [Op.ne]: true },
      },
    });

    if (stageExist) {
      return HELPERS.responseHelper.createErrorResponse(
        MESSAGES.STAGE_ALREADY_EXIST,
        ERROR_TYPES.BAD_REQUEST
      );
    }

    const stage = await developmentStageModel.create(stagePayload);
    const response = {
      id: stage?.id,
    };
    return Object.assign(
      HELPERS.responseHelper.createSuccessResponse(
        MESSAGES.STAGE_CREATED_SUCCESSFULLY
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
 * Function to update development stage
 * @param {*} payload
 * @returns
 */
developmentStageController.updateDevelopmentStage = async (payload) => {
  try {
    const { stageId, name, description, order, image } = payload;

    const updatePayload = {
      name,
      description,
      order,
      image,
    };
    await developmentStageModel.update(updatePayload, {
      where: { id: stageId, isDeleted: { [Op.ne]: true } },
    });

    return Object.assign(
      HELPERS.responseHelper.createSuccessResponse(
        MESSAGES.STAGE_UPDATED_SUCCESSFULLY
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
developmentStageController.developmentStageList = async (payload) => {
  try {
    const { projectId } = payload;
    const stages = await developmentStageModel.findAll({
      where: {
        projectId: projectId,
        isDeleted: { [Op.ne]: true },
      },
      attributes: ["id", "name", "description", "image", "order"],
      order: [["order", "ASC"]],
    });

    return Object.assign(
      HELPERS.responseHelper.createSuccessResponse(
        MESSAGES.STAGE_LIST_SUCCESSFULLY
      ),
      { data: stages }
    );
  } catch (error) {
    throw HELPERS.responseHelper.createErrorResponse(
      error.msg,
      ERROR_TYPES.SOMETHING_WENT_WRONG
    );
  }
};

developmentStageController.deleteDevelopmentStage = async (payload) => {
  try {
    const { stageId } = payload;

    const updated = await developmentStageModel.update(
      { isDeleted: true },
      { where: { id: stageId } }
    );

    return Object.assign(
      HELPERS.responseHelper.createSuccessResponse(
        MESSAGES.STAGE_DELETED_SUCCESSFULLY
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

module.exports = developmentStageController;
