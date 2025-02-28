"use strict";

/********************************
 ********* All routes ***********
 ********************************/
let v1Routes = [
  ...require("./authRoutes"),
  ...require("./adminRoutes"),
  ...require("./userRoutes"),
  ...require("./projectRoutes"),
  ...require("./developmentStageRoutes"),
  ...require("./documentRoutes"),
  ...require("./folderRoutes"),
  ...require("./folderDocumentRoutes"),
  ...require("./materialCategoryRoutes"),
  ...require("./materialItemRoutes"),
  ...require("./materialSelectedItemRoute"),
  ...require("./siteUpdatesRoutes"),
  ...require("./latestUpdateRoute"),
  ...require("./walletRoutes"),
  ...require("./paymentStageRoutes"),
  ...require("./partPaymentStageRoutes")
];

module.exports = v1Routes;
