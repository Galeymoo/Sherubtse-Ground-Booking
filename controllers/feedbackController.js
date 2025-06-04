const Feedback = require('../models/feedback');

exports.sendMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    // Assuming you store user info in session, e.g. req.session.user.id
    const userId = req.session.user ? req.session.user.id : null;

    if (!name || !email || !subject || !message) {
      return res.status(400).send('All fields are required.');
    }

    if (!userId) {
      return res.status(401).send('User must be logged in to send feedback.');
    }

    await Feedback.create({ name, email, subject, message, userId });

    res.redirect('/contact?success=true');
  } catch (error) {
    console.error('Error saving feedback:', error);
    res.status(500).send('Internal Server Error');
  }
};
