const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Project = require('./Project');

const ProjectFiles = sequelize.define('ProjectFiles', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  project_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  file: {
    type: DataTypes.BLOB('long'),
    allowNull: false
  },
  filename: {
    type: DataTypes.STRING,
    allowNull: false
  },
  mimetype: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

module.exports = ProjectFiles;
