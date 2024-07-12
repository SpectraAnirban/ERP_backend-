const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User'); // Ensure correct path to User model
const Leave = require('./Leav'); // Check if this path and file name are correct
 // Ensure correct path to Leave model

const LeaveRequest = sequelize.define('LeaveRequest', {
  id_leave_request: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'user_id'
    },
    allowNull: false
  },
  leave_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Leave,
      key: 'id_leave'
    },
    allowNull: false
  },
  leave_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: false
  },
  dates: {
    type: DataTypes.JSON,
    allowNull: false
  },
  duration: {
    type: DataTypes.STRING,
    allowNull: false
  },
  total_days: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  current_date: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: sequelize.literal('CURRENT_TIMESTAMP') // Use Sequelize literal for current timestamp
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false
  },
  approved_by: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'user_id' // Assuming 'user_id' is the correct key in User model
    },
    allowNull: true
  },
  comment: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'Leave_Requests',
  timestamps: false
});
LeaveRequest.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'requester',
  targetKey: 'user_id'
});

LeaveRequest.belongsTo(User, {
  foreignKey: 'approved_by',
  as: 'approver',
  targetKey: 'user_id'
});
module.exports = LeaveRequest;
