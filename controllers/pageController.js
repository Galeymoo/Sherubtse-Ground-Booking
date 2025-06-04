// In controllers/pageController.js

exports.bookGround = (req, res) => {
  res.render('book'); // or your desired logic
};

exports.getContactPage = (req, res) => {
  res.render('contact', {
    user: req.session.user
  });
};
