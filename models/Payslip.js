const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Salary = require('./Salary');
const User = require('./User');

const Payslip = sequelize.define('Payslip', {
  payslip_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  salary_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Salary,
      key: 'salary_id'
    }
  },
  user_id: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'user_id'
    }
  },
  month: {
    type: DataTypes.STRING,
    allowNull: false
  },
  absents: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  half_day: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  total_leaves: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  paid_leave: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  deduction: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  pf: {
    type: DataTypes.FLOAT
  },
  esi: {
    type: DataTypes.FLOAT
  },
  p_tax: {
    type: DataTypes.FLOAT
  },
  tds: {
    type: DataTypes.FLOAT
  },
  advance: {
    type: DataTypes.FLOAT
  },
  salary_paid: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  pay_in_hand: {
    type: DataTypes.FLOAT,
    allowNull: false
  }
}, {
  tableName: 'Payslip',
  timestamps: false
});

module.exports = Payslip;
