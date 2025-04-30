const { DataTypes } = require("sequelize");
const sequelize = require("../startup/dbConfig");
const SiteUpdate = require("./siteUpdateModel");
const User = require("./userModel");

/**************************************************
 ************* SITE UPDATE LIKE MODEL *************
 **************************************************/

const SiteUpdateLike = sequelize.define("siteUpdateLike", {
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
    allowNull: false,
    references: {
      model: "users",
      key: "id",
    },
  }
}, {
  indexes: [
    // Composite unique index to ensure a user can like a site update only once
    {
      unique: true,
      fields: ['siteUpdateId', 'userId']
    }
  ]
});

// Define associations
SiteUpdateLike.belongsTo(SiteUpdate, { foreignKey: 'siteUpdateId' });
SiteUpdateLike.belongsTo(User, { foreignKey: 'userId' });

SiteUpdateLike.sync({ alter: true });

module.exports = SiteUpdateLike; 