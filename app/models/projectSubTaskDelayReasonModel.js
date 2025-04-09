const { DataTypes } = require("sequelize");
const sequelize = require("../startup/dbConfig");
const ProjectSubTask = require("./projectSubTaskModel");

/**************************************************
 ********* PROJECT SUB TASK DELAY REASON MODEL ******
 **************************************************/

const ProjectSubTaskDelayReason = sequelize.define("projectSubTaskDelayReason", {
    id: {
        primaryKey: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
    },
    projectSubTaskId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "projectSubTasks",
            key: "id",
        },
    },
    reason: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    originalEndDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    isDeleted: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
    },
});

// Define association
// ProjectSubTaskDelayReason.belongsTo(ProjectSubTask, { foreignKey: 'projectSubTaskId', as: 'projectSubTask' });
// ProjectSubTask.hasMany(ProjectSubTaskDelayReason, { foreignKey: 'projectSubTaskId', as: 'delayReasons' });

ProjectSubTaskDelayReason.sync({ alter: true });

module.exports = ProjectSubTaskDelayReason; 