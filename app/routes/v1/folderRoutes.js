"use strict";
const { Joi } = require("../../utils/joiUtils");
const folderController = require("../../controllers/folderController");

let routes = [
  {
    method: "POST",
    path: "/v1/folder/create",
    joiSchemaForSwagger: {
      body: {
        userId: Joi.number().required().description("Enter user id"),
        name: Joi.string().required().description("Enter name of folder"),
      },
      group: "Folder",
      description: "Route to create folder",
      model: "createFolder",
    },
    auth: false,
    handler: folderController.createFolder,
  },
  {
    method: "PUT",
    path: "/v1/folder/update",
    joiSchemaForSwagger: {
      body: {
        folderId: Joi.number().required().description("Folder ID"),
        name: Joi.string().description("Enter name of folder"),
      },
      group: "Folder",
      description: "Route to update folder",
      model: "updateFolder",
    },
    auth: false,
    handler: folderController.updateFolder,
  },
  {
    method: "GET",
    path: "/v1/folder/list",
    joiSchemaForSwagger: {
      query: {
        userId: Joi.number().required().description("Enter user id"),
      },
      group: "Folder",
      description: "Route to list folders",
      model: "folderList",
    },
    auth: false,
    handler: folderController.getFolderList,
  },
  {
    method: "DELETE",
    path: "/v1/folder",
    joiSchemaForSwagger: {
      body: {
        folderId: Joi.number().required().description("Folder ID"),
      },
      group: "Folder",
      description: "Route to delete folder",
      model: "deleteFolder",
    },
    auth: false,
    handler: folderController.deleteFolder,
  },
];

module.exports = routes;
