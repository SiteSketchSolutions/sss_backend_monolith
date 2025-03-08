const { DataTypes } = require("sequelize");
const sequelize = require("../startup/dbConfig");

/**************************************************
 ***************** BANK ACCOUNT MODEL ***************
 **************************************************/

const bankAccount = sequelize.define("bankAccount", {
    id: {
        primaryKey: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "Account holder name"
    },
    accountNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "Bank account number"
    },
    ifscCode: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "IFSC code of the bank"
    },
    bankName: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "Name of the bank"
    },
    accountType: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "Savings",
        comment: "Type of account (Savings, Current, etc.)"
    },
    branchName: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Name of the bank branch"
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "Additional details about the account"
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: "Whether the account is active"
    },
    isDeleted: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
    },
});

bankAccount.sync({ alter: true });

module.exports = bankAccount; 