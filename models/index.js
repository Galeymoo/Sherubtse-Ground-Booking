const sequelize = require('../config/database');
const User = require('./User');
const GroundSlot = require('./GroundSlot');
const Booking = require('./Booking');
const Feedback = require('./Feedback');

// Associations
User.hasMany(Booking, { foreignKey: 'userId' });
Booking.belongsTo(User, { foreignKey: 'userId' });

GroundSlot.hasMany(Booking, { foreignKey: 'GroundSlotId' });
Booking.belongsTo(GroundSlot, { foreignKey: 'GroundSlotId' });

// New association
User.hasMany(Feedback, { foreignKey: 'userId' });
Feedback.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  sequelize,
  User,
  GroundSlot,
  Booking,
  Feedback,
};
