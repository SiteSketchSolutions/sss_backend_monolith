const { DataTypes } = require("sequelize");
const sequelize = require("../startup/dbConfig");
const { PROJECT_STATUS } = require("../utils/constants");

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
  image: {
    type: DataTypes.STRING,
    allowNull: true,
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

Project.sync({ alter: true });

module.exports = Project;
