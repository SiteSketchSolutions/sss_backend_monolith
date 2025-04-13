const { DataTypes } = require("sequelize");
const sequelize = require("../startup/dbConfig");

/**************************************************
 *********** SITE UPDATE COMMENT MODEL ************
 **************************************************/

const SiteUpdateComment = sequelize.define("siteUpdateComment", {
  id: {
    primaryKey: true,
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
  },
  siteUpdateId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "siteUpdates",
      key: "id",
    },
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true, // Can be null for admin responses
  },
  adminId: {
    type: DataTypes.INTEGER,
    allowNull: true, // Can be null for user comments
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  isAdminReply: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
});

SiteUpdateComment.sync({ alter: true });

module.exports = SiteUpdateComment; 