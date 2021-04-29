const router = require('express').Router();
const security = require('../shared/security');
const auth = require('../shared/auth');

router.get('/*', auth.loginRequired(), (req, res) => {
  return res.render('app', security.addCSRFToken(req));
});

module.exports = router;
