// "use strict";
const HELPERS = require("../helpers");
const { Op } = require("sequelize");
const { MESSAGES, ERROR_TYPES } = require("../utils/constants");

const siteUpdateModel = require("../models/siteUpdateModel");
const materialSelectedItemModel = require("../models/materialSelectedItemModel");
const materialItemModel = require("../models/materialItemModel");
const folderModel = require("../models/folderModel");
const folderDocumentModel = require("../models/folderDocumentModel");
const siteUpdateCommentModel = require("../models/siteUpdateCommentModel");
/**************************************************
 ***************** Latest Update controller ***************
 **************************************************/

let latestUpdateController = {};
/**
 * Function to get latest updates
 * @param {*} payload
 * @returns
 */
latestUpdateController.getLatestUpdate = async (payload) => {
    try {
        const { userId } = payload;
        let criteria = { isDeleted: { [Op.ne]: true } };
        if (userId) {
            criteria.userId = userId;
        }
        const [recentSiteUpdateResult, materialUpdateResult, folderDocumentResult] = await Promise.all([
            siteUpdateModel.findOne({
                where: criteria,
                order: [["updatedAt", "DESC"]],
                attributes: [
                    "id",
                    "name",
                    "images",
                    "description",
                    "author",
                    "createdAt",
                    "updatedAt",
                    "image",
                    "liked"
                ],
            }),
            materialSelectedItemModel.findOne({
                where: criteria,
                attributes: ["id", "selected"],
                include: [
                    {
                        model: materialItemModel,
                        attributes: ["name", "image", "description"],
                    },
                ],
                order: [["updatedAt", "DESC"]],
            }),
            folderModel.findOne({
                where: criteria,
                attributes: ['id', 'name'],
                order: [["updatedAt", "DESC"]],
                limit: 1,
                include: [{
                    model: folderDocumentModel,
                    attributes: ['id', 'url'],
                    order: [["updatedAt", "DESC"]],
                    limit: 1
                }],
            })
        ]);
        // Fetch comments for each site update
        const siteUpdatesWithComments = await siteUpdateCommentModel.findAll({
            where: {
                siteUpdateId: recentSiteUpdateResult.id,
                [Op.or]: [
                    { userId: userId },
                    { isAdminReply: true }
                ]
            },
            order: [["createdAt", "ASC"]]
        });

        const recentSiteUpdateResultWithComments = {
            ...recentSiteUpdateResult.toJSON(),
            commentList: siteUpdatesWithComments
        };
        const documentUpdateResponse = {
            id: folderDocumentResult?.id || null,
            folderName: folderDocumentResult?.name || null,
            documentUrl: folderDocumentResult?.folderDocuments[0]?.url || null
        }
        const response = {
            siteUpdate: recentSiteUpdateResultWithComments,
            materialUpdate: materialUpdateResult,
            documentUpdate: documentUpdateResponse
        };
        return Object.assign(
            HELPERS.responseHelper.createSuccessResponse(
                MESSAGES.PROJECT_LIST_SUCCESSFULLY
            ),
            { data: response }
        );
    } catch (error) {
        console.log(error, "errro")
        throw HELPERS.responseHelper.createErrorResponse(
            error.msg,
            ERROR_TYPES.SOMETHING_WENT_WRONG
        );
    }
};

/* export latestUpdateController */
module.exports = latestUpdateController;
