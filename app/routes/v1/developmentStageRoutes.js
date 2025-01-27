"use strict";
const { Joi } = require("../../utils/joiUtils");
const developmentStageController = require("../../controllers/developmentStageController");

let routes = [
  {
    method: "POST",
    path: "/v1/development-stage/create",
    joiSchemaForSwagger: {
      // body: {
      //   projectId: Joi.number().required().description("Enter project id"),
      //   name: Joi.string().required().description("Enter stage name"),
      //   description: Joi.string().description("Enter stage description"),
      //   image: Joi.string().description("Enter stage image"),
      //   order: Joi.number().required().description("Enter stage order number"),
      // },
      formData: {
        file: {
          type: "file",
          required: true,
          description: "Document file to upload",
        },
        projectId: Joi.number().required().description("Enter project id"),
        name: Joi.string().required().description("Enter stage name"),
        description: Joi.string().description("Enter stage description"),
        order: Joi.number().required().description("Enter stage order number"),
      },
      group: "DevelopmentStage",
      description: "Route to create development stage",
      model: "createDevelopmentStage",
    },
    auth: false,
    handler: developmentStageController.createDevelopmentStage,
  },
  {
    method: "PUT",
    path: "/v1/development-stage/update",
    joiSchemaForSwagger: {
      body: {
        stageId: Joi.number().required().description("Development stage ID"),
        name: Joi.string().description("Enter stage name"),
        description: Joi.string().description("Enter stage description"),
        image: Joi.string().description("Enter stage image"),
        order: Joi.number().description("Enter stage order number"),
      },
      group: "DevelopmentStage",
      description: "Route to update development stage",
      model: "updateDevelopmentStage",
    },
    auth: false,
    handler: developmentStageController.updateDevelopmentStage,
  },
  {
    method: "GET",
    path: "/v1/development-stage/list",
    joiSchemaForSwagger: {
      query: {
        projectId: Joi.number().required().description("Enter project id"),
      },
      group: "DevelopmentStage",
      description: "Route to list development stages",
      model: "developmentStageList",
    },
    auth: false,
    handler: developmentStageController.developmentStageList,
  },
  {
    method: "DELETE",
    path: "/v1/development-stage",
    joiSchemaForSwagger: {
      body: {
        stageId: Joi.number().required().description("Development stage ID"),
      },
      group: "DevelopmentStage",
      description: "Route to delete development stage",
      model: "deleteDevelopmentStage",
    },
    auth: false,
    handler: developmentStageController.deleteDevelopmentStage,
  },
];

module.exports = routes;
