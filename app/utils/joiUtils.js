const Joi = require('joi');
const moment = require('moment-timezone');

const joiUtils = {};

/**
 * Extension for Joi.
 */
joiUtils.Joi = Joi.extend((Joi) => ({
    type: 'string',
    base: Joi.string(),
    messages: {
        'string.objectId': '{{#label}} must be a valid id',
        'string.emailMessage': '{{#label}} must be a valid email',
        'string.invalidTimeZone': '{{#label}} must be a valid timezone.',
        'string.invalidPasswordFormat': 'password must be in a valid format',
    },
    rules: {
        // objectId: {
        //     validate(value, helpers) {
        //         if (mongoose.Types.ObjectId.isValid(value)) {
        //             return mongoose.Types.ObjectId(value);
        //         }
        //         return helpers.error('string.objectId');
        //     }
        // },
        isValidEmail: {
            validate(value, helpers) {
                let filter = /^([\w]+)(.[\w]+)*@([\w]+)(.[a-z]{2,3}){1,2}$/;
                if (filter.test(value.toLowerCase())) {
                    return value.toLowerCase();
                }
                return helpers.error('string.emailMessage');
            }
        },
        isValidTimeZone: {
            validate(value, helpers) {
                if (moment.tz.zone(value)) {
                    return value;
                }
                return helpers.error('string.invalidTimeZone');
            }
        },
        isValidPassword: {
            validate(value, helpers) {
                let filter =/^(?=.*[A-Za-z])(?=(.*[\d]){1,})(?=.*?[^\w\s]).{8,}$/
                if (filter.test(value)) {
                    return value;
                }
                return helpers.error('string.invalidPasswordFormat');
            }
        }
    }
}));

/** functions for files in multipart/form-data **/

joiUtils.Joi.file = ({ name, description = 'File' }) => {
    return { [name]: Joi.any().meta({ swaggerType: 'file' }).optional().description(description) }
};

joiUtils.Joi.fileArray = ({ name, description = 'File', maxCount }) => {
    let joiValidation = Joi.any().meta({ swaggerType: 'file' }).optional().description(description)
    maxCount && (joiValidation.maxCount = maxCount);
    return { [name]: joiValidation }
};

joiUtils.Joi.files = ({ maxCount, description = 'File' }) => {
    let joiValidation = Joi.any().meta({ swaggerType: 'file' }).optional().description(description)
    joiValidation.maxCount = maxCount;
    return joiValidation;
};

module.exports = joiUtils;