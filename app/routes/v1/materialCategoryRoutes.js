"use strict";
const { Joi } = require("../../utils/joiUtils");
const materialCategoryController = require("../../controllers/materialCategoryController");

let routes = [
  {
    method: "POST",
    path: "/v1/materialCategory/create",
    joiSchemaForSwagger: {
      body: {
        name: Joi.string().required().description("Enter stage name"),
        description: Joi.string().allow("").optional().description("Enter stage description"),
        url: Joi.string().required().description("Enter category doc url"),
        status: Joi.string().description("Enter stage status"),
      },
      group: "MaterialCategory",
      description: "Route to create material category",
      model: "createMaterialCategory",
    },
    auth: false,
    handler: materialCategoryController.createMaterialCategory,
  },
  {
    method: "PUT",
    path: "/v1/materialCategory/update",
    joiSchemaForSwagger: {
      body: {
        materialCategoryId: Joi.number()
          .required()
          .description("Material category ID"),
        name: Joi.string().optional().description("Enter stage name"),
        description: Joi.string().allow("").optional().description("Enter stage description"),
        url: Joi.string().optional().description("Enter category doc url"),
      },
      group: "MaterialCategory",
      description: "Route to update material category",
      model: "updateMaterialCategory",
    },
    auth: false,
    handler: materialCategoryController.updateMaterialCategory,
  },
  {
    method: "GET",
    path: "/v1/materialCategory/list",
    joiSchemaForSwagger: {
      group: "MaterialCategory",
      description: "Route to list material categories",
      model: "materialCategoryList",
    },
    auth: false,
    handler: materialCategoryController.materialCategoryList,
  },
  {
    method: "DELETE",
    path: "/v1/materialCategory",
    joiSchemaForSwagger: {
      body: {
        materialCategoryId: Joi.number()
          .required()
          .description("Material category ID"),
      },
      group: "MaterialCategory",
      description: "Route to delete material category",
      model: "deleteMaterialCategory",
    },
    auth: false,
    handler: materialCategoryController.deleteMaterialCategory,
  },
];

module.exports = routes;
