const HELPERS = require("../helpers");
const { Op } = require("sequelize");
const { MESSAGES, ERROR_TYPES, PAGINATION } = require("../utils/constants");
const siteUpdateModel = require("../models/siteUpdateModel");
const { getPaginationResponse } = require("../utils/utils")
/**************************************************
 ***************** Site Update Controller ***************
 **************************************************/
let siteUpdateController = {};

/**
 * Function to create site update
 * @param {*} payload
 * @returns
 */
siteUpdateController.createSiteUpdate = async (payload) => {
  try {
    const { name, description, author, userId } = payload?.fields;
    const siteUpdatePayload = {
      name,
      description,
      userId: userId,
      author: author,
      image: `${process.env.SERVER_URL}/uploads/${payload?.file?.filename}`,
    };
    const siteUpdate = await siteUpdateModel.create(siteUpdatePayload);
    const response = {
      id: siteUpdate?.id,
    };
    return Object.assign(
      HELPERS.responseHelper.createSuccessResponse(
        MESSAGES.SITE_UPDATE_CREATED_SUCCESSFULLY
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
 * Function to update site update
 * @param {*} payload
 * @returns
 */
siteUpdateController.updateSiteUpdate = async (payload) => {
  try {
    const { name, description, author, siteUpdateId } = payload;

    let updatePayload = {
      name,
      description,
      author,
    };
    await siteUpdateModel.update(updatePayload, {
      where: { id: siteUpdateId, isDeleted: { [Op.ne]: true } },
    });

    return Object.assign(
      HELPERS.responseHelper.createSuccessResponse(
        MESSAGES.SITE_UPDATE_UPDATED_SUCCESSFULLY
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
 * Function to list site update
 * @param {*} payload
 * @returns
 */
siteUpdateController.getSiteUpdateList = async (payload) => {
  try {
    const { userId, size, page, startDate, endDate } = payload;
    const pageNo = page || PAGINATION.DEFAULT_PAGE
    const pageLimit = size || PAGINATION.DEFAULT_PAGE_LIMIT
    let criteria = {
      isDeleted: { [Op.ne]: true },
      userId: userId
    }
    if (startDate && endDate) {
      criteria.createdAt = { [Op.between]: [startDate, endDate] }
    }
    const { count, rows } = await siteUpdateModel.findAndCountAll({
      where: criteria,
      order: [["id", "DESC"]],
      limit: pageLimit,
      offset: (pageNo - 1) * pageLimit,
      attributes: [
        "id",
        "name",
        "description",
        "image",
        "author",
        "createdAt",
        "updatedAt",
      ],
    });

    const paginationData = { count, pageNo, pageLimit, rows }
    const formattedResponse = getPaginationResponse(paginationData)
    return Object.assign(
      HELPERS.responseHelper.createSuccessResponse(
        MESSAGES.SITE_UPDATE_LIST_SUCCESSFULLY
      ),
      formattedResponse
    );
  } catch (error) {
    throw HELPERS.responseHelper.createErrorResponse(
      error.msg,
      ERROR_TYPES.SOMETHING_WENT_WRONG
    );
  }
};

siteUpdateController.deleteSiteUpdate = async (payload) => {
  try {
    const { siteUpdateId } = payload;

    await siteUpdateModel.update(
      { isDeleted: true },
      { where: { id: siteUpdateId } }
    );

    return Object.assign(
      HELPERS.responseHelper.createSuccessResponse(
        MESSAGES.SITE_UPDATE_DELETED_SUCCESSFULLY
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

module.exports = siteUpdateController;
