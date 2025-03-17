const { DataTypes } = require("sequelize");
const sequelize = require("../startup/dbConfig");
const { convertStringToFloat } = require('../utils/utils');

/**************************************************
 ***************** PART PAYMENT STAGE MODEL ***************
 **************************************************/

const partPaymentStage = sequelize.define("partPaymentStage", {
    id: {
        primaryKey: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
    },
    stageId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "paymentStages",
            key: "id",
        },
    },
    referenceId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    method: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    invoiceNo: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        get() {
            const value = this.getDataValue('amount');
            return convertStringToFloat(value);
        },
        defaultValue: 0
    },
    note: {
        type: DataTypes.TEXT,
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

partPaymentStage.sync({ alter: true });

module.exports = partPaymentStage;
