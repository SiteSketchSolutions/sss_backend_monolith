const { DataTypes } = require("sequelize");
const sequelize = require("../startup/dbConfig");
const { convertStringToFloat } = require('../utils/utils');
const { PAYMENT_STAGE_STATUS, PAYMENT_STATUS } = require("../utils/constants");

/**************************************************
 ***************** PAYMENT STAGE MODEL ***************
 **************************************************/

const paymentStage = sequelize.define("paymentStage", {
    id: {
        primaryKey: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
    },
    walletId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "wallets",
            key: "id",
        },
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        get() {
            const value = this.getDataValue('totalAmount');
            return convertStringToFloat(value);
        },
        defaultValue: 0
    },
    paidAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        get() {
            const value = this.getDataValue('paidAmount');
            return convertStringToFloat(value);
        },
        defaultValue: 0
    },
    dueDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: PAYMENT_STAGE_STATUS.PENDING
    },
    paymentStatus: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: PAYMENT_STATUS.UNPAID
    },
    approved: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
    fullPayment: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    paymentMethod: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    acknowledgementSent: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
    },
    isDeleted: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
    },
});

paymentStage.sync({ alter: true });

module.exports = paymentStage;
