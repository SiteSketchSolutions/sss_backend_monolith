const { DataTypes } = require("sequelize");
const sequelize = require("../startup/dbConfig");
const ProjectStage = require("./projectStageModel");

/**************************************************
 ************ PROJECT STAGE TASK MODEL *************
 **************************************************/

const ProjectStageTask = sequelize.define("projectStageTask", {
    id: {
        primaryKey: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
    },
    projectStageId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "projectStages",
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
    adminId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "admins",
            key: "id",
        },
    },
    order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
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
// ProjectStageTask.belongsTo(ProjectStage, { foreignKey: 'projectStageId', as: 'projectStage' });
// ProjectStage.hasMany(ProjectStageTask, { foreignKey: 'projectStageId', as: 'tasks' });

ProjectStageTask.sync({ alter: true });

module.exports = ProjectStageTask; 