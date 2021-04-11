const router = require('express').Router();
var express = require("express");
const yup = require('yup');
const bcrypt = require('bcrypt');
const config = require('../shared/config');
const User = require('../models/user');
const authenticate = require('../shared/authenticate');



router.get('/landingpage', (req, res, next) => {
  const authenticated = authenticate(req, res);
    // Return the regular signup page on each GET request.
    if(authenticated){
      return res.render('landingpage', {title: 'landingpage', errors: null});
    }
    else{
      return res.redirect('/');
    }
    

  });
  module.exports = router;