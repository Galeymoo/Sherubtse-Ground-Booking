const { GroundSlot } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment-timezone');

exports.getUserDashboard = async (req, res) => {
  const currentTimeInBhutan = moment().tz('Asia/Thimphu').toDate();

  const visibleSlots = await GroundSlot.findAll({
    where: {
      visibleFrom: {
        [Op.lte]: currentTimeInBhutan
      }
    }
  });

  res.render('user-dashboard', { title: 'Ground Bookings', slots: visibleSlots });
};
