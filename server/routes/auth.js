const router = require('express').Router();
const yup = require('yup');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const auth = require('../shared/auth');
const security = require('../shared/security');

// Require CSRF for all of these routes.
router.use(security.CSRFRequired);


const SignupSchema = yup.object().shape({
  email: yup.string().email().required(),
  password: yup.string().required().max(50),
  password_confirmation: yup.string().required(),
  first_name: yup.string(),
  last_name: yup.string(),
});

// Signup routes.
router.all('/signup', auth.unauthorizedOnly())
router.get('/signup', (req, res) => {
  // Return the regular signup page on each GET request.
  return res.render('signup', security.addCSRFToken(req, {errors: null}));
});
router.post('/signup', async (req, res) => {
  let parsed;
  try {
    parsed = await SignupSchema.validate(req.body, {abortEarly: false});
  } catch (error) {
    return res.render('signup', security.addCSRFToken(req, {
      errors: error.errors,
    }));
  }
  const matches = await User.find({username: parsed.email}).exec();
  if (matches.length) {
    return res.render('signup', security.addCSRFToken(req, {
      errors: ['User with email already exists'],
    }));
  }
  if (parsed.password !== parsed.password_confirmation) {
    return res.render('signup', security.addCSRFToken(req, {
      errors: ['Passwords do not match'],
    }));
  }
  const hashed = await bcrypt.hash(parsed.password, 10);

  await User.create({
    username: parsed.email,
    password: hashed,
    firstName: parsed.first_name,
    lastName: parsed.last_name,
  });

  return res.redirect('/');
});


const LoginSchema = yup.object().shape({
  email: yup.string().email().required(),
  password: yup.string().required(),
});

// Login routes.
router.all('/login', auth.unauthorizedOnly())
router.get('/login', (req, res) => {
  return res.render('login', security.addCSRFToken(req, {errors: null}));
});
router.post('/login', async (req, res) => {
  let parsed;
  try {
    parsed = await LoginSchema.validate(req.body, {abortEarly: false});
  } catch (error) {
    return res.render('login', security.addCSRFToken(req, {
      errors: error.errors,
    }));
  }
  let user;
  try {
    user = await User.findOne({username: parsed.email}).exec();
  } catch (error) {
    return res.render('login', security.addCSRFToken(req, {
      errors: ['Invalid credentials'],
    }));
  }
  if (!user) res.render('login', security.addCSRFToken(req, {
    errors: ['Invalid credentials'],
  }));
  const matches = await bcrypt.compare(parsed.password, user.password);
  if (!matches) {
    return res.render('login', security.addCSRFToken(req, {
      errors: ['Invalid credentials'],
    }));
  }
  auth.login(req, user);
  return res.redirect('/');
});

// Logout GET page.
router.all('/logout', auth.loginRequired())
router.get('/logout', (req, res) => {
  return res.render('logout', security.addCSRFToken(req));
});
router.post('/logout', (req, res) => {
  auth.logout(req);
  return res.redirect('/login');
});

module.exports = router;
