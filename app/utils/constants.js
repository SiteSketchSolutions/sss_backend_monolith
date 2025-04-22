"use strict";

let CONSTANTS = {};

CONSTANTS.SERVER = {
  ONE: 1,
};

CONSTANTS.AVAILABLE_AUTHS = {
  ADMIN: 1,
  USER: 2,
};

CONSTANTS.USER_TYPES = {
  ADMIN: 1,
  USER: 2,
};

CONSTANTS.USER_STATUS = {
  ACTIVE: "active",
  BLOCKED: "blocked",
};

CONSTANTS.SERVICE_TYPE = {
  WASTE_COLLECTION: "WASTE_COLLECTION",
};
CONSTANTS.PASSWORD_PATTER_REGEX =
  /^(?=.{6,})(?=.*[a-z])(?=.*[0-9])(?=.*[A-Z])(?=.*[@#$%^&+=]).*$/;

CONSTANTS.OTP_EXPIRY_DURATION = 5;

CONSTANTS.MESSAGES = require("./messages");

CONSTANTS.SECURITY = {
  JWT_SIGN_KEY: "fasdkfjklandfkdsfjladsfodfafjalfadsfkads",
  BCRYPT_SALT: 8,
  STATIC_TOKEN_FOR_AUTHORIZATION: "58dde3df315587b279edc3f5eeb98145",
};

CONSTANTS.ERROR_TYPES = {
  DATA_NOT_FOUND: "DATA_NOT_FOUND",
  BAD_REQUEST: "BAD_REQUEST",
  ALREADY_EXISTS: "ALREADY_EXISTS",
  FORBIDDEN: "FORBIDDEN",
  SOMETHING_WENT_WRONG: "SOMETHING_WENT_WRONG",
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  SOCKET_ERROR: "SOCKET_ERROR",
  INVALID_MOVE: "invalidMove",
};

CONSTANTS.GENDER_TYPES = {
  MALE: 1,
  FEMALE: 2,
};

CONSTANTS.TOKEN_TYPES = {
  LOGIN: 1,
  RESET_PASSWORD: 2,
  OTP: 3,
};

CONSTANTS.AVAILABLE_EXTENSIONS_FOR_FILE_UPLOADS = ["png", "jpg", "jpeg"];

CONSTANTS.PAGINATION = {
  DEFAULT_LIMIT: 50,
  DEFAULT_NUMBER_OF_DOCUMENTS_TO_SKIP: 0,
};

CONSTANTS.PROJECT_STATUS = {
  PENDING: "pending",
  IN_PROGRESS: "inprogress",
  COMPLETED: "completed",
};

CONSTANTS.PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_LIMIT: 10,
};
CONSTANTS.PROJECT_STATUS_LIST = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled"
}

CONSTANTS.PAYMENT_STAGE_STATUS = {
  UPCOMING: "upcoming",
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed"
}

CONSTANTS.PAYMENT_STATUS = {
  UNPAID: "unpaid",
  PARTIALLY_PAID: "partially_paid",
  PAID: "paid",
  OVERDUE: "overdue"
}

CONSTANTS.COUNTRY_WISE_CURRENCY_LIST = {
  INDIA: "₹"
}


CONSTANTS.TRANSACTION_STATUS = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  FAILED: "failed",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
  REVERTED: "reverted",
  PROCESSED: "processed",
  SUCCESS: "success",
  UNCLAIMED: "un_claimed",
  RETURNED: "returned",
  REQUESTED: "requested",
};

CONSTANTS.ORDER_TYPE = {
  PAYMENT_STAGE: "payment_stage",
  PART_PAYMENT: "part_payment",
  WALLET_TOPUP: "wallet_topup",
  WALLET_WITHDRAWAL: "wallet_withdrawal",
};

CONSTANTS.TRANSACTION_TYPE = {
  DEBIT: "debit",
  CREDIT: "credit",
};

CONSTANTS.EMAIL_TEMPLATE_LIST = {
  RESET_PASSWORD_TEMPLATE: {
    name: "ResetPasswordTemplate",
    templateData: (firstName, resetLink) => `{\"firstName\":\"${firstName}\",\"resetLink\":\"${resetLink}\"}`
  },
  SUPPORT_REQUEST_TEMPLATE: {
    name: "SupportRequestTemplate",
    subject: (userEmail = "", phoneNumber = "") => `{"userEmail":"${userEmail}","phoneNumber":"${phoneNumber}"}`,
    templateData: (userName = "", userEmail = "", phoneNumber = "", message = "") =>
      `{"userName":"${userName}","userEmail":"${userEmail}","phoneNumber":"${phoneNumber}","message":"${message.replace(/\n/g, '\\n')}"}`
  }
}

CONSTANTS.BANK_ACCOUNT_TYPE = {
  SAVINGS: "Savings",
  CURRENT: "Current",
  OTHER: "Other"
}

CONSTANTS.VENDOR_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive"
}
CONSTANTS.ADMIN_ROLES = {
  SUPER_ADMIN: "super_admin",
  SITE_ENGINEER: "site_engineer"
}

CONSTANTS.PROJECT_STAGE_STATUS_LIST = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  DELAYED: "delayed",
  CANCELLED: "delayed"
}


CONSTANTS.PROJECT_STAGE_TASK_STATUS_LIST = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  DELAYED: "delayed",
  CANCELLED: "delayed"
}

CONSTANTS.PROJECT_STAGE_SUB_TASK_STATUS_LIST = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  DELAYED: "delayed",
  CANCELLED: "delayed"
}

CONSTANTS.USER_STATUS_LIST = {
  ACTIVE: "active",
  PENDING: "pending",
  INACTIVE: "inactive"
}

module.exports = CONSTANTS;
