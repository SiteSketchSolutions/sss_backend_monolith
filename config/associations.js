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
  db.sequelize.sync({ alter: true });
}

module.exports = associations