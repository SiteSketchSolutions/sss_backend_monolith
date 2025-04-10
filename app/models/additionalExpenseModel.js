const { DataTypes } = require("sequelize");
const sequelize = require("../startup/dbConfig");
const User = require("./userModel");

/**************************************************
 *********** ADDITIONAL EXPENSE MODEL *************
 **************************************************/

const AdditionalExpense = sequelize.define("additionalExpense", {
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
    amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
    },
    stageName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    note: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('unpaid', 'settled'),
        allowNull: false,
        defaultValue: 'unpaid',
    },
    isDeleted: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
    },
});


AdditionalExpense.sync({ alter: true });

module.exports = AdditionalExpense; 