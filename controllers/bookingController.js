const { GroundSlot, Booking, User } = require('../models');
const { Op } = require('sequelize');

// Show booking page with all slots and existing bookings
exports.showBookingPage = async (req, res) => {
  try {
    const user = req.session.user || null;

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

    const bookedByUser = user
      ? await Booking.findAll({ where: { userId: user.id } })
      : [];

    res.render('booking', {
      availableSlots: allSlots,
      bookedSlots,
      user,
      bookedByUser // ✅ pass to EJS
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

    const existingBooking = await Booking.findOne({
      where: {
        userId,
        GroundSlotId: groundSlotId
      }
    });

    if (existingBooking) {
      return res.redirect('/booking'); // prevent duplicate
    }

    await Booking.create({
      name,
      course,
      year,
      userId,
      GroundSlotId: groundSlotId,
      status: 'Pending'
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

// Admin slot management page
exports.showAdminSlotManagement = async (req, res) => {
  try {
    const slots = await GroundSlot.findAll();

    const pendingBookings = await Booking.findAll({
      where: { status: 'pending' },
      include: [User, GroundSlot],
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
