const router = require('express').Router();
var express = require("express");
const yup = require('yup');
const bcrypt = require('bcrypt');
const config = require('../shared/config');
const User = require('../models/user');

router.get('/landingpage', (req, res) => {
    // Return the regular signup page on each GET request.
    return res.render('landingpage', {title: 'landingpage', errors: null});
  });

  module.exports = router;