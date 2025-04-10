"use strict";
const { Joi } = require("../../utils/joiUtils");
//load controllers
const userController = require("../../controllers/userController");

let routes = [
    {
        method: "POST",
        path: "/v1/user/create",
        joiSchemaForSwagger: {
            body: {
                name: Joi.string().required()
                    .description("Enter user name"),
                email: Joi.string()
                    .description("Enter user email"),
                password: Joi.string().required()
                    .description("Enter user password"),
                phoneNumber: Joi.string().required()
                    .description("Enter user phone number")
            },
            group: "User",
            description: "Route to create user",
            model: "createUser",
        },
        auth: false,
        handler: userController.createUser,
    },
    {
        method: "PUT",
        path: "/v1/user/update",
        joiSchemaForSwagger: {
            body: {
                userId: Joi.number()
                    .required()
                    .description("Enter user id"), name: Joi.string()
                        .description("Enter user name"),
                email: Joi.string()
                    .description("Enter user email"),
                password: Joi.string()
                    .description("Enter user password"),
                phoneNumber: Joi.string()
                    .description("Enter user phone number"),
                status: Joi.string()
                    .description("Enter status"),
            },
            group: "User",
            description: "Route to update user",
            model: "updateUser",
        },
        auth: false,
        handler: userController.updateUser,
    },
    {
        method: "GET",
        path: "/v1/user/list",
        joiSchemaForSwagger: {
            query: {
                userId: Joi.number()
                    .description("Enter user id")
            },
            group: "User",
            description: "Route to list user",
            model: "userList",
        },
        auth: false,
        handler: userController.userList,
    },
    {
        method: "GET",
        path: "/v1/user",
        joiSchemaForSwagger: {
            query: {
                userId: Joi.number().required()
                    .description("Enter user id")
            },
            group: "User",
            description: "Route to get user details",
            model: "userDetails",
        },
        auth: false,
        handler: userController.getUserById,
    },
    {
        method: "DELETE",
        path: "/v1/user",
        joiSchemaForSwagger: {
            body: {
                userId: Joi.number().required()
                    .description("Enter user id to delete")
            },
            group: "User",
            description: "Route to delete user",
            model: "deleteUser",
        },
        auth: false,
        handler: userController.deleteUser,
    },
];

module.exports = routes;
