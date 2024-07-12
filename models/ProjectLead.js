const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Project = require('./Project');

const ProjectLead = sequelize.define('ProjectLead', {
  lead_id: {
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
  tableName: 'Project_Lead',
  timestamps: false
});

module.exports = ProjectLead;
