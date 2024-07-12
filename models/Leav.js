const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Office = require('./Office'); // Assuming Office model is defined in './Office'

const Leaves = sequelize.define('Leaves', {
  id_leave: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false
  },
  applicable_for: {
    type: DataTypes.STRING,
    allowNull: false,
    get() {
      return this.getDataValue('applicable_for').split(',');
    },
    set(val) {
      if (Array.isArray(val)) {
        this.setDataValue('applicable_for', val.join(','));
      } else {
        // Handle cases where val is not an array
        this.setDataValue('applicable_for', val);
      }
    }
  },
  max_days: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  allow_duration: {
    type: DataTypes.STRING,
    allowNull: false,
    get() {
      return this.getDataValue('allow_duration').split(',');
    },
    set(val) {
      if (Array.isArray(val)) {
        this.setDataValue('allow_duration', val.join(','));
      } else {
        // Handle cases where val is not an array
        this.setDataValue('allow_duration', val);
      }
    }
  },
  office_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Office,
      key: 'id_office'
    },
    onUpdate: 'CASCADE',
    onDelete: 'NO ACTION'
  }
}, {
  tableName: 'Leaves',
  timestamps: false
});

module.exports = Leaves;
