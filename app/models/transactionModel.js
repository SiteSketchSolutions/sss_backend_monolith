
const { DataTypes } = require('sequelize');
const sequelize = require('../startup/dbConfig');
const { convertStringToFloat } = require('../utils/utils');
const { TRANSACTION_STATUS, ORDER_TYPE } = require('../utils/constants');
/**************************************************
 ***************** TRANSACTION MODEL ***************
 **************************************************/


const Transaction = sequelize.define('transaction', {
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
            model: 'wallets',
            key: 'id',
        }
    },
    referenceId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        get() {
            const value = this.getDataValue('amount');
            return convertStringToFloat(value);
        }
    },
    transactionType: {
        type: DataTypes.STRING,
        allowNull: false
    },
    orderType: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: ORDER_TYPE.WALLET_TOPUP
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: TRANSACTION_STATUS.PENDING
    },
    projectId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    currency: {
        type: DataTypes.STRING,
        allowNull: true
    },
    transactionDetails: {
        type: DataTypes.JSON,
        allowNull: true
    }
}
);

Transaction.sync({ alter: true })

module.exports = Transaction;
