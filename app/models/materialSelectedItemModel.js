const { DataTypes } = require("sequelize");
const sequelize = require("../startup/dbConfig");

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
  isDeleted: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
});

MaterialSelectedItem.sync({ alter: true });

module.exports = MaterialSelectedItem;
