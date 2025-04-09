const { DataTypes } = require("sequelize");
const sequelize = require("../startup/dbConfig");
const Project = require("./projectModel");

/**************************************************
 *********** BUDGET ALLOCATION MODEL **************
 **************************************************/

const BudgetAllocation = sequelize.define("budgetAllocation", {
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
    vendorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "vendors",
            key: "id",
        },
    },
    amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
    },
    note: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    allocatedBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "admins",
            key: "id",
        },
    },
    isDeleted: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
    },
});


BudgetAllocation.sync({ alter: true });

module.exports = BudgetAllocation; 