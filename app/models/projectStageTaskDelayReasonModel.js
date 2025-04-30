const { DataTypes } = require("sequelize");
const sequelize = require("../startup/dbConfig");
const ProjectStageTask = require("./projectStageTaskModel");

/**************************************************
 ********* PROJECT STAGE TASK DELAY REASON MODEL ******
 **************************************************/

const ProjectStageTaskDelayReason = sequelize.define("projectStageTaskDelayReason", {
    id: {
        primaryKey: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
    },
    projectStageTaskId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "projectStageTasks",
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

ProjectStageTaskDelayReason.sync({ alter: true });

module.exports = ProjectStageTaskDelayReason; 