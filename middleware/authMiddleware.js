function isAuthenticated(req, res, next) {
  if (req.session && req.session.user && req.session.user.id) {
    return next();
  }
  res.redirect('/login');
}


exports.isAdmin = (req, res, next) => {
  if (!req.session || !req.session.user || !req.session.isAdmin) {
    return res.redirect('/login');
  }
  next();
};

