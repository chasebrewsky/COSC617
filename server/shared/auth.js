const User = require('../models/user');
const logger = require('./logger')
const config = require('./config');

module.exports = {
  // Middleware that places the user object onto the request if the
  // user ID is in the session.
  middleware: (req, res, next) => {
    const userId = req.session.userId || config.authenticated_user_id;
    if (!userId) return next();
    User.findOne({_id: userId}).exec().then(user => {
      req.user = user;
    }).catch(error => {
      // If this occurs, that means the user ID in the session is invalid. Remove it
      // from the session, log the error, and move to the next part of the middleware.
      if (req.session.userId) delete req.session.userId;
      logger.error(error);
    }).finally(() => next());
  },
  login: (req, user) => {
    req.session.userId = user._id;
    // Regenerate CSRF token on login.
    req.CSRFToken.generate();
  },
  logout: req => {
    delete req.session.userId;
    delete req.user;
    // Regenerate CSRF token on logout.
    req.CSRFToken.generate();
  },
  // This is middleware used to only allow individuals who are logged in.
  loginRequired: redirect => (req, res, next) => {
    if (!req.user) return res.redirect(redirect || '/login');
    next();
  },
  // Middleware specific to the API that returns a 401 instead of redirect.
  APILoginRequired: (req, res, next) => {
    if (!req.user) return res.sendStatus(401);
    next();
  },
  // Middleware that only allows unauthorized users.
  unauthorizedOnly: redirect => (req, res, next) => {
    if (req.user) return res.redirect(redirect || '/');
    next();
  },
}
