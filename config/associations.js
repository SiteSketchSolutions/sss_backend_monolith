const associations = (db) => {
  //Address
  //db relationship
  db.materialItem.hasMany(db.materialSelectedItem, { foreignKey: 'materialItemId' })
  db.materialSelectedItem.belongsTo(db.materialItem, { foreignKey: 'materialItemId' })
  db.folder.hasMany(db.folderDocument, { foreignKey: 'folderId' })
  db.folderDocument.belongsTo(db.folder, { foreignKey: 'folderId' })
  db.sequelize.sync({ alter: true });
}

module.exports = associations