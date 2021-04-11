const router = require('express').Router();
var express = require("express");
const yup = require('yup');
const bcrypt = require('bcrypt');
const config = require('../shared/config');
const User = require('../models/user');
const auth = require('../shared/auth');

router.get('/landingpage', (req, res, next) => {
  return res.render('landingpage', {title: 'landingpage', errors: null});
});

module.exports = router;