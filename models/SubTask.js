const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Project = require('./Project'); // Import Project model
const Task = require('./Task'); // Import Task model

const SubTask = sequelize.define('SubTask', {
  subtask_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  project_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Project,
      key: 'project_id'
    }
  },
  task_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Task,
      key: 'task_id'
    }
  },
  subtask_description: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false
  },
  deadline: {
    type: DataTypes.DATE,
    allowNull: true // You can set this to false if you want to make deadline mandatory
  }
}, {
  tableName: 'SubTask',
  timestamps: false
});

// Define associations
SubTask.belongsTo(Task, { foreignKey: 'task_id' });

module.exports = SubTask;


