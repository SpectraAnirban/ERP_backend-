const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Project = require('./Project'); // Import Project model

const Task = sequelize.define('Task', {
  task_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  project_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Project,
      key: 'project_id'
    }
  },
  task_name: { // Added task_name field
    type: DataTypes.STRING,
    allowNull: false
  },
  task_description: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['todo', 'inProgress', 'inReview', 'completed']]
    }
  }
}, {
  tableName: 'Task',
  timestamps: false
});

module.exports = Task;