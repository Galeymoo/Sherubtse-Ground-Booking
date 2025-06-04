const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

router.get('/', bookingController.showBookingPage);
router.post('/book/:id', bookingController.bookSlot);
router.post('/approve/:id', bookingController.approveBooking);
router.post('/reject/:id', bookingController.rejectBooking);

router.get('/admin/bookings', bookingController.showAdminSlotManagement);

module.exports = router;
