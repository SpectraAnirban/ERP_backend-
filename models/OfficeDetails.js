const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Office = require('./Office');

const OfficeDetails = sequelize.define('OfficeDetails', {
  office_details_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  office_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Office,
      key: 'office_id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'Office_Details',
  timestamps: false
});

module.exports = OfficeDetails;
