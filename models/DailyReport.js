const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const DailyReport = sequelize.define('DailyReport', {
  report_id: {
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
  report_body: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'Daily_Report',
  timestamps: false
});

module.exports = DailyReport;
