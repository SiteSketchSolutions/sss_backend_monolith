// "use strict";
const HELPERS = require("../helpers");
const { Op } = require("sequelize");
const { MESSAGES, ERROR_TYPES } = require("../utils/constants");

const projectModel = require("../models/projectModel");

/**************************************************
 ***************** Project controller ***************
 **************************************************/
let projectController = {};

/**
 * Function to create a project
 * @param {*} payload
 * @returns
 */
projectController.createProject = async (payload) => {
  try {
    const {
      userId,
      name,
      area,
      numberOfFloor,
      percentageOfCompletion,
      status,
      price,
      package,
      location,
      description,
      startDate,
    } = payload?.fields;
    const projectPayload = {
      userId,
      name,
      area,
      numberOfFloor,
      percentageOfCompletion,
      status,
      price,
      package,
      image: `${process.env.SERVER_URL}/uploads/${payload?.file?.filename}`,
      location,
      description,
      startDate,
    };
    let projectDetails = await projectModel.findOne({
      where: { userId: parseInt(userId), isDeleted: { [Op.ne]: true } },
      attributes: ["id"],
    });
    if (projectDetails) {
      return HELPERS.responseHelper.createErrorResponse(
        MESSAGES.PROJECT_ALREADY_EXIST,
        ERROR_TYPES.ALREADY_EXISTS
      );
    }

    const projectResponse = await projectModel.create(projectPayload);
    const response = {
      id: projectResponse?.id,
    };
    return Object.assign(
      HELPERS.responseHelper.createSuccessResponse(
        MESSAGES.PROJECT_CREATED_SUCCESSFULLY
      ),
      { data: response }
    );
  } catch (error) {
    console.log(error, "error")
    throw HELPERS.responseHelper.createErrorResponse(
      error.msg,
      ERROR_TYPES.SOMETHING_WENT_WRONG
    );
  }
};

/**
 * Route to update the project
 * @param {*} payload
 * @returns
 */
projectController.updateProject = async (payload) => {
  try {
    const {
      projectId,
      name,
      area,
      numberOfFloor,
      percentageOfCompletion,
      status,
      price,
      package,
      location,
      description,
      startDate,
    } = payload?.fields;
    let projectPayload = {
      name,
      area,
      numberOfFloor,
      percentageOfCompletion,
      status,
      price,
      package,
      location,
      description,
      startDate,
    };
    if (payload?.file?.filename) {
      projectPayload.image = `${process.env.SERVER_URL}/uploads/${payload?.file?.filename}`;
    }
    const projectResponse = await projectModel.update(projectPayload, {
      where: { id: projectId },
    });

    const response = {
      id: projectResponse?.id,
    };
    return Object.assign(
      HELPERS.responseHelper.createSuccessResponse(
        MESSAGES.PROFILE_UPDATE_SUCCESSFULLY
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
 * Function to get list of projects
 * @param {*} payload
 * @returns
 */
projectController.projectList = async (payload) => {
  try {
    const { userId } = payload;
    let criteria = { isDeleted: { [Op.ne]: true } };
    if (userId) {
      criteria.userId = userId;
    }
    //development stage.
    const projectList = await projectModel.findAll({
      where: criteria,
      attributes: [
        "id",
        "userId",
        "name",
        "area",
        "numberOfFloor",
        "percentageOfCompletion",
        "status",
        "price",
        "package",
        "image",
        "location",
        "description",
        "startDate",
        "status",
      ],
    });
    return Object.assign(
      HELPERS.responseHelper.createSuccessResponse(
        MESSAGES.PROJECT_LIST_SUCCESSFULLY
      ),
      { data: projectList }
    );
  } catch (error) {
    throw HELPERS.responseHelper.createErrorResponse(
      error.msg,
      ERROR_TYPES.SOMETHING_WENT_WRONG
    );
  }
};

/**
 * Function to get projects details by id
 * @param {*} payload
 * @returns
 */
projectController.projectById = async (payload) => {
  try {
    const { projectId } = payload;
    let criteria = { isDeleted: { [Op.ne]: true } };
    if (projectId) {
      criteria.id = projectId;
    }
    const projectDetails = await projectModel.findOne({
      where: criteria,
      attributes: [
        "id",
        "userId",
        "name",
        "area",
        "numberOfFloor",
        "percentageOfCompletion",
        "status",
        "price",
        "package",
        "image",
        "location",
        "description",
        "startDate",
        "status",
      ],
    });
    return Object.assign(
      HELPERS.responseHelper.createSuccessResponse(
        MESSAGES.PROJECT_DETAILS_FETCHED_SUCCESSFULLY
      ),
      { data: projectDetails }
    );
  } catch (error) {
    console.log(error, "error")
    throw HELPERS.responseHelper.createErrorResponse(
      error.msg,
      ERROR_TYPES.SOMETHING_WENT_WRONG
    );
  }
};

/**
 * Function to delete project id
 * @param {*} payload
 * @returns
 */
projectController.deleteById = async (payload) => {
  try {
    const { projectId } = payload;
    let criteria = { isDeleted: { [Op.ne]: true } };
    if (projectId) {
      criteria.id = projectId;
    }
    await projectModel.update(
      { isDeleted: true },
      {
        where: criteria,
      }
    );
    return Object.assign(
      HELPERS.responseHelper.createSuccessResponse(
        MESSAGES.PROJECT_DELETED_SUCCESSFULLY
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

/* export projectController */
module.exports = projectController;
