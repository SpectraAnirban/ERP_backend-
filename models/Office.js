const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Office = sequelize.define('Office', {
  office_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  status: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'Office',
  timestamps: false
});

module.exports = Office;
