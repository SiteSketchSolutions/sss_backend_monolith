const { DataTypes } = require("sequelize");
const sequelize = require("../startup/dbConfig");
const ProjectStageTask = require("./projectStageTaskModel");

/**************************************************
 ************ PROJECT SUB TASK MODEL **************
 **************************************************/

const ProjectSubTask = sequelize.define("projectSubTask", {
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

// // Define association
// ProjectSubTask.belongsTo(ProjectStageTask, { foreignKey: 'projectStageTaskId', as: 'parentTask' });
// ProjectStageTask.hasMany(ProjectSubTask, { foreignKey: 'projectStageTaskId', as: 'subTasks' });

ProjectSubTask.sync({ alter: true });

module.exports = ProjectSubTask; 