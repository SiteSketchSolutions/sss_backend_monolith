"use strict";
const { Joi } = require("../../utils/joiUtils");
const documentController = require("../../controllers/documentController");

let routes = [
  {
    method: "POST",
    path: "/v1/document/upload",
    joiSchemaForSwagger: {
      formData: {
        file: {
          type: "file",
          required: true,
          description: "Document file to upload",
        },
      },
      group: "Document",
      description: "Route to upload document",
      model: "uploadDocument",
    },
    auth: false,
    handler: documentController.uploadDocument,
  },
  {
    method: "GET",
    path: "/v1/document",
    joiSchemaForSwagger: {
      query: {
        filename: Joi.string().required().description("Filename to retrieve"),
      },
      group: "Document",
      description: "Route to get uploaded document",
      model: "getDocument",
    },
    auth: false,
    handler: documentController.getDocument,
  },
];

module.exports = routes;
