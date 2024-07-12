const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Resignation = sequelize.define('Resignation', {
  resign_id: {
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
  reason: {
    type: DataTypes.STRING,
    allowNull: false
  },
  notice_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  resignation_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'Resignation',
  timestamps: false
});

module.exports = Resignation;
