
const { DataTypes } = require('sequelize');
const sequelize = require('../startup/dbConfig');
const { convertStringToFloat } = require('../utils/utils');
const { COUNTRY_WISE_CURRENCY_LIST } = require('../utils/constants');
/**************************************************
 ***************** WALLET MODEL ***************
 **************************************************/

const Wallet = sequelize.define('wallet', {
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
    balance: {
        type: DataTypes.DECIMAL(10, 2),
        validate: {
            isDecimal: true
        },
        get() {
            const value = this.getDataValue('balance');
            return convertStringToFloat(value);
        },
        defaultValue: 0
    },
    currency: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: COUNTRY_WISE_CURRENCY_LIST.INDIA
    },
    holdBalance: {
        type: DataTypes.DECIMAL(10, 2),
        validate: {
            isDecimal: true
        },
        get() {
            const value = this.getDataValue('holdBalance');
            return convertStringToFloat(value);
        },
        defaultValue: 0
    },
    isDeleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
}
);

Wallet.sync({ alter: true })

module.exports = Wallet;
