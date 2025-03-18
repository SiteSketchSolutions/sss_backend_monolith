const { DataTypes } = require("sequelize");
const sequelize = require("../startup/dbConfig");

/**************************************************
 ***************** USER SESSION MODEL ***************
 **************************************************/

const UserSession = sequelize.define("userSession", {
    id: {
        primaryKey: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    deviceInfo: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    ipAddress: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    isDeleted: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
    },
});

UserSession.sync({ alter: true });

module.exports = UserSession; 