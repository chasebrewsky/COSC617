const User = require('../models/user');
const logger = require('./logger')

module.exports = {
  // Middleware that places the user object onto the request if the
  // user ID is in the session.
  middleware: (req, res, next) => {
    if (!req.session.userId) return next();
    User.findOne({_id: req.session.userId}).exec().then(user => {
      req.user = user;
    }).catch(error => {
      // If this occurs, that means the user ID in the session is invalid. Remove it
      // from the session, log the error, and move to the next part of the middleware.
      delete req.session.userId;
      logger.error(error);
    }).finally(() => next());
  },
  // This is middleware used to only allow individuals who are logged in.
  loginRequired: (req, res, next) => {
    if (!req.user) return res.render('index', {title: 'index', errors: null});
    next();
  },
};