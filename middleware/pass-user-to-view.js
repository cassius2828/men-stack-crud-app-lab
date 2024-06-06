function passUserToView(req, res, next) {
  // making a global user var in your ejs files if the user is logged in
  res.locals.user = req.session.user ? req.session.user : null;
  next();
}

module.exports = passUserToView;