const router = require('express').Router();
var express = require("express");
const yup = require('yup');
const bcrypt = require('bcrypt');
const config = require('../shared/config');
const User = require('../models/user');

// This is an object that validates the
const SignupSchema = yup.object().shape({
  email: yup.string().email().required(),
  pwd: yup.string().required().max(50),
  pwd2: yup.string().required(),
  fname: yup.string(),
  lname: yup.string(),
});

router.get('/signup', (req, res) => {
  // Return the regular signup page on each GET request.
  return res.render('signup', {title: 'Signup', errors: null});
});


router.post('/signup', async (req, res) => {
  let parsed;
  try {
    parsed = await SignupSchema.validate(req.body, {abortEarly: false});
  } catch (error) {
    return res.render('signup', {title: 'Signup', errors: error.errors});
  }
  const matches = await User.find({username: parsed.email}).exec();
  if (matches.length) {
    return res.render('signup', {title: 'Signup', errors: ['User with email already exists']});
  }
  if (parsed.pwd !== parsed.pwd2) {
    return res.render('signup', {title: 'Signup', errors: ['Passwords do not match']});
  }
  const hashed = await bcrypt.hash(parsed.pwd, 10);

  await User.create({
    username: parsed.email,
    password: hashed,
    firstName: parsed.fname,
    lastName: parsed.lname,
  });

  return res.redirect('/');
});

module.exports = router;