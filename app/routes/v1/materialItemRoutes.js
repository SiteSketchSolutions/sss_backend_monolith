"use strict";
const { Joi } = require("../../utils/joiUtils");
const materialItemController = require("../../controllers/materialItemController");

let routes = [
  {
    method: "POST",
    path: "/v1/materialItem/create",
    joiSchemaForSwagger: {
      body: {
        materialCategoryId: Joi.number()
          .required()
          .description("Enter material category id"),
        name: Joi.string().required().description("Enter item name"),
        description: Joi.string().description("Enter item description"),
        url: Joi.string().required().description("Enter category doc url"),
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
        url: Joi.string().description("Enter category doc url"),
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
          .description("Enter material category id (optional for cross-category search)"),
        search: Joi.string()
          .description("Search materials by name (optional)"),
      },
      group: "MaterialItem",
      description: "Route to list material items. Can filter by category ID and/or search by name.",
      model: "materialItemList",
    },
    auth: false,
    handler: materialItemController.materialItemList,
  },
  {
    method: "POST",
    path: "/v1/materialItem/search",
    joiSchemaForSwagger: {
      body: {
        search: Joi.string().description("Search term for material item name"),
        page: Joi.number().description("Page number for pagination (default: 1)"),
        limit: Joi.number().description("Number of items per page (default: 10)"),
      },
      group: "MaterialItem",
      description: "Advanced search route for material items with pagination. Searches across all categories.",
      model: "searchMaterialItems",
    },
    auth: false,
    handler: materialItemController.searchMaterialItems,
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
