// models/groundSlot.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GroundSlot = sequelize.define('GroundSlot', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  day: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  visibleFrom: {
    type: DataTypes.DATE,
    allowNull: false,
  }
}, {
  tableName: 'groundslots',
  timestamps: true,
  freezeTableName: true, // avoid pluralizing table name
});

module.exports = GroundSlot;
