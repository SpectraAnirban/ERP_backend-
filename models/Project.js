const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const ProjectFiles = require('./ProjectFiles');
const ProjectLead = require('./ProjectLead');
const Projectmember = require('./projmember');

const Project = sequelize.define('Project', {
  project_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  project_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  client: {
    type: DataTypes.STRING,
    allowNull: false
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING, // Adjust the datatype and length as needed
    allowNull: true // Assuming description can be null
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  priority: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lead_id: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'user_id'
    }
  },
  project_files: {
    type: DataTypes.STRING,
    allowNull: true // Assuming project_files can be null
  }
}, {
  tableName: 'Project',
  timestamps: false
});

Project.hasMany(ProjectFiles, { foreignKey: 'project_id' });
ProjectFiles.belongsTo(Project, { foreignKey: 'project_id' });
Project.hasOne(ProjectLead, { foreignKey: 'project_id' });
Project.hasMany(Projectmember, { foreignKey: 'project_id' });

module.exports = Project;
