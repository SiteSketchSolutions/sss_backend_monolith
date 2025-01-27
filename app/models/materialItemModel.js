const { DataTypes } = require("sequelize");
const sequelize = require("../startup/dbConfig");

/**************************************************
 ***************** MATERIAL ITEM MODEL ***************
 **************************************************/

const MaterialItem = sequelize.define("materialItem", {
  id: {
    primaryKey: true,
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
  },
  materialCategoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "materialCategories",
    },
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
});

MaterialItem.sync({ alter: true });

module.exports = MaterialItem;
