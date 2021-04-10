const router = require('express').Router();
const yup = require('yup');
const bcrypt = require('bcrypt');
const config = require('../shared/config');
const User = require('../models/user');

const LoginSchema = yup.object().shape({
  email: yup.string().email().required(),
  password: yup.string().required(),
});

router.get('/', (req, res) => {
  return res.render('index', {title: 'index', errors: null});
});

router.post('/', async (req, res) => {
  let parsed;
  try {
    parsed = await LoginSchema.validate(req.body, {abortEarly: false});
  } catch (error) {
    return res.render('index', {title: 'index', errors: error.errors});
  }
  let user;
  try {
    user = await User.findOne({username: parsed.email}).exec();
  } catch (error) {
    return res.render('index', {title: 'index', errors: ['Invalid credentials']});
  }
  if (!user) res.render('index', {title: 'index', errors: ['Invalid credentials']});
  const matches = await bcrypt.compare(parsed.password, user.password);
  if (!matches) {
    return res.render('index', {title: 'index', errors: ['Invalid credentials']});
  }
  req.session.userId = user._id;
  return res.redirect('/landingpage');
});

module.exports = router;