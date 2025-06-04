const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAdmin } = require('../middleware/authMiddleware');


// Admin dashboard showing all ground slots
router.get('/admin-dashboard', adminController.getAdminDashboard);

// Create a single ground slot
router.post('/admin/slot', adminController.createSlot);

// Create multiple ground slots with common visibleFrom (new route)
router.post('/admin/slots/bulk', adminController.createSlotsWithCommonOpenTime);

// Edit a ground slot by ID
router.post('/admin/slot/:id/edit', adminController.editSlot);

// Delete a ground slot by ID
router.post('/admin/slot/:id/delete', adminController.deleteSlot);
router.get('/user-management', adminController.getUsers);

// Delete a user by id
router.post('/admin/users/delete/:id', adminController.deleteUser);

router.get('/admin-feedback', adminController.getAllFeedback);
router.post('/admin-feedback/delete/:id', adminController.deleteFeedback);
// Approve a booking
router.post('/admin/bookings/:id/approve', adminController.approveBooking);

// Reject a booking
router.post('/admin/bookings/:id/reject', adminController.rejectBooking);

// Delete a booking
router.post('/admin/bookings/:id/delete', adminController.deleteBooking);

module.exports = router;
