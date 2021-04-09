const router = require('express').Router();
const { request } = require('express');
var express = require("express");
var mongoose = require("mongoose");
const user = require('../models/user');

// Home page. Increments a counter each time you visit.
router.get('/signup', function (req, res) {
  //console.log("Here's the signup page");
  if(req.query.fname == null & req.query.lname == null & req.query.email == null & req.query.password == null){
    res.render('signup');
  }
  else{
    var newUser = {
      username: req.query.email,
      password: req.query.pwd,
      firstName: req.query.fname,
      lastName: req.query.lname      
    }
    console.log(JSON.stringify(newUser));
    //res.render('index');
    var saveOneUser = new user(newUser);
    try {
      saveOneUser.save();
      res.redirect("/");
      } catch (err) {
      res.redirect("/");
      };
  }
});

module.exports = router;