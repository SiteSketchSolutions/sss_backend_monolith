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
    projectId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "projects",
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
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        get() {
            const value = this.getDataValue('amount');
            return convertStringToFloat(value);
        },
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
    paymentMethod: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    paymentDetails: {
        type: DataTypes.JSON,
        allowNull: true,
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
    isDeleted: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
    },
});

paymentStage.sync({ alter: true });

module.exports = paymentStage;
