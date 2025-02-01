"use strict";
const { Joi } = require("../../utils/joiUtils");
const { USER_TYPES, AVAILABLE_AUTHS } = require("../../utils/constants");
//load controllers
const projectController = require("../../controllers/projectController");

let routes = [
  {
    method: "POST",
    path: "/v1/project/create",
    joiSchemaForSwagger: {
      body: {
        userId: Joi.number().required().description("Enter user id"),
        name: Joi.string().required().description("Enter project name"),
        area: Joi.string().required().description("Enter site area"),
        numberOfFloor: Joi.string()
          .required()
          .description("Enter number of floors"),
        percentageOfCompletion: Joi.string()
          .required()
          .description("Enter percentage of project completion"),
        status: Joi.string()
          .required()
          .description("Enter status of the project"),
        price: Joi.number()
          .required()
          .description("Enter project estimated price"),
        package: Joi.string()
          .required()
          .description("Enter project package selected"),
        description: Joi.string().description("Enter project description"),
        location: Joi.string().description("Enter project location"),
        startDate: Joi.string().description("Enter project startDate"),
        url: Joi.string().required().description("Enter project image url")
      },
      group: "Project",
      description: "Route to create project",
      model: "createProject",
    },
    auth: false,
    handler: projectController.createProject,
  },
  {
    method: "PUT",
    path: "/v1/project/update",
    joiSchemaForSwagger: {
      body: {
        projectId: Joi.number().required().description("Enter project id"),
        name: Joi.string().description("Enter project name"),
        area: Joi.string().description("Enter site area"),
        numberOfFloor: Joi.string().description("Enter number of floors"),
        percentageOfCompletion: Joi.string().description(
          "Enter percentage of project completion"
        ),
        status: Joi.string().description("Enter status of the project"),
        price: Joi.number().description("Enter project estimated price"),
        package: Joi.string().description("Enter project package selected"),
        description: Joi.string().description("Enter project description"),
        location: Joi.string().description("Enter project location"),
        startDate: Joi.string().description("Enter project startDate"),
        status: Joi.string().description("Enter project status"),
        url: Joi.string().description("Enter project image url"),
      },
      group: "Project",
      description: "Route to update project details",
      model: "updateProject",
    },
    auth: false,
    handler: projectController.updateProject,
  },
  {
    method: "GET",
    path: "/v1/project/list",
    joiSchemaForSwagger: {
      query: {
        userId: Joi.number().description("Enter user id"),
      },
      group: "Project",
      description: "Route to list project",
      model: "projectList",
    },
    auth: false,
    handler: projectController.projectList,
  },
  {
    method: "GET",
    path: "/v1/project/details",
    joiSchemaForSwagger: {
      query: {
        projectId: Joi.number().description("Enter project id"),
      },
      group: "Project",
      description: "Route to get project details by id",
      model: "getProjectDetails",
    },
    auth: false,
    handler: projectController.projectById,
  },
  {
    method: "DELETE",
    path: "/v1/project",
    joiSchemaForSwagger: {
      body: {
        projectId: Joi.number().required().description("Enter project id"),
      },
      group: "Project",
      description: "Route to delete project",
      model: "deleteProject",
    },
    auth: false,
    handler: projectController.deleteById,
  },
];

module.exports = routes;
