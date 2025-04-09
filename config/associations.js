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

  // Project stage -DONE
  db.project.hasMany(db.projectStage, { foreignKey: 'projectId' })
  db.projectStage.belongsTo(db.project, { foreignKey: 'projectId' })

  // Project stage task - DONE
  db.projectStage.hasMany(db.projectStageTask, { foreignKey: 'projectStageId' })
  db.projectStageTask.belongsTo(db.projectStage, { foreignKey: 'projectStageId' })

  // Project sub task - DONE
  db.projectStageTask.hasMany(db.projectSubTask, { foreignKey: 'projectStageTaskId' })
  db.projectSubTask.belongsTo(db.projectStageTask, { foreignKey: 'projectStageTaskId' })

  // Project stage delay reason - Done
  db.projectStage.hasMany(db.projectStageDelayReason, { foreignKey: 'projectStageId' })
  db.projectStageDelayReason.belongsTo(db.projectStage, { foreignKey: 'projectStageId' })

  // Project stage task delay reason - DONE
  db.projectStageTask.hasMany(db.projectStageTaskDelayReason, { foreignKey: 'projectStageTaskId' })
  db.projectStageTaskDelayReason.belongsTo(db.projectStageTask, { foreignKey: 'projectStageTaskId' })

  // Project sub task delay reason -  DONE
  db.projectSubTask.hasMany(db.projectSubTaskDelayReason, { foreignKey: 'projectSubTaskId' })
  db.projectSubTaskDelayReason.belongsTo(db.projectSubTask, { foreignKey: 'projectSubTaskId' })


  db.sequelize.sync({ alter: true });
}

module.exports = associations