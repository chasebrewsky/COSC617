const crypto = require('crypto');
const logger = require('../shared/logger');

const protectedCSRFMethods = new Set(['POST', 'PATCH', 'PUT', 'DELETE']);
const CSRFGetters = [
  req => req.body.csrftoken,
  req => req.header('X-CSRF-Token'),
];
const getCSRFToken = req => {
  let value;
  for (const getter of CSRFGetters) {
    value = getter(req);
    if (value) return value;
  }
  return value;
};

module.exports = {
  CSRFMiddleware: (req, res, next) => {
    if (!req.session.csrftoken) module.exports.generateCSRFToken(req);
    if (!protectedCSRFMethods.has(req.method.toUpperCase())) return next();
    const token = getCSRFToken(req);
    if (!token) {
      logger.error(
        "CSRF token is missing from protected URL route %s %s",
        req.method, req.originalUrl,
      )
      return res.sendStatus(403);
    }
    if (token !== req.session.csrftoken) {
      logger.error(
        "CSRF token is missing from protected URL route %s %s",
        req.method, req.originalUrl,
      );
      return res.sendStatus(403);
    }
    next();
  },
  generateCSRFToken: req => {
    return req.session.csrftoken = crypto.randomBytes(32).toString('base64');
  },
  CSRFTokenGenerator: req => () => module.exports.generateCSRFToken(req),
}
