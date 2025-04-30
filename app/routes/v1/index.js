"use strict";

/********************************
 ********* All routes ***********
 ********************************/
let v1Routes = [
  ...require("./authRoutes"),
  ...require("./adminRoutes"),
  ...require("./userRoutes"),
  ...require("./projectRoutes"),
  ...require("./projectStageRoutes"),
  ...require("./projectStageTaskRoutes"),
  ...require("./projectSubTaskRoutes"),
  ...require("./developmentStageRoutes"),
  ...require("./documentRoutes"),
  ...require("./folderRoutes"),
  ...require("./folderDocumentRoutes"),
  ...require("./materialCategoryRoutes"),
  ...require("./materialItemRoutes"),
  ...require("./materialSelectedItemRoute"),
  ...require("./siteUpdatesRoutes"),
  ...require("./pdfCatalogRoutes"),
  ...require("./latestUpdateRoute"),
  ...require("./walletRoutes"),
  ...require("./paymentStageRoutes"),
  ...require("./partPaymentStageRoutes"),
  ...require("./bankAccountRoutes"),
  ...require("./paymentAcknowledgementRoutes"),
  ...require("./brandingFormRoutes"),
  ...require("./userSessionRoutes"),
  ...require("./vendorRoutes"),
  ...require("./vendorExpenseTrackerRoutes"),
  ...require("./vendorExpenseCategoryRoutes"),
  ...require("./projectAnalyticsRoutes"),
  ...require("./vendorAnalyticsRoutes"),
  ...require("./budgetAllocationRoutes"),
  ...require("./additionalExpenseRoutes"),
  ...require("./migrationRoutes")
];

module.exports = v1Routes;
