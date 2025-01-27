// "use strict";
const HELPERS = require("../helpers");
const { Op } = require("sequelize");
const { MESSAGES, ERROR_TYPES } = require("../utils/constants");

const siteUpdateModel = require("../models/siteUpdateModel");
const materialSelectedItemModel = require("../models/materialSelectedItemModel");
const materialItemModel = require("../models/materialItemModel");
const folderModel = require("../models/folderModel");
const folderDocumentModel = require("../models/folderDocumentModel");

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
                where: { userId: userId },
                order: [["id", "DESC"]],
                attributes: [
                    "id",
                    "name",
                    "image",
                    "description",
                    "author",
                    "createdAt",
                    "updatedAt",
                ],
            }),
            materialSelectedItemModel.findOne({
                where: { userId: userId },
                attributes: ["id", "selected"],
                include: [
                    {
                        model: materialItemModel,
                        attributes: ["name", "image", "description"],
                    },
                ],
                order: [["id", "DESC"]],
            }),
            folderModel.findOne({
                where: { userId: userId },
                attributes: ['id', 'name'],
                order: [["id", "DESC"]],
                limit: 1,
                include: [{
                    model: folderDocumentModel,
                    attributes: ['id', 'url'],
                    order: [["id", "DESC"]],
                    limit: 1
                }],
            })
        ]);
        const documentUpdateResponse = {
            id: folderDocumentResult?.id,
            folderName: folderDocumentResult?.name,
            documentUrl: folderDocumentResult?.folderDocuments[0]?.url
        }
        const response = {
            siteUpdate: recentSiteUpdateResult,
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
