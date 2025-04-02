const associations = (db) => {
  //Address
  //db relationship
  db.materialItem.hasMany(db.materialSelectedItem, { foreignKey: 'materialItemId' })
  db.materialSelectedItem.belongsTo(db.materialItem, { foreignKey: 'materialItemId' })
  db.folder.hasMany(db.folderDocument, { foreignKey: 'folderId' })
  db.folderDocument.belongsTo(db.folder, { foreignKey: 'folderId' })
  db.paymentStage.hasMany(db.partPaymentStage, { foreignKey: 'stageId' })
  db.partPaymentStage.belongsTo(db.paymentStage, { foreignKey: 'stageId' })

  // Vendor Expense Tracker
  db.vendor.hasMany(db.vendorExpenseTracker, { foreignKey: 'vendorId' })
  db.vendorExpenseTracker.belongsTo(db.vendor, { foreignKey: 'vendorId' })

  // Vendor Expense Category
  db.vendorExpenseCategory.hasMany(db.vendorExpenseTracker, { foreignKey: 'categoryId' })
  db.vendorExpenseTracker.belongsTo(db.vendorExpenseCategory, { foreignKey: 'categoryId' })

  // Project
  db.project.hasMany(db.vendorExpenseTracker, { foreignKey: 'projectId' })
  db.vendorExpenseTracker.belongsTo(db.project, { foreignKey: 'projectId' })

  // User 
  db.user.hasMany(db.project, { foreignKey: 'userId' })
  db.project.belongsTo(db.user, { foreignKey: 'userId' })


  db.sequelize.sync({ alter: true });
}

module.exports = associations