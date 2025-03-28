const { DataTypes } = require("sequelize");
const sequelize = require("../startup/dbConfig");
const materialItemModel = require("./materialItemModel");

/**************************************************
 ***************** MATERIAL SELECTED ITEM MODEL ***************
 **************************************************/

const MaterialSelectedItem = sequelize.define("materialSelectedItem", {
  id: {
    primaryKey: true,
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "users",
    },
  },
  materialItemId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "materialItems",
    },
  },
  selected: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  approvalStatus: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: "pending",
  },
  approvalNote: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  approvedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
});

// Define association
MaterialSelectedItem.belongsTo(materialItemModel, { foreignKey: 'materialItemId', as: 'materialItem' });

MaterialSelectedItem.sync({ alter: true });

module.exports = MaterialSelectedItem;
