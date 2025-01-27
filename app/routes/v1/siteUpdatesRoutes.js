"use strict";
const { Joi } = require("../../utils/joiUtils");
const siteUpdateController = require("../../controllers/siteUpdateController");

let routes = [
  {
    method: "POST",
    path: "/v1/siteUpdate/create",
    joiSchemaForSwagger: {
      formData: {
        file: {
          type: "file",
          required: true,
          description: "Document file to upload",
        },
        userId: Joi.number().required().description("Enter user id"),
        name: Joi.string().required().description("Enter update name"),
        description: Joi.string().description("Enter update description"),
        author: Joi.string().description("Enter author name"),
      },
      group: "SiteUpdate",
      description: "Route to create update",
      model: "createSiteUpdate",
    },
    auth: false,
    handler: siteUpdateController.createSiteUpdate,
  },
  {
    method: "PUT",
    path: "/v1/siteUpdate/update",
    joiSchemaForSwagger: {
      body: {
        siteUpdateId: Joi.number().required().description("Site Update ID"),
        name: Joi.string().description("Enter update name"),
        description: Joi.string().description("Enter update description"),
        author: Joi.string().description("Enter author name"),
      },
      group: "SiteUpdate",
      description: "Route to update site update",
      model: "updateSiteUpdate",
    },
    auth: false,
    handler: siteUpdateController.updateSiteUpdate,
  },
  {
    method: "POST",
    path: "/v1/siteUpdate/list",
    joiSchemaForSwagger: {
      body: {
        userId: Joi.number().required().description("Enter user id"),
        startDate: Joi.date().description("Start Date"),
        endDate: Joi.date().description("End Date"),
        page: Joi.number().description('page like 1,2'),
        size: Joi.number().description('size like 10,20')
      },
      group: "SiteUpdate",
      description: "Route to list site update",
      model: "getSiteUpdateList",
    },
    auth: false,
    handler: siteUpdateController.getSiteUpdateList,
  },
  {
    method: "DELETE",
    path: "/v1/siteUpdate",
    joiSchemaForSwagger: {
      body: {
        siteUpdateId: Joi.number().required().description("Site update ID"),
      },
      group: "SiteUpdate",
      description: "Route to delete site update",
      model: "deleteSiteUpdate",
    },
    auth: false,
    handler: siteUpdateController.deleteSiteUpdate,
  },
];

module.exports = routes;
