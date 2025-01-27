"use strict";

const { Joi } = require("../../utils/joiUtils");
const { USER_TYPES, AVAILABLE_AUTHS } = require("../../utils/constants");
//load controllers
const authController = require("../../controllers/authController");

let routes = [
  {
    method: "GET",
    path: "/v1/serverResponse/",
    joiSchemaForSwagger: {
      group: "Test",
      description:
        "Route to get server response (Is server working fine or not?).",
      model: "SERVER",
    },
    handler: authController.getServerResponse,
  },
  {
    method: "GET",
    path: "/v1/auth/test",
    joiSchemaForSwagger: {
      headers: {
        authorization: Joi.string().required().description("User's JWT token."),
      },
      group: "Test",
      description: "Route to test user auth",
      model: "testAuth",
    },
    auth: [AVAILABLE_AUTHS.USER, AVAILABLE_AUTHS.ADMIN],
    handler: authController.authTest,
  },
  {
    method: "POST",
    path: "/v1/auth/user/login",
    joiSchemaForSwagger: {
      body: {
        phoneNumber: Joi.string()
          .required()
          .description("Enter client phone number"),
        password: Joi.string().required().description("User entered password"),
      },
      group: "Auth",
      description: "Route to client login",
      model: "userLogin",
    },
    auth: false,
    handler: authController.userLogin,
  },
  {
    method: "POST",
    path: "/v1/auth/admin/login",
    joiSchemaForSwagger: {
      body: {
        email: Joi.string().required().description("email id "),
        password: Joi.string().required().description("password"),
      },
      group: "Auth",
      description: "Route to admin Login",
      model: "adminLogin",
    },
    auth: false,
    handler: authController.adminLogin,
  },
];

module.exports = routes;
