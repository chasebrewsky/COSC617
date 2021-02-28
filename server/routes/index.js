const router = require('express').Router();
const Counter = require('../models/counter');

// Home page. Increments a counter each time you visit.
router.get('/', async (req, res) => {
  const counter = await Counter.findOneAndUpdate({id: '56cb91bdc3464f14678934ca'}, {$inc: {count: 1}}, {upsert: true});
  res.render('index', {title: 'Express', count: counter ? counter.count : 0});
});

module.exports = router;
