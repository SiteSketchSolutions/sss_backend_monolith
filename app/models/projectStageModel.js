const { DataTypes } = require("sequelize");
const sequelize = require("../startup/dbConfig");
const Project = require("./projectModel");

/**************************************************
 ***************** PROJECT STAGE MODEL ***************
 **************************************************/

const ProjectStage = sequelize.define("projectStage", {
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
        type: DataTypes.TEXT,
        allowNull: true,
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    percentage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0.00,
    },
    status: {
        type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'delayed', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending',
    },
    isDeleted: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
    },
});

// Define association
// ProjectStage.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });
// Project.hasMany(ProjectStage, { foreignKey: 'projectId', as: 'stages' });

ProjectStage.sync({ alter: true });

module.exports = ProjectStage; 