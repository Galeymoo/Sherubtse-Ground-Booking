// routes/feedbackRoutes.js
const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

router.post('/send-message', feedbackController.sendMessage);
module.exports = router;
