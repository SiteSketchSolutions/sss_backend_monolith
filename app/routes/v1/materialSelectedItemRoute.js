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
          .description("Material Selected Item ID (use this if selectionId is not null)"),
        materialItemId: Joi.number()
          .description("Material Item ID (use this if selectionId is null, must be used with userId)"),
        userId: Joi.number()
          .description("User ID (use this if selectionId is null, must be used with materialItemId)"),
        selected: Joi.boolean()
          .required()
          .description("Enter selected true or false"),
      },
      group: "MaterialSelectedItem",
      description: "Route to update material item as selected or unselect. For items where selectionId is null in the list response, use materialItemId and userId instead of materialSelectedItemId.",
      model: "updateMaterialSelectedItem",
    },
    auth: false,
    handler: materialItemSelectController.updateMaterialSelectedItem,
  },
  {
    method: "PUT",
    path: "/v1/materialSelectedItem/approval",
    joiSchemaForSwagger: {
      body: {
        materialSelectedItemId: Joi.number()
          .required()
          .description("Material Selected Item ID that needs to be approved or rejected"),
        approvalStatus: Joi.string()
          .required()
          .valid("approved", "rejected")
          .description("Approval status - must be either 'approved' or 'rejected'"),
        approvalNote: Joi.string()
          .description("Optional note about the approval or rejection reason"),
      },
      group: "MaterialSelectedItem",
      description: "Route to approve or reject a selected material item by client. Each item can only be approved/rejected once.",
      model: "materialItemApproval",
    },
    auth: false,
    handler: materialItemSelectController.updateMaterialItemApproval,
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
