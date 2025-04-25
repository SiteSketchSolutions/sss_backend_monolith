let CONSTANTS = require("./constants");
const BCRYPT = require("bcrypt");
const JWT = require("jsonwebtoken");
const CONFIG = require("../../config");
const fs = require("fs");
const { Op } = require("sequelize");
const R = require("ramda");
let commonFunctions = {};

const getWasteItemObjByWasteTypeId = R.pipe(
  R.groupBy((wasteItem) => wasteItem.wasteTypeId),
  R.map(R.ifElse(R.pipe(R.length, R.equals(1)), R.head, R.identity))
);

/**
 * generate otp
 */
commonFunctions.generateOTP = () => {
  // Generate a random 6-digit number
  const min = 100000; // Minimum 6-digit number
  const max = 999999; // Maximum 6-digit number
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * incrypt password in case user login implementation
 * @param {*} payloadString
 */
commonFunctions.hashPassword = (payloadString) => {
  return BCRYPT.hashSync(payloadString, CONSTANTS.SECURITY.BCRYPT_SALT);
};

/**
 * @param {string} plainText
 * @param {string} hash
 */
commonFunctions.compareHash = (payloadPassword, userPassword) => {
  return BCRYPT.compareSync(payloadPassword, userPassword);
};

/**
 * function to get array of key-values by using key name of the object.
 */
commonFunctions.getEnumArray = (obj) => {
  return Object.keys(obj).map((key) => obj[key]);
};

/** create jsonwebtoken **/
commonFunctions.encryptJwt = (payload) => {
  return JWT.sign(payload, process.env.JWT_SECRET_KEY, {
    algorithm: "HS256",
    expiresIn: "30d",
  });
};

commonFunctions.decryptJwt = (token) => {
  return JWT.verify(token, CONSTANTS.SECURITY.JWT_SIGN_KEY, {
    algorithm: "HS256",
  });
};

/**
 * function to convert an error into a readable form.
 * @param {} error
 */
commonFunctions.convertErrorIntoReadableForm = (error) => {
  let errorMessage = "";
  if (error.message.indexOf("[") > -1) {
    errorMessage = error.message.substr(error.message.indexOf("["));
  } else {
    errorMessage = error.message;
  }
  errorMessage = errorMessage.replace(/"/g, "");
  errorMessage = errorMessage.replace("[", "");
  errorMessage = errorMessage.replace("]", "");
  error.message = errorMessage;
  return error;
};

/***************************************
 **** Logger for error and success *****
 ***************************************/
commonFunctions.log = {
  info: (data) => {
    console.log("\x1b[33m" + data, "\x1b[0m");
  },
  success: (data) => {
    console.log("\x1b[32m" + data, "\x1b[0m");
  },
  error: (data) => {
    console.log("\x1b[31m" + data, "\x1b[0m");
  },
  default: (data) => {
    console.log(data, "\x1b[0m");
  },
};

/**
 * Send an email to perticular user mail
 * @param {*} email email address
 * @param {*} subject  subject
 * @param {*} content content
 * @param {*} cb callback
 */

commonFunctions.sendEmail = async (userData, type) => {
  const mailgun = require("mailgun-js");
  HANDLEBARS = require("handlebars");
  const mg = mailgun({
    apiKey: CONFIG.MAIL_GUN.API_KEY,
    domain: CONFIG.MAIL_GUN.DOMAIN,
  });
  /** setup email data **/
  userData.baseURL = CONFIG.SERVER_URL;
  const mailData = commonFunctions.emailTypes(userData, type),
    email = userData.email;
  let templateData;
  if (type != CONSTANTS.EMAIL_TYPES.SEND_PAYROLL) {
    mailData.template = fs.readFileSync(mailData.template, "utf-8");
    templateData = HANDLEBARS.compile(mailData.template)(mailData.data);
  }
  let emailToSend = {
    to: email,
    from: CONFIG.MAIL_GUN.SENDER,
    subject: mailData.Subject,
    ...(type == CONSTANTS.EMAIL_TYPES.SEND_PAYROLL && { text: "Payroll" }),
    ...(type != CONSTANTS.EMAIL_TYPES.SEND_PAYROLL && { html: templateData }),
    //attachment: mailData.attachment,
    ...(type == CONSTANTS.EMAIL_TYPES.SEND_PAYROLL && {
      attachment: mailData.attachment,
    }),
    //template: mailData.template,
    "h:X-Mailgun-Variables": JSON.stringify(mailData.data),
  };
  mg.messages().send(emailToSend, function (error, body) {
    if (error) {
      console.log(error);
    }
  });
};

commonFunctions.emailTypes = (user, type) => {
  let EmailStatus = {
    Subject: "",
    data: {},
    template: "",
  };
  switch (type) {
    case CONSTANTS.EMAIL_TYPES.SETUP_PASSWORD:
      EmailStatus["Subject"] = CONSTANTS.EMAIL_SUBJECTS.SETUP_PASSWORD;
      EmailStatus.template = CONSTANTS.MAIL_GUN_TEMPLATES.SETUP_PASSWORD_EMAIL;
      EmailStatus.data["link"] = user.setupPasswordLink;
      EmailStatus.data["firstName"] = user.firstName;
      // EmailStatus.data["senderLastName"] = user.adminLastName;
      EmailStatus.data["baseURL"] = user.baseURL;
      break;

    case CONSTANTS.EMAIL_TYPES.FORGOT_PASSWORD_EMAIL:
      EmailStatus["Subject"] = CONSTANTS.EMAIL_SUBJECTS.RESET_PASSWORD_EMAIL;
      EmailStatus.template = CONSTANTS.MAIL_GUN_TEMPLATES.RESET_PASSWORD_EMAIL;
      EmailStatus.data["firstName"] = user.firstName;
      EmailStatus.data["link"] = user.resetPasswordLink;
      EmailStatus.data["baseURL"] = user.baseURL;
      break;

    case CONSTANTS.EMAIL_TYPES.SEND_PAYROLL:
      EmailStatus["Subject"] = CONSTANTS.EMAIL_SUBJECTS.PAYROLL_EMAIL;
      EmailStatus.template = "";
      EmailStatus.attachment = user.fileUrl;
      //EmailStatus.data["firstName"] = user.firstName;
      //EmailStatus.data["link"] = user.resetPasswordLink;
      //EmailStatus.data["baseURL"] = user.baseURL;
      break;

    case CONSTANTS.EMAIL_TYPES.ACCOUNT_RESTORATION_EMAIL:
      EmailStatus["Subject"] =
        CONSTANTS.EMAIL_SUBJECTS.ACCOUNT_RESTORATION_EMAIL;
      EmailStatus.template = CONSTANTS.EMAIL_CONTENTS.ACCOUNT_RESTORATION_EMAIL;
      EmailStatus.data["name"] = user.name;
      EmailStatus.data["confirmationLink"] = user.confirmationLink;
      break;

    default:
      EmailStatus["Subject"] = "Welcome Email!";
      break;
  }
  return EmailStatus;
};

commonFunctions.renderTemplate = (template, data) => {
  return handlebars.compile(template)(data);
};

/**
 * function to create reset password link.
 */
commonFunctions.createResetPasswordLink = (userData) => {
  let dataForJWT = { ...userData, Date: Date.now };
  let resetPasswordLink =
    CONFIG.CLIENT_URL +
    "/auth/resetpassword/" +
    commonFunctions.encryptJwt(dataForJWT);
  return resetPasswordLink;
};

/**
 * function to create a setup password link.
 */
commonFunctions.createSetupPasswordLink = (userData) => {
  let token = commonFunctions.encryptJwt(
    { ...userData, date: Date.now },
    "24h"
  );
  let setupPasswordLink = CONFIG.CLIENT_URL + "/auth/invite/" + token;
  return setupPasswordLink;
};

/**
 * function to create reset password link.
 */
commonFunctions.createAccountRestoreLink = (userData) => {
  let dataForJWT = {
    previousAccountId: userData._id,
    Date: Date.now,
    email: userData.email,
    newAccountId: userData.newAccountId,
  };
  let accountRestoreLink =
    CONFIG.CLIENT_URL +
    "/v1/user/restore/" +
    commonFunctions.encryptJwt(dataForJWT);
  return accountRestoreLink;
};

/**
 * function to generate random alphanumeric string
 */
commonFunctions.generateAlphanumericString = (length) => {
  let chracters =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var randomString = "";
  for (var i = length; i > 0; --i)
    randomString += chracters[Math.floor(Math.random() * chracters.length)];
  return randomString;
};

/**
 * function to get pagination condition for aggregate query.
 * @param {*} sort
 * @param {*} skip
 * @param {*} limit
 */
commonFunctions.getPaginationConditionForAggregate = (sort, skip, limit) => {
  let condition = [
    ...(!!sort ? [{ $sort: sort }] : []),
    { $skip: skip },
    { $limit: limit },
  ];
  console.log(condition);
  return condition;
};

commonFunctions.getAddressType = (components, type) => {
  const component = components.find((comp) => comp.types.includes(type));
  return component ? component.long_name : null;
};
commonFunctions.generateShortUniqueId = () => {
  const timestamp = Date.now().toString(36);
  const randomString = Math.random().toString(36).substr(2, 5);
  return `${timestamp}${randomString}`;
};

commonFunctions.generateShortId = () => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substr(2, 5);
  return `${timestamp}${randomString}`;
};

commonFunctions.getCurrentTimeByTimeZone = (timeZone) => {
  const currentDate = new Date();
  const options = {
    timeZone: timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  };
  //TODO : for midnight 12 it return time as 24(hr) instead of 00 (this will cause the issue of NaN of differenceInMinute)
  const formattedDateTime = currentDate.toLocaleString("en-US", options);
  return formattedDateTime.replace(/,/, "") + "Z";
};

commonFunctions.generateZoneName = (
  sublocality_level_1,
  locality,
  postal_town,
  administrative_area_level_2,
  administrative_area_level_1,
  country
) => {
  const parts = [sublocality_level_1, locality, postal_town].filter(Boolean);

  if (parts.length === 0) {
    return `${administrative_area_level_2} ${administrative_area_level_1} ${country} `;
  }
  return parts.join("-");
};

commonFunctions.generateZoneDescription = (
  sublocality_level_1,
  locality,
  postal_town,
  country,
  administrative_area_level_1,
  administrative_area_level_2
) => {
  const parts = [
    sublocality_level_1,
    locality,
    postal_town,
    administrative_area_level_2,
    administrative_area_level_1,
    country,
  ].filter(Boolean);
  return parts.join(" ");
};

commonFunctions.convertEmptyStringToNull = (value) =>
  value === "" ? null : value;

commonFunctions.getCurrentDateTime = () => {
  const currentDate = new Date();
  const currentUtcDate = new Date(currentDate.toUTCString());
  return currentUtcDate;
};

commonFunctions.convertStringToFloat = (value = null) => {
  return value === null ? null : parseFloat(value);
};

commonFunctions.generateUniqueId = (prefix = "SSS") => {
  // Get the current timestamp
  const timestamp = Date.now();

  // Convert the timestamp to a string
  const uniquePart = timestamp.toString().slice(-5); // Take the last 5 digits for brevity

  // Combine the prefix with the unique part
  const uniqueId = `${prefix}${uniquePart}`;

  return uniqueId;
};

/**
 * Generate a sequential invoice number with standard format
 * @param {number} id - The ID of the part payment (for uniqueness)
 * @param {Date} [date=new Date()] - The date to use in the invoice number (defaults to current date)
 * @returns {string} - Formatted invoice number (e.g., "INV-20230815-00001")
 */
commonFunctions.generateInvoiceNumber = (id, date = new Date()) => {
  // Format: INV-XXXXX where XXXXX is a sequential number

  // Get date components
  // const year = date.getFullYear();
  // const month = String(date.getMonth() + 1).padStart(2, '0'); // Add 1 because months are 0-indexed
  // const day = String(date.getDate()).padStart(2, '0');

  // Create the date part
  // const datePart = `${year}${month}${day}`;

  // Pad the ID to be 5 digits
  const sequentialPart = String(id).padStart(5, '0');
  // Combine all parts
  return `INV-${sequentialPart}`;
};

/**
 * Function to make pagination response
 * @param {number} count 
 * @param {number} page 
 * @param {number} size 
 * @param {object} rows
 * @returns {object}
 */
commonFunctions.getPaginationResponse = (paginationData) => {
  const { count, pageNo, pageLimit, rows } = paginationData;

  const paginationResponse = {
    pagination: {
      currentPage: pageNo,
      pageLimit: pageLimit,
      totalPages: Math.ceil(count / pageLimit),
      totalItems: count,
    },
    data: rows || null
  }
  return paginationResponse
}

/**
 * Format a date to a readable string
 * @param {Date} date - The date to format
 * @returns {String} - Formatted date string (e.g., "11th January 2023")
 */
commonFunctions.formatDate = (date) => {
  if (!date) return '-';

  const d = new Date(date);

  // Get day with suffix (1st, 2nd, 3rd, etc.)
  const day = d.getDate();
  const suffix = (day) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  // Format the date
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${day}${suffix(day)} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

module.exports = commonFunctions;
