const express = require('express');
 const router = express.Router();
 const pageController = require('../controllers/pageController');
 const { isAuthenticated } = require('../middleware/authMiddleware');
 // Render the landing page
 router.get('/', (req, res) => {
 res.render('index', { title: 'Student project showcase' });
 });

router.get('/contact', pageController.getContactPage);

// GET /bookgetting
router.get('/book', pageController.bookGround);

module.exports = router;
