const router = require('express').Router();
const Counter = require('../models/counter');
//const Channel = require('../models/channel');

// Home page. Increments a counter each time you visit.
router.get('/', async (req, res) => {
  // Saved long term visits to the MongoDB database. Persists between sessions.
  const counter = await Counter.findOneAndUpdate({id: '56cb91bdc3464f14678934ca'}, {$inc: {count: 1}}, {upsert: true});

  // Use the session to count number of times visited in the session.
  req.session.visits = req.session.visits ? req.session.visits + 1 : 1;
  res.render('index', {title: 'Express', count: counter ? counter.count : 0, sessionCount: req.session.visits});
});

module.exports = router;
