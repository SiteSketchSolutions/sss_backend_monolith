const { DataTypes } = require("sequelize");
const sequelize = require("../startup/dbConfig");

/**************************************************
 ***************** PDF CATALOG MODEL ***************
 **************************************************/

const PdfCatalog = sequelize.define("pdfCatalog", {
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
    fileUrl: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    fileSize: {
        type: DataTypes.INTEGER, // File size in bytes
        allowNull: false,
    },
    isDeleted: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
    },
});

PdfCatalog.sync({ alter: true });

module.exports = PdfCatalog;