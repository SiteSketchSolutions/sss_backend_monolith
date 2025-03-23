const { DataTypes } = require("sequelize");
const sequelize = require("../startup/dbConfig");
const Vendor = require("./vendorModel");

/**************************************************
 *********** VENDOR EXPENSE TRACKER MODEL *********
 **************************************************/

const VendorExpenseTracker = sequelize.define("vendorExpenseTracker", {
    id: {
        primaryKey: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
    },
    vendorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'vendors',
            key: 'id'
        }
    },
    projectId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    stageId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
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


VendorExpenseTracker.sync({ alter: true });

module.exports = VendorExpenseTracker; 
