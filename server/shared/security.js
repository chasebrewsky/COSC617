const crypto = require('crypto');
const logger = require('../shared/logger');
const config = require('../shared/config');

/**
 * HTTP methods that should be checked for CSRF attacks.
 *
 * @type {Set<string>}
 */
const protectedCSRFMethods = new Set(['POST', 'PATCH', 'PUT', 'DELETE']);

/**
 * Functions that return potential places the CSRF token can be passed in a request.
 */
const CSRFGetters = [
  req => req.body.csrftoken,
  req => req.header('X-CSRF-Token'),
];

/**
 * Returns the CSRF token from the request based on the CSRF getters.
 *
 * @param req Express request.
 * @returns CSRF token or undefined.
 */
const getCSRFToken = req => {
  let value;
  for (const getter of CSRFGetters) {
    value = getter(req);
    if (value) return value;
  }
  return value;
};

/**
 * Functions that perform validations on the current CSRF token.
 */
const CSRFValidators = [
  (req, token) => {
    if (token) return true;
    logger.error(
      "CSRF token is missing from protected URL route %s %s",
      req.method, req.originalUrl,
    );
    return false;
  },
  req => {
    if (req.CSRFToken.current) return true;
    logger.error("CSRF token was never generated for the current session");
    return false;
  },
  (req, token) => {
    if (req.CSRFToken.current === token) return true;
    logger.error(
      "CSRF token is invalid for protected URL route %s %s",
      req.method, req.originalUrl,
    );
    return false;
  },
];

module.exports = {
  /**
   * Middleware to add CSRF functionality to all requests. This adds the CSRFToken
   * attribute to the express request.
   *
   * @param req Express request.
   * @param res Express response.
   * @param next Next middleware function.
   */
  CSRFMiddleware: (req, res, next) => {
    req.CSRFToken = {
      get value() { return req.CSRFToken.current || this.generate() },
      get current() { return req.session.csrftoken; },
      generate() { return req.session.csrftoken = crypto.randomBytes(32).toString('base64'); }
    }
    return next();
  },

  /**
   * Middleware that requires the use of CSRF validation on protected HTTP commands.
   *
   * @param req Express request.
   * @param res Express response.
   * @param next Next middleware function.
   */
  CSRFRequired: (req, res, next) => {
    if (config.disable_csrf) return next();
    if (!protectedCSRFMethods.has(req.method.toUpperCase())) return next();
    const token = getCSRFToken(req);
    for (const validator of CSRFValidators) {
      if (!validator(req, token)) return res.sendStatus(403);
    }
    return next();
  },
  addCSRFToken: (req, locals) => {
    return {...(locals || {}), csrftoken: req.CSRFToken.value};
  },
}
