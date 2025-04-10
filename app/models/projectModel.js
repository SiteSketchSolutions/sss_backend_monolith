const { DataTypes } = require("sequelize");
const sequelize = require("../startup/dbConfig");
const { PROJECT_STATUS } = require("../utils/constants");
const User = require("./userModel");

/**************************************************
 ***************** PROJECT MODEL ***************
 **************************************************/

const Project = sequelize.define("project", {
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
      key: "id",
    },
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  area: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  numberOfFloor: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  percentageOfCompletion: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "pending",
  },
  price: {
    type: DataTypes.DECIMAL,
    allowNull: false,
  },
  package: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  images: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: PROJECT_STATUS.PENDING,
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
});

// Define association
Project.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Project.sync({ alter: true });

module.exports = Project;
