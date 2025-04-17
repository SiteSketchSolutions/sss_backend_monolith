const HELPERS = require("../helpers");
const { Op } = require("sequelize");
const { MESSAGES, ERROR_TYPES, PAGINATION } = require("../utils/constants");
const siteUpdateModel = require("../models/siteUpdateModel");
const { getPaginationResponse } = require("../utils/utils")
const siteUpdateCommentModel = require("../models/siteUpdateCommentModel");

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
    const { name, description, author, userId, urls } = payload;
    const siteUpdatePayload = {
      name,
      description,
      userId: userId,
      author: author
    };
    if (urls && Array.isArray(urls)) {
      siteUpdatePayload.images = urls;
      siteUpdatePayload.image = urls[0];
    } else if (urls) {
      // Handle backward compatibility if a single URL is sent
      siteUpdatePayload.images = [urls];
      siteUpdatePayload.image = urls;
    } else {
      siteUpdatePayload.images = [];
      siteUpdatePayload.image = "";
    }
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
    const { name, description, author, siteUpdateId, urls } = payload;

    let updatePayload = {
      name,
      description,
      author
    };
    if (urls && Array.isArray(urls)) {
      updatePayload.images = urls;
      updatePayload.image = urls[0];
    } else if (urls) {
      // Handle backward compatibility if a single URL is sent
      updatePayload.images = [urls];
      updatePayload.image = urls;
    } else {
      updatePayload.images = [];
      updatePayload.image = "";
    }
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
 * Function to toggle like status for a site update
 * @param {*} payload
 * @returns
 */
siteUpdateController.toggleLike = async (payload) => {
  try {
    const { siteUpdateId } = payload;

    // Check if site update exists and belongs to the user
    const siteUpdate = await siteUpdateModel.findOne({
      where: {
        id: siteUpdateId,
        isDeleted: { [Op.ne]: true }
      }
    });

    if (!siteUpdate) {
      return HELPERS.responseHelper.createErrorResponse(
        "Site update not found or you don't have access",
        ERROR_TYPES.DATA_NOT_FOUND
      );
    }

    // Toggle the like status
    const newLikeStatus = !siteUpdate.liked;

    await siteUpdateModel.update(
      { liked: newLikeStatus },
      { where: { id: siteUpdateId } }
    );

    return Object.assign(
      HELPERS.responseHelper.createSuccessResponse(
        newLikeStatus ? "Site update liked successfully" : "Site update unliked successfully"
      ),
      { data: { liked: newLikeStatus } }
    );
  } catch (error) {
    throw HELPERS.responseHelper.createErrorResponse(
      error.msg || "Something went wrong",
      ERROR_TYPES.SOMETHING_WENT_WRONG
    );
  }
};

/**
 * Function for user to add a comment to a site update
 * @param {*} payload
 * @returns
 */
siteUpdateController.addUserComment = async (payload) => {
  try {
    const { siteUpdateId, userId, message } = payload;

    // Check if site update exists
    const siteUpdate = await siteUpdateModel.findOne({
      where: {
        id: siteUpdateId,
        isDeleted: { [Op.ne]: true }
      }
    });

    if (!siteUpdate) {
      return HELPERS.responseHelper.createErrorResponse(
        "Site update not found",
        ERROR_TYPES.DATA_NOT_FOUND
      );
    }

    // Create the comment
    const comment = await siteUpdateCommentModel.create({
      siteUpdateId,
      userId,
      message,
      isAdminReply: false
    });

    return Object.assign(
      HELPERS.responseHelper.createSuccessResponse(
        "Comment added successfully"
      ),
      { data: { commentId: comment.id } }
    );
  } catch (error) {
    throw HELPERS.responseHelper.createErrorResponse(
      error.msg || "Something went wrong",
      ERROR_TYPES.SOMETHING_WENT_WRONG
    );
  }
};

/**
 * Function for admin to reply to a comment
 * @param {*} payload
 * @returns
 */
siteUpdateController.addAdminReply = async (payload) => {
  try {
    const { siteUpdateId, adminId, message } = payload;

    // Check if site update exists
    const siteUpdate = await siteUpdateModel.findOne({
      where: {
        id: siteUpdateId,
        isDeleted: { [Op.ne]: true }
      }
    });

    if (!siteUpdate) {
      return HELPERS.responseHelper.createErrorResponse(
        "Site update not found",
        ERROR_TYPES.DATA_NOT_FOUND
      );
    }

    // Create the admin reply
    const comment = await siteUpdateCommentModel.create({
      siteUpdateId,
      adminId,
      message,
      isAdminReply: true
    });

    return Object.assign(
      HELPERS.responseHelper.createSuccessResponse(
        "Reply added successfully"
      ),
      { data: { commentId: comment.id } }
    );
  } catch (error) {
    throw HELPERS.responseHelper.createErrorResponse(
      error.msg || "Something went wrong",
      ERROR_TYPES.SOMETHING_WENT_WRONG
    );
  }
};

/**
 * Function to get comments for a site update
 * @param {*} payload
 * @returns
 */
siteUpdateController.getComments = async (payload) => {
  try {
    const { siteUpdateId, userId, page, size } = payload;
    const pageNo = page || PAGINATION.DEFAULT_PAGE;
    const pageLimit = size || PAGINATION.DEFAULT_PAGE_LIMIT;

    // Check if site update exists
    const siteUpdate = await siteUpdateModel.findOne({
      where: {
        id: siteUpdateId,
        isDeleted: { [Op.ne]: true }
      }
    });

    if (!siteUpdate) {
      return HELPERS.responseHelper.createErrorResponse(
        "Site update not found",
        ERROR_TYPES.DATA_NOT_FOUND
      );
    }

    // Get comments for this update and user (conversation between user and admin)
    const { count, rows } = await siteUpdateCommentModel.findAndCountAll({
      where: {
        siteUpdateId,
        [Op.or]: [
          { userId: userId },
          { isAdminReply: true }
        ],
        isDeleted: { [Op.ne]: true }
      },
      order: [["createdAt", "ASC"]],
      limit: pageLimit,
      offset: (pageNo - 1) * pageLimit
    });

    const paginationData = { count, pageNo, pageLimit, rows };
    const formattedResponse = getPaginationResponse(paginationData);

    return Object.assign(
      HELPERS.responseHelper.createSuccessResponse(
        "Comments fetched successfully"
      ),
      formattedResponse
    );
  } catch (error) {
    throw HELPERS.responseHelper.createErrorResponse(
      error.msg || "Something went wrong",
      ERROR_TYPES.SOMETHING_WENT_WRONG
    );
  }
};

/**
 * Function for admin to view all user comments
 * @param {*} payload
 * @returns
 */
siteUpdateController.getAllCommentsForAdmin = async (payload) => {
  try {
    const { siteUpdateId, page, size } = payload;
    const pageNo = page || PAGINATION.DEFAULT_PAGE;
    const pageLimit = size || PAGINATION.DEFAULT_PAGE_LIMIT;

    // Check if site update exists
    const siteUpdate = await siteUpdateModel.findOne({
      where: {
        id: siteUpdateId,
        isDeleted: { [Op.ne]: true }
      }
    });

    if (!siteUpdate) {
      return HELPERS.responseHelper.createErrorResponse(
        "Site update not found",
        ERROR_TYPES.DATA_NOT_FOUND
      );
    }

    // Get all comments for this update
    const { count, rows } = await siteUpdateCommentModel.findAndCountAll({
      where: {
        siteUpdateId, isDeleted: { [Op.ne]: true }
      },
      order: [["createdAt", "ASC"]],
      limit: pageLimit,
      offset: (pageNo - 1) * pageLimit
    });

    const paginationData = { count, pageNo, pageLimit, rows };
    const formattedResponse = getPaginationResponse(paginationData);

    return Object.assign(
      HELPERS.responseHelper.createSuccessResponse(
        "Comments fetched successfully"
      ),
      formattedResponse
    );
  } catch (error) {
    throw HELPERS.responseHelper.createErrorResponse(
      error.msg || "Something went wrong",
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
    const pageNo = page || PAGINATION.DEFAULT_PAGE;
    const pageLimit = size || PAGINATION.DEFAULT_PAGE_LIMIT;

    let criteria = {
      isDeleted: { [Op.ne]: true },
      userId: userId
    };

    if (startDate && endDate) {
      criteria.createdAt = { [Op.between]: [startDate, endDate] };
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
        "images",
        "author",
        "createdAt",
        "updatedAt",
        "image",
        "liked"
      ],
    });

    // Fetch comments for each site update
    const siteUpdatesWithComments = await Promise.all(
      rows.map(async (siteUpdate) => {
        const comments = await siteUpdateCommentModel.findAll({
          where: {
            siteUpdateId: siteUpdate.id,
            [Op.or]: [
              { userId: userId },
              { isAdminReply: true }
            ],
            isDeleted: { [Op.ne]: true }
          },
          order: [["createdAt", "ASC"]]
        });

        const siteUpdateData = siteUpdate.toJSON();
        return {
          ...siteUpdateData,
          commentList: comments
        };
      })
    );

    const paginationData = {
      count,
      pageNo,
      pageLimit,
      rows: siteUpdatesWithComments
    };

    const formattedResponse = getPaginationResponse(paginationData);

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

/**
 * Function to delete a comment
 * @param {*} payload
 * @returns
 */
siteUpdateController.deleteComment = async (payload) => {
  try {
    const { commentId } = payload;

    // Check if comment exists
    const comment = await siteUpdateCommentModel.findOne({
      where: { id: commentId, isDeleted: { [Op.ne]: true } }
    });

    if (!comment) {
      return HELPERS.responseHelper.createErrorResponse(
        "Comment not found",
        ERROR_TYPES.DATA_NOT_FOUND
      );
    }

    // Delete the comment
    await siteUpdateCommentModel.update({
      isDeleted: true
    }, {
      where: { id: commentId }
    });

    return Object.assign(
      HELPERS.responseHelper.createSuccessResponse(
        "Comment deleted successfully"
      ),
      { data: null }
    );
  } catch (error) {
    console.log(error, "error===>")
    throw HELPERS.responseHelper.createErrorResponse(
      error.msg || "Something went wrong",
      ERROR_TYPES.SOMETHING_WENT_WRONG
    );
  }
};

module.exports = siteUpdateController;
