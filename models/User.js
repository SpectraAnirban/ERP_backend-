const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Office = require('./Office');
const Role = require('./Role');


const User = sequelize.define('User', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email_address: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  reported_to: {
    type: DataTypes.STRING,
    allowNull: true
  },
  employee_id: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  joining_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  phone_no: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  department: {
    type: DataTypes.STRING,
    allowNull: true
  },
  designation: {
    type: DataTypes.STRING,
    allowNull: true
  },
  office_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Office,
      key: 'office_id'
    },
    allowNull: true
  },
  role_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Role,
      key: 'role_id'
    },
    allowNull: true
  },
  user_type: {
    type: DataTypes.ENUM('super_admin', 'Employee', 'Admin', 'Client', 'HR'),
    allowNull: false,
    defaultValue: 'employee'
  }
}, {
  tableName: 'Users',
  timestamps: false
});

// Define associations
User.belongsTo(Role, { foreignKey: 'role_id' });
User.belongsTo(Office, { foreignKey: 'office_id' });


module.exports = User;
