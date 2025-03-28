const { DataTypes } = require("sequelize");
const sequelize = require("../startup/dbConfig");
const { ADMIN_ROLES } = require("../utils/constants");

/**************************************************
 ***************** ADMIN MODEL ***************
 **************************************************/

const Admin = sequelize.define("admin", {
  id: {
    primaryKey: true,
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  mobileNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: false,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: ADMIN_ROLES.SITE_ENGINEER,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
});

Admin.sync({ alter: true });

module.exports = Admin;
