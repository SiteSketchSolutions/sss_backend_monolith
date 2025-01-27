"use strict";

const { Joi } = require("../../utils/joiUtils");
const { AVAILABLE_AUTHS, GENDER_TYPES } = require("../../utils/constants");
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
];

module.exports = routes;
