const router = require('express').Router();
const yup = require('yup');
const bcrypt = require('bcrypt');
const config = require('../shared/config');
const User = require('../models/user');

// This is an object that validates the
const SignupSchema = yup.object().shape({
  email: yup.string().email().required(),
  password: yup.string().required().max(50),
  // This checks that the previous password was the intended password.
  password_confirmation: yup.string().required(),
  first_name: yup.string(),
  last_name: yup.string(),
});

router.get('/signup', (req, res) => {
  // Return the regular signup page on each GET request.
  return res.render('signup', {title: 'Signup', errors: null});
});

router.post('/signup', async (req, res) => {
  let parsed;
  try {
    // Validate the sent over POST information to make sure it's all present.
    // This is admittedly the hardest part of accepting data from a browser
    // because it can be incorrect or even malicious.
    parsed = await SignupSchema.validate(req.body, {abortEarly: false});
  } catch (error) {
    // If validation occurs, render the same template with the errors.
    return res.render('signup', {title: 'Signup', errors: error.errors});
  }
  // Search for existing users.
  const matches = await User.find({email: parsed.email}).exec();
  // If a user with a matching email exists, then render the same template
  // with an error saying that a user already exists with the given email.
  if (matches.length) {
    return res.render('signup', {title: 'Signup', errors: ['User with email already exists']});
  }
  if (parsed.password !== parsed.password_confirmation) {
    return res.render('signup', {title: 'Signup', errors: ['Passwords do not match']});
  }
  // Hash the password before storing in database. NEVER STORE AN UNHASHED PASSWORD.
  // When doing the login, hash the given password and compare that hash to the
  // on the in database, if they don't match, don't allow them access.
  const hashed = await bcrypt.hash(parsed.password, 10);
  // Create user.
  await User.create({
    email: parsed.email,
    password: hashed,
    firstName: parsed.first_name,
    lastName: parsed.last_name,
  });
  // You can either redirect to the login page to have them input the same
  // data they just signed up with for extra validation, or you can go right
  // into the application. Generally you want to VALIDATE the account via
  // email in a real application because anybody can use somebody elses
  // email to signup, but we don't have to do that here.
  return res.redirect('/login');
});

const LoginSchema = yup.object().shape({
  email: yup.string().email().required(),
  password: yup.string().required(),
});

router.get('/login', (req, res) => {
  // Same thing as the signup, just render the template.
  return res.render('login', {title: 'Login', errors: null});
});

router.post('/login', async (req, res) => {
  let parsed;
  try {
    parsed = await LoginSchema.validate(req.body, {abortEarly: false});
  } catch (error) {
    // If the validation fails, render the errors to the HTML template.
    return res.render('login', {title: 'Login', errors: error.errors});
  }
  let user;
  try {
    user = await User.findOne({email: parsed.email}).exec();
  } catch (error) {
    // If a user with the email does not exist, render that they input invalid credentials.
    // Never let the end user know if the email was incorrect because it lets attackers
    // know that the email exists, so they can try and brute force the password.
    return res.render('login', {title: 'Login', errors: ['Invalid credentials']});
  }
  if (!user) res.render('login', {title: 'Login', errors: ['Invalid credentials']});
  // Hash the given password and compare it against the hashed password in the database. If the
  // hashes don't match, that means they didn't put in the correct password.
  const matches = await bcrypt.compare(parsed.password, user.password);
  if (!matches) {
    return res.render('login', {title: 'Login', errors: ['Invalid credentials']});
  }
  // Save the ID of the user to the current session. We will create some middleware to pull
  // the user object onto the request object from the database if the user ID exists in the
  // session.
  req.session.userId = user._id;
  // Redirect to the application on successful login.
  return res.redirect('/');
});

module.exports = router;
