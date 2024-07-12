const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Project = require('./Project');

const TeamMembers = sequelize.define('TeamMembers', {
  team_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'user_id'
    }
  },
  project_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Project,
      key: 'project_id'
    }
  }
}, {
  tableName: 'Team_Members',
  timestamps: false
});

module.exports = TeamMembers;
