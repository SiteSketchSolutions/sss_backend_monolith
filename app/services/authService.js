const { SECURITY, MESSAGES, ERROR_TYPES, AVAILABLE_AUTHS, USER_TYPES } = require('../utils/constants');
const HELPERS = require("../helpers");
const adminModel = require('../models/adminModel');
const userModel = require('../models/userModel');
const { Op } = require("sequelize");
const JWT = require('jsonwebtoken');
const utils = require(`../utils/utils`);

let authService = {};

/**
 * function to authenticate user.
 */
authService.userValidate = (auth) => {
    return (request, response, next) => {
        validateUser(request, auth).then((isAuthorized) => {
            if (isAuthorized) {
                return next();
            }
            let responseObject = HELPERS.responseHelper.createErrorResponse(MESSAGES.UNAUTHORIZED, ERROR_TYPES.UNAUTHORIZED);
            return response.status(responseObject.statusCode).json(responseObject);
        }).catch((err) => {
            let responseObject = HELPERS.responseHelper.createErrorResponse(MESSAGES.UNAUTHORIZED, ERROR_TYPES.UNAUTHORIZED);
            return response.status(responseObject.statusCode).json(responseObject);
        });
    };
};


/**
 * function to validate user's jwt token and fetch its details from the system. 
 * @param {} request 
 */
let validateUser = async (request, auth) => {
    try {
        let decodedToken = JWT.verify(request.headers.authorization, process.env.JWT_SECRET_KEY);
        let criteria = { where: { id: decodedToken.userId, isDeleted: { [Op.ne]: true } } }
        if (Array.isArray(auth)) {
            auth = auth.find(auth => auth == decodedToken.userType)
        }
        if (!decodedToken) {
            return false;
        }
        let authenticatedUser = ""
        if (auth == AVAILABLE_AUTHS.ADMIN && decodedToken.userType == USER_TYPES.ADMIN) {
            authenticatedUser = await adminModel.findOne(criteria);
        }
        if (auth == AVAILABLE_AUTHS.USER && decodedToken.userType == USER_TYPES.USER) {
            authenticatedUser = await userModel.findOne(criteria);
        }
        authenticatedUser = authenticatedUser.dataValues
        if (authenticatedUser) {
            request.user = authenticatedUser;
            request.user.userType = decodedToken.userType
            request.user.token = request.headers.authorization;
            return true
        }
        return false;

    } catch (err) {
        console.log(err);
        return false;
    }
};
module.exports = authService;