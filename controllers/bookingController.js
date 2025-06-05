const { GroundSlot, Booking, User } = require('../models');

const { Op } = require('sequelize');

// Show booking page with all slots and existing bookings
exports.showBookingPage = async (req, res) => {
  try {
    const user = req.session.user;
    const userId = user?.id || null;

    const allSlots = await GroundSlot.findAll({
      where: {
        visibleFrom: {
          [Op.lte]: new Date()
        }
      },
      order: [['day', 'ASC'], ['startTime', 'ASC']]
    });

    const bookedSlots = await Booking.findAll({
      include: [GroundSlot],
      order: [['createdAt', 'DESC']]
    });

    res.render('booking', {
      availableSlots: allSlots,
      bookedSlots,
      userId,
      user // ✅ Pass full user object for EJS
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};


// Handle slot booking
exports.bookSlot = async (req, res) => {
  try {
    const userId = req.session.user?.id;
    const groundSlotId = req.params.id;
    const { name, course, year } = req.body;

    await Booking.create({
      name,
      course,
      year,
      userId,
      GroundSlotId: groundSlotId,
      status: 'Pending' // new bookings are always pending
    });

    res.redirect('/booking');
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to book slot");
  }
};

// Admin approves a booking
exports.approveBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;

    // Approve selected booking
    await Booking.update({ status: 'Approved' }, { where: { id: bookingId } });

    // Get approved booking to find slotId
    const approvedBooking = await Booking.findByPk(bookingId);

    // Reject all other pending bookings for the same slot
    await Booking.update(
      { status: 'Rejected' },
      {
        where: {
          GroundSlotId: approvedBooking.GroundSlotId,
          id: { [Op.ne]: bookingId },
          status: 'Pending'
        }
      }
    );

    res.redirect('/admin/bookings');
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to approve booking");
  }
};

// Admin rejects a specific booking
exports.rejectBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    await Booking.update({ status: 'Rejected' }, { where: { id: bookingId } });
    res.redirect('/admin/bookings');
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to reject booking");
  }
};
// In your admin route/controller
exports.showAdminSlotManagement = async (req, res) => {
  try {
    // Assuming `slots` is defined somewhere or fetched before
    const slots = await GroundSlot.findAll();

    const pendingBookings = await Booking.findAll({
      where: { status: 'pending' },
      include: [User, GroundSlot], // make sure you have User model imported
      order: [['createdAt', 'ASC']]
    });

    res.render('admin/slot-management', {
      slots,
      pendingBookings
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};
