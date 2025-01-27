"use strict";
const { Joi } = require("../../utils/joiUtils");
const materialItemController = require("../../controllers/materialItemController");

let routes = [
  {
    method: "POST",
    path: "/v1/materialItem/create",
    joiSchemaForSwagger: {
      formData: {
        file: {
          type: "file",
          required: true,
          description: "Document file to upload",
        },
        materialCategoryId: Joi.number()
          .required()
          .description("Enter material category id"),
        name: Joi.string().required().description("Enter item name"),
        description: Joi.string().description("Enter item description"),
      },
      group: "MaterialItem",
      description: "Route to create material Item",
      model: "createMaterialItem",
    },
    auth: false,
    handler: materialItemController.createMaterialItem,
  },
  {
    method: "PUT",
    path: "/v1/materialItem/update",
    joiSchemaForSwagger: {
      body: {
        materialItemId: Joi.number().required().description("Material Item ID"),
        name: Joi.string().description("Enter material Item name"),
        description: Joi.string().description(
          "Enter material category description"
        ),
      },
      formData: {
        file: {
          type: "file",
          description: "Document file to upload",
        },
        materialItemId: Joi.number()
          .required()
          .description("Enter material Item id"),
        name: Joi.string().required().description("Enter item name"),
        description: Joi.string().description("Enter item description"),
      },
      group: "MaterialItem",
      description: "Route to update material category",
      model: "updateMaterialCategory",
    },
    auth: false,
    handler: materialItemController.updateMaterialItem,
  },
  {
    method: "GET",
    path: "/v1/materialItem/list",
    joiSchemaForSwagger: {
      query: {
        materialCategoryId: Joi.number()
          .required()
          .description("Enter material category id"),
      },
      group: "MaterialItem",
      description: "Route to list material items",
      model: "materialItemList",
    },
    auth: false,
    handler: materialItemController.materialItemList,
  },
  {
    method: "DELETE",
    path: "/v1/materialItem",
    joiSchemaForSwagger: {
      body: {
        materialItemId: Joi.number().required().description("Material item ID"),
      },
      group: "MaterialItem",
      description: "Route to delete material item",
      model: "deleteMaterialItem",
    },
    auth: false,
    handler: materialItemController.deleteMaterialItem,
  },
];

module.exports = routes;
