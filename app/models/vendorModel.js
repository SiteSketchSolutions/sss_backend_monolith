const { DataTypes } = require("sequelize");
const sequelize = require("../startup/dbConfig");

/**************************************************
 ***************** VENDOR MODEL ******************
 **************************************************/

const Vendor = sequelize.define("vendor", {
    id: {
        primaryKey: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    note: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "active",
    },
    isDeleted: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
    },
});

Vendor.sync({ alter: true });

module.exports = Vendor; 