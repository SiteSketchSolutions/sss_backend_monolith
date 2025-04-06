const HELPERS = require("../helpers");
const { Op } = require("sequelize");
const { MESSAGES, ERROR_TYPES, PAGINATION } = require("../utils/constants");
const pdfCatalogModel = require("../models/pdfCatalogModel");
const { getPaginationResponse } = require("../utils/utils");

/**************************************************
 ***************** PDF Catalog Controller ***************
 **************************************************/
let pdfCatalogController = {};

/**
 * Function to create PDF catalog
 * @param {*} payload
 * @returns
 */
pdfCatalogController.createPdfCatalog = async (payload) => {
    try {
        const { name, description, fileUrl, fileSize } = payload;
        const pdfCatalogPayload = {
            name,
            description,
            fileUrl,
            fileSize
        };

        const pdfCatalog = await pdfCatalogModel.create(pdfCatalogPayload);
        const response = {
            id: pdfCatalog?.id,
        };
        return Object.assign(
            HELPERS.responseHelper.createSuccessResponse(
                MESSAGES.PDF_CATALOG_CREATED_SUCCESSFULLY
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
 * Function to update PDF catalog
 * @param {*} payload
 * @returns
 */
pdfCatalogController.updatePdfCatalog = async (payload) => {
    try {
        const { name, description, fileUrl, fileSize, pdfCatalogId } = payload;

        let updatePayload = {
            name,
            description
        };

        if (fileUrl) {
            updatePayload.fileUrl = fileUrl;
        }

        if (fileSize) {
            updatePayload.fileSize = fileSize;
        }

        await pdfCatalogModel.update(updatePayload, {
            where: { id: pdfCatalogId, isDeleted: { [Op.ne]: true } },
        });

        return Object.assign(
            HELPERS.responseHelper.createSuccessResponse(
                MESSAGES.PDF_CATALOG_UPDATED_SUCCESSFULLY
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
 * Function to list PDF catalogs
 * @param {*} payload
 * @returns
 */
pdfCatalogController.getPdfCatalogList = async (payload) => {
    try {
        const { size, page, startDate, endDate } = payload;
        const pageNo = page || PAGINATION.DEFAULT_PAGE
        const pageLimit = size || PAGINATION.DEFAULT_PAGE_LIMIT
        let criteria = {
            isDeleted: { [Op.ne]: true },
        }
        if (startDate && endDate) {
            criteria.createdAt = { [Op.between]: [startDate, endDate] }
        }
        const { count, rows } = await pdfCatalogModel.findAndCountAll({
            where: criteria,
            order: [["id", "DESC"]],
            limit: pageLimit,
            offset: (pageNo - 1) * pageLimit,
            attributes: [
                "id",
                "name",
                "description",
                "fileUrl",
                "fileSize",
                "createdAt",
                "updatedAt",
            ],
        });

        const paginationData = { count, pageNo, pageLimit, rows }
        const formattedResponse = getPaginationResponse(paginationData)
        return Object.assign(
            HELPERS.responseHelper.createSuccessResponse(
                MESSAGES.PDF_CATALOG_LIST_SUCCESSFULLY
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

/**
 * Function to delete PDF catalog
 * @param {*} payload
 * @returns
 */
pdfCatalogController.deletePdfCatalog = async (payload) => {
    try {
        const { pdfCatalogId } = payload;

        await pdfCatalogModel.update(
            { isDeleted: true },
            { where: { id: pdfCatalogId } }
        );

        return Object.assign(
            HELPERS.responseHelper.createSuccessResponse(
                MESSAGES.PDF_CATALOG_DELETED_SUCCESSFULLY
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

module.exports = pdfCatalogController;