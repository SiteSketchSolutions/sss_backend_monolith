"use strict";
const { Joi } = require("../../utils/joiUtils");
const folderDocumentController = require("../../controllers/folderDocumentController");

let routes = [
  {
    method: "POST",
    path: "/v1/folderDocument/upload",
    joiSchemaForSwagger: {
      formData: {
        file: {
          type: "file",
          required: true,
          description: "Document file to upload",
        },
        folderId: Joi.number().required().description("Enter folder id"),
      },
      group: "FolderDocument",
      description: "Route to upload document to folder",
      model: "uploadDocumentToFolder",
    },
    auth: false,
    handler: folderDocumentController.createFolderDocument,
  },
  {
    method: "PUT",
    path: "/v1/folderDocument/update",
    joiSchemaForSwagger: {
      formData: {
        file: {
          type: "file",
          required: true,
          description: "Document file to upload",
        },
        folderDocumentId: Joi.number()
          .required()
          .description("Folder Document ID"),
      },
      group: "FolderDocument",
      description: "Route to update folder document",
      model: "updateFolderDocument",
    },
    auth: false,
    handler: folderDocumentController.updateFolderDocument,
  },
  {
    method: "GET",
    path: "/v1/folderDocument/list",
    joiSchemaForSwagger: {
      query: {
        folderId: Joi.number().required().description("Enter folder id"),
      },
      group: "FolderDocument",
      description: "Route to list folder documents",
      model: "folderDocumentList",
    },
    auth: false,
    handler: folderDocumentController.getFolderDocumentList,
  },
  {
    method: "GET",
    path: "/v1/folderDocument",
    joiSchemaForSwagger: {
      query: {
        documentId: Joi.number().required().description("Enter document id"),
      },
      group: "FolderDocument",
      description: "Route to get document by id",
      model: "getDocumentById",
    },
    auth: false,
    handler: folderDocumentController.getDocumentById,
  },
  {
    method: "DELETE",
    path: "/v1/folderDocument",
    joiSchemaForSwagger: {
      body: {
        folderDocumentId: Joi.number()
          .required()
          .description("Folder document id"),
      },
      group: "FolderDocument",
      description: "Route to delete folder document",
      model: "deleteFolderDocument",
    },
    auth: false,
    handler: folderDocumentController.deleteFolderDocument,
  },
];

module.exports = routes;
