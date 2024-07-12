const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const DailyReport = require('./DailyReport');
const User = require('./User');

const Note = sequelize.define('Note', {
  note_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  report_id: {
    type: DataTypes.INTEGER,
    references: {
      model: DailyReport,
      key: 'report_id'
    }
  },
  user_id: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'user_id'
    }
  },
  editor_name: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'Note',
  timestamps: false
});

module.exports = Note;
