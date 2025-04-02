const { DataTypes } = require("sequelize");
const sequelize = require("../startup/dbConfig");
const Vendor = require("./vendorModel");
const VendorExpenseCategory = require("./vendorExpenseCategoryModel");

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
    categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'vendorExpenseCategories',
            key: 'id'
        }
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
        type: DataTypes.ENUM('paid', 'unpaid'),
        allowNull: false,
        defaultValue: 'unpaid'
    },
    isDeleted: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
    },
});

// Define associations
VendorExpenseTracker.belongsTo(Vendor, { foreignKey: 'vendorId', as: 'vendor' });
VendorExpenseTracker.belongsTo(VendorExpenseCategory, { foreignKey: 'categoryId', as: 'category' });

VendorExpenseTracker.sync({ alter: true });

module.exports = VendorExpenseTracker; 
