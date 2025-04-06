"use strict";
const { Joi } = require("../../utils/joiUtils");
const pdfCatalogController = require("../../controllers/pdfCatalogController");

let routes = [
    {
        method: "POST",
        path: "/v1/pdfCatalog/create",
        joiSchemaForSwagger: {
            body: {
                userId: Joi.number().required().description("Enter user id"),
                name: Joi.string().required().description("Enter PDF catalog name"),
                description: Joi.string().description("Enter PDF catalog description"),
                fileUrl: Joi.string().required().description("Enter PDF file URL"),
                fileSize: Joi.number().required().description("Enter file size in bytes"),
            },
            group: "PdfCatalog",
            description: "Route to create PDF catalog",
            model: "createPdfCatalog",
        },
        auth: false,
        handler: pdfCatalogController.createPdfCatalog,
    },
    {
        method: "PUT",
        path: "/v1/pdfCatalog/update",
        joiSchemaForSwagger: {
            body: {
                pdfCatalogId: Joi.number().required().description("PDF Catalog ID"),
                name: Joi.string().description("Enter PDF catalog name"),
                description: Joi.string().description("Enter PDF catalog description"),
                fileUrl: Joi.string().description("Enter PDF file URL"),
                fileSize: Joi.number().description("Enter file size in bytes"),
            },
            group: "PdfCatalog",
            description: "Route to update PDF catalog",
            model: "updatePdfCatalog",
        },
        auth: false,
        handler: pdfCatalogController.updatePdfCatalog,
    },
    {
        method: "POST",
        path: "/v1/pdfCatalog/list",
        joiSchemaForSwagger: {
            body: {
                userId: Joi.number().required().description("Enter user id"),
                startDate: Joi.date().description("Start Date"),
                endDate: Joi.date().description("End Date"),
                page: Joi.number().description('page like 1,2'),
                size: Joi.number().description('size like 10,20')
            },
            group: "PdfCatalog",
            description: "Route to list PDF catalogs",
            model: "getPdfCatalogList",
        },
        auth: false,
        handler: pdfCatalogController.getPdfCatalogList,
    },
    {
        method: "DELETE",
        path: "/v1/pdfCatalog",
        joiSchemaForSwagger: {
            body: {
                pdfCatalogId: Joi.number().required().description("PDF catalog ID"),
            },
            group: "PdfCatalog",
            description: "Route to delete PDF catalog",
            model: "deletePdfCatalog",
        },
        auth: false,
        handler: pdfCatalogController.deletePdfCatalog,
    },
];

module.exports = routes;