"use strict";
const { Joi } = require("../../utils/joiUtils");
const siteUpdateController = require("../../controllers/siteUpdateController");

let routes = [
  {
    method: "POST",
    path: "/v1/siteUpdate/create",
    joiSchemaForSwagger: {
      body: {
        userId: Joi.number().required().description("Enter user id"),
        name: Joi.string().required().description("Enter update name"),
        description: Joi.string().allow('').description("Enter update description"),
        author: Joi.string().description("Enter author name"),
        urls: Joi.array().items(Joi.string()).required().description("Array of image URLs"),
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
        description: Joi.string().allow('').description("Enter update description"),
        author: Joi.string().description("Enter author name"),
        urls: Joi.array().items(Joi.string()).description("Array of image URLs"),
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

  // Like toggle route
  {
    method: "POST",
    path: "/v1/siteUpdate/toggleLike",
    joiSchemaForSwagger: {
      body: {
        siteUpdateId: Joi.number().required().description("ID of the site update")
      },
      group: "SiteUpdate",
      description: "Route to toggle like status for a site update",
      model: "toggleLike",
    },
    auth: false,
    handler: siteUpdateController.toggleLike,
  },

  // User comment route
  {
    method: "POST",
    path: "/v1/siteUpdate/userComment",
    joiSchemaForSwagger: {
      body: {
        siteUpdateId: Joi.number().required().description("ID of the site update"),
        userId: Joi.number().required().description("User ID"),
        message: Joi.string().required().description("Comment message")
      },
      group: "SiteUpdate",
      description: "Route for a user to add a comment",
      model: "addUserComment",
    },
    auth: false,
    handler: siteUpdateController.addUserComment,
  },

  // Admin reply route
  {
    method: "POST",
    path: "/v1/siteUpdate/adminReply",
    joiSchemaForSwagger: {
      body: {
        siteUpdateId: Joi.number().required().description("ID of the site update"),
        adminId: Joi.number().required().description("Admin ID"),
        message: Joi.string().required().description("Reply message")
      },
      group: "SiteUpdate",
      description: "Route for an admin to reply to comments",
      model: "addAdminReply",
    },
    auth: false,
    handler: siteUpdateController.addAdminReply,
  },

  // Get comments route for users
  {
    method: "GET",
    path: "/v1/siteUpdate/comments",
    joiSchemaForSwagger: {
      query: {
        siteUpdateId: Joi.number().required().description("ID of the site update"),
        userId: Joi.number().required().description("User ID"),
        page: Joi.number().description("Page number"),
        size: Joi.number().description("Page size")
      },
      group: "SiteUpdate",
      description: "Route to get comments for a site update (user view)",
      model: "getComments",
    },
    auth: false,
    handler: siteUpdateController.getComments,
  },

  // Get all comments route for admin
  {
    method: "GET",
    path: "/v1/siteUpdate/allComments",
    joiSchemaForSwagger: {
      query: {
        siteUpdateId: Joi.number().required().description("ID of the site update"),
        page: Joi.number().description("Page number"),
        size: Joi.number().description("Page size")
      },
      group: "SiteUpdate",
      description: "Route to get all comments for a site update (admin view)",
      model: "getAllCommentsForAdmin",
    },
    auth: false,
    handler: siteUpdateController.getAllCommentsForAdmin,
  }
];

module.exports = routes;
