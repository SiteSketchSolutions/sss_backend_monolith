"use strict";
const { Joi } = require("../../utils/joiUtils");
const materialItemSelectController = require("../../controllers/materialItemSelectController");

let routes = [
  {
    method: "POST",
    path: "/v1/materialSelectedItem/create",
    joiSchemaForSwagger: {
      body: {
        materialItemId: Joi.number()
          .required()
          .description("Enter material item id"),
        userId: Joi.number().required().description("Enter user id"),
      },
      group: "MaterialSelectedItem",
      description: "Route to mark material Item as selected",
      model: "createMaterialSelectedItem",
    },
    auth: false,
    handler: materialItemSelectController.createMaterialSelectedItem,
  },
  {
    method: "PUT",
    path: "/v1/materialSelectedItem/update",
    joiSchemaForSwagger: {
      body: {
        materialSelectedItemId: Joi.number()
          .required()
          .description("Material Selected Item ID"),
        selected: Joi.boolean()
          .required()
          .description("Enter selected true or false"),
      },
      group: "MaterialSelectedItem",
      description: "Route to update material item as selected or unselect",
      model: "updateMaterialSelectedItem",
    },
    auth: false,
    handler: materialItemSelectController.updateMaterialSelectedItem,
  },
  {
    method: "GET",
    path: "/v1/materialSelectedItem/list",
    joiSchemaForSwagger: {
      query: {
        userId: Joi.number().required().description("Enter user id"),
        materialCategoryId: Joi.number()
          .required()
          .description("Enter material category id"),
      },
      group: "MaterialSelectedItem",
      description: "Route to list material selected items",
      model: "materialSelectedItemList",
    },
    auth: false,
    handler: materialItemSelectController.materialSelectedItemList,
  },
];

module.exports = routes;
