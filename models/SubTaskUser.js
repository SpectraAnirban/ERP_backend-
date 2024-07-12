const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const SubTask = require('./SubTask'); // Import SubTask model
const User = require('./User'); // Import User model

const SubTaskUser = sequelize.define('SubTaskUser', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: User,
      key: 'user_id'
    }
  },
  subtask_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: SubTask,
      key: 'subtask_id'
    }
  }
}, {
  tableName: 'SubTaskUser',
  timestamps: false
});

module.exports = SubTaskUser;
