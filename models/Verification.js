// models/Verification.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Verification = sequelize.define('Verification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'user_id'
    }
  },
  verifier_id: {
    type: DataTypes.INTEGER,
    allowNull: true, // Allow null for initial state
    references: {
      model: User,
      key: 'user_id'
    }
  },
  verified_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null // Default value null for not verified
  },
  status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false // Default status is false
  }
}, {
  tableName: 'Verification',
  timestamps: false
});

// Define the associations
Verification.belongsTo(User, { as: 'User', foreignKey: 'user_id' });
Verification.belongsTo(User, { as: 'Verifier', foreignKey: 'verifier_id' });

module.exports = Verification;
