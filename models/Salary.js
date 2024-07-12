const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Salary = sequelize.define('Salary', {
  salary_id: {
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
  salary_basis: {
    type: DataTypes.STRING,
    allowNull: false
  },
  salary_amount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  payment_type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  pf_contribution: {
    type: DataTypes.FLOAT
  },
  pf_no: {
    type: DataTypes.STRING
  }
}, {
  tableName: 'Salary',
  timestamps: false
});

module.exports = Salary;
