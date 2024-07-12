const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const UserDetails = sequelize.define('UserDetails', {
  details_id: {
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
  employee_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false
  },
  pincode: {
    type: DataTypes.STRING,
    allowNull: false
  },
  state: {
    type: DataTypes.STRING,
    allowNull: false
  },
  country: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email_address: {
    type: DataTypes.STRING,
    allowNull: false
  },
  official_email_address: {
    type: DataTypes.STRING,
    allowNull: false
  },
  gender: {
    type: DataTypes.STRING,
    allowNull: false
  },
  date_of_birth: {
    type: DataTypes.DATE,
    allowNull: false
  },
  forte: {
    type: DataTypes.STRING,
    allowNull: true
  },
  other_skills: {
    type: DataTypes.STRING,
    allowNull: true
  },
  pan_card_no: {
    type: DataTypes.STRING,
    allowNull: false
  },
  passport_no: {
    type: DataTypes.STRING,
    allowNull: false
  },
  aadhar_no: {
    type: DataTypes.STRING,
    allowNull: false
  },
  nationality: {
    type: DataTypes.STRING,
    allowNull: false
  },
  religion: {
    type: DataTypes.STRING,
    allowNull: false
  },
  marital_status: {
    type: DataTypes.STRING,
    allowNull: false
  },
  employment_of_spouse: {
    type: DataTypes.STRING,
    allowNull: true
  },
  no_of_children: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'User_Details',
  timestamps: false
});

module.exports = UserDetails;
