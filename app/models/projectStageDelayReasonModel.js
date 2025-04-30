const { DataTypes } = require("sequelize");
const sequelize = require("../startup/dbConfig");
const ProjectStage = require("./projectStageModel");

/**************************************************
 *********** PROJECT STAGE DELAY REASON MODEL *******
 **************************************************/

const ProjectStageDelayReason = sequelize.define("projectStageDelayReason", {
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
// ProjectStageDelayReason.belongsTo(ProjectStage, { foreignKey: 'projectStageId', as: 'projectStage' });
// ProjectStage.hasMany(ProjectStageDelayReason, { foreignKey: 'projectStageId', as: 'delayReasons' });

ProjectStageDelayReason.sync({ alter: true });

module.exports = ProjectStageDelayReason; 