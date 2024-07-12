const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Task = require('./Task'); // Import Task model
const User = require('./User'); // Import User model

const TaskUser = sequelize.define('TaskUser', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: User,
      key: 'user_id'
    }
  },
  task_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: Task,
      key: 'task_id'
    }
  }
}, {
  tableName: 'TaskUser',
  timestamps: false
});

module.exports = TaskUser;
