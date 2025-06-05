const db = require('../models');
const GroundSlot = db.GroundSlot;
const { Feedback, User, Booking } = db;

// Render Admin Dashboard with all ground slots and bookings
exports.getAdminDashboard = async (req, res) => {
  try {
    // Fetch ground slots
    const slots = await GroundSlot.findAll();

    // Fetch bookings with associated ground slot and user info
    const bookings = await Booking.findAll({
      include: [
        { model: GroundSlot },
        { model: User, attributes: ['id', 'name', 'email'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.render('admin-dashboard', { slots, bookings });
  } catch (error) {
    console.error('Error loading admin dashboard:', error);
    res.status(500).send('Server Error');
  }
};

// Create a single new ground slot
exports.createSlot = async (req, res) => {
  try {
    const { day, startTime, endTime, visibleFrom } = req.body;
    const visibleDate = visibleFrom ? new Date(visibleFrom) : null;

    await GroundSlot.create({
      day,
      startTime,
      endTime,
      visibleFrom: visibleDate,
    });

    res.redirect('/admin-dashboard');
  } catch (err) {
    console.error("Error creating slot:", err);
    res.status(500).send("Server Error");
  }
};

// Create multiple ground slots with the same visibleFrom date
exports.createSlotsWithCommonOpenTime = async (req, res) => {
  const { slots, visibleFrom } = req.body;

  if (!Array.isArray(slots) || slots.length === 0) {
    return res.status(400).send("Invalid or empty slots array");
  }
  if (!visibleFrom) {
    return res.status(400).send("visibleFrom datetime is required");
  }

  try {
    const visibleDate = new Date(visibleFrom);

    await GroundSlot.bulkCreate(
      slots.map(slot => ({
        day: slot.day,
        startTime: slot.startTime,
        endTime: slot.endTime,
        visibleFrom: visibleDate,
      }))
    );

    res.redirect('/admin-dashboard');
  } catch (err) {
    console.error("Error bulk creating slots:", err);
    res.status(500).send("Server Error");
  }
};

// Edit a ground slot by ID
exports.editSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const { day, startTime, endTime, visibleFrom } = req.body;
    const visibleDate = visibleFrom ? new Date(visibleFrom) : null;

    const [updatedRows] = await GroundSlot.update(
      { day, startTime, endTime, visibleFrom: visibleDate },
      { where: { id } }
    );

    if (updatedRows === 0) {
      return res.status(404).send("Slot not found");
    }

    res.redirect('/admin-dashboard');
  } catch (err) {
    console.error("Error editing slot:", err);
    res.status(500).send("Server Error");
  }
};

// Delete a ground slot by ID
exports.deleteSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await GroundSlot.destroy({ where: { id } });

    if (!deleted) {
      return res.status(404).send("Slot not found");
    }

    res.redirect('/admin-dashboard');
  } catch (err) {
    console.error("Error deleting slot:", err);
    res.status(500).send("Server Error");
  }
};

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.render('user-management', { users });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).send('Server Error');
  }
};

// Delete a user by ID
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const deleted = await User.destroy({ where: { id: userId } });

    if (!deleted) {
      return res.status(404).send("User not found");
    }

    res.redirect('/user-management');
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).send('Server Error');
  }
};

// Get all feedbacks with associated user info
exports.getAllFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.findAll({
      include: [{ model: User, attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']],
    });

    res.render('admin-feedback', { feedbacks, user: req.session.user });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).send('Internal Server Error');
  }
};

// Delete feedback by ID
exports.deleteFeedback = async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await Feedback.destroy({ where: { id } });

    if (!deleted) {
      return res.status(404).send("Feedback not found");
    }

    res.redirect('/admin-feedback');
  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).send('Server error');
  }
};

// Approve a booking by ID
exports.approveBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await Booking.update(
      { status: 'approved' },
      { where: { id } }
    );

    if (updated[0] === 0) {
      return res.status(404).send("Booking not found");
    }

    res.redirect('/admin-dashboard');
  } catch (err) {
    console.error('Error approving booking:', err);
    res.status(500).send('Server Error');
  }
};

// Reject a booking by ID
exports.rejectBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await Booking.update(
      { status: 'rejected' },
      { where: { id } }
    );

    if (updated[0] === 0) {
      return res.status(404).send("Booking not found");
    }

    res.redirect('/admin-dashboard');
  } catch (err) {
    console.error('Error rejecting booking:', err);
    res.status(500).send('Server Error');
  }
};

