const router = require('express').Router();
const security = require('../shared/security');
const auth = require('../shared/auth');
const config = require('../shared/config');

router.get('/*', auth.loginRequired(), (req, res) => {
  return res.render('app', security.addCSRFToken(req, {
    websocketURL: `ws://${req.hostname}:${config.port}`,
  }));
});

module.exports = router;
