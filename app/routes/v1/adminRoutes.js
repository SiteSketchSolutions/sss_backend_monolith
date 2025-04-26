"use strict";

const { Joi } = require("../../utils/joiUtils");
const { AVAILABLE_AUTHS, GENDER_TYPES, ADMIN_ROLES } = require("../../utils/constants");
const adminController = require("../../controllers/adminController");

let routes = [
  {
    method: "POST",
    path: "/v1/admin",
    joiSchemaForSwagger: {
      headers: {
        authorization: Joi.string().required().description("User's JWT token."),
      },
      body: {
        firstName: Joi.string().description("first name"),
        lastName: Joi.string().description("user Last name"),
        email: Joi.string().description("Email"),
        password: Joi.string().description("Password"),
        mobileNumber: Joi.string().required().description("Mobile Number"),
        role: Joi.string().valid(ADMIN_ROLES.SUPER_ADMIN, ADMIN_ROLES.SITE_ENGINEER).default(ADMIN_ROLES.SITE_ENGINEER).description("Admin role"),
      },
      group: "Admin",
      description: "Route to register a Admin",
      model: "RegisterAdmin",
    },
    auth: AVAILABLE_AUTHS.ADMIN,
    handler: adminController.create,
  },

  {
    method: "GET",
    path: "/v1/admin",
    joiSchemaForSwagger: {
      headers: {
        authorization: Joi.string().required().description("User's JWT token."),
      },
      query: {
        userId: Joi.number().description("User id"),
      },
      group: "Admin",
      description: "Route to get admin details by Id",
      model: "getAdminDetailsById",
    },
    auth: AVAILABLE_AUTHS.ADMIN,
    handler: adminController.getById,
  },

  {
    method: "GET",
    path: "/v1/admin/list",
    joiSchemaForSwagger: {
      headers: {
        authorization: Joi.string().required().description("User's JWT token."),
      },
      query: {
        role: Joi.string().valid(ADMIN_ROLES.SUPER_ADMIN, ADMIN_ROLES.SITE_ENGINEER).description("Filter by admin role"),
      },
      group: "Admin",
      description: "Route to list all admins (only available to super admins)",
      model: "listAdmins",
    },
    auth: AVAILABLE_AUTHS.ADMIN,
    handler: adminController.listAdmins,
  },

  {
    method: "PUT",
    path: "/v1/admin/update",
    joiSchemaForSwagger: {
      headers: {
        authorization: Joi.string().required().description("User's JWT token."),
      },
      body: {
        userId: Joi.number().required().description("User id to update"),
        firstName: Joi.string().description("first name"),
        lastName: Joi.string().description("user Last name"),
        email: Joi.string().description("Email"),
        password: Joi.string().description("Password"),
        mobileNumber: Joi.string().description("Mobile Number"),
        role: Joi.string().valid(ADMIN_ROLES.SUPER_ADMIN, ADMIN_ROLES.SITE_ENGINEER).description("Admin role"),
        status: Joi.string().description("Account status"),
        deviceToken: Joi.string()
          .description("Enter user device token"),
      },
      group: "Admin",
      description: "Route to update admin details",
      model: "updateAdmin",
    },
    auth: AVAILABLE_AUTHS.ADMIN,
    handler: adminController.update,
  },

  {
    method: "POST",
    path: "/v1/admin/send-notification",
    joiSchemaForSwagger: {
      headers: {
        authorization: Joi.string().required().description("Admin's JWT token."),
      },
      body: {
        userId: Joi.number().description("User ID to send notification (not required if isBulkSend is true)"),
        messageTitle: Joi.string().required().description("Notification title"),
        messageBody: Joi.string().required().description("Notification body/subtitle"),
        route: Joi.string().default("/").description("Destination route in app"),
        queryParams: Joi.object().description("Query parameters for the route"),
        isBulkSend: Joi.boolean().default(false).description("Flag for bulk sending to multiple users")
        // channelType: Joi.string().required().description("Notification channel type")
      },
      group: "Admin",
      description: "Route for admin to send custom notifications to users",
      model: "sendNotification",
    },
    auth: AVAILABLE_AUTHS.ADMIN,
    handler: adminController.sendNotification,
  },
];

module.exports = routes;
