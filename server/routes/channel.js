const router = require('express').Router();
const { model } = require('mongoose');
const Channel = require('../models/channel');
const db = require('../shared/db');

//Test page for showing channels
//TODO - make this use API
router.get('/channels', async (req, res) => {

  var listString="";

  Channel.find({}, function(err, docs) {
      for(var i=0;i<docs.length;i++)
      {
        listString+="<li>"+docs[i].channelName+"</li>";
      }

      res.render('channels', {title:'Channel Debug', channelList: listString});
  });

});

//Create Channel
//TODO - How to test post?
router.post('api/channels/', async (req, res) => {

  var channelName=req.body.name;

  console.log(channelName);

  var filter = {
    "channelName":channelName
  };

  const channelDoc = await Channel.findOneAndUpdate(filter, {}, {
    new: true,
    upsert: true
  });


  const result = {
    "id": channelDoc._id,
    "name": channelDoc.channelName
  };

  res.json(result);

});

//Update Channel Name
//TODO - test put request
router.put('api/channels/:id', async (req, res) => {

  var channelName=req.body.name;
  var channelId=req.params.id;

  console.log(channelName);
  console.log(channelId);

  var filter = {
    "_id": channelId
  };

  var update = {
    "channelName":channelName
  };

  const channelDoc = await Channel.findOneAndUpdate(filter, update, {
    new: true,
    upsert: false
  });


  const result = {
    "id": channelDoc._id,
    "name": channelDoc.channelName
  };

  res.json(result);

});

//TODO - Channel Messages

//Return list of all channels
router.get('/api/channels', async (req, res) => {

  const channelList = await Channel.find({});

  res.json(channelList);

});

//Return channel with matching id
router.get('/api/channels/:id', async (req, res) => {

  var filter = {
    "_id":req.params.id
  }

  var channelQuery = await Channel.findOne(filter).exec();

  var channelResponse = {
    "id":channelQuery._id,
    "name":channelQuery.channelName
  };

  res.json(channelResponse);

});

//For testing only
router.get('/channels/mongoSetup', async (req, res) => {
  
  // db.dropCollection("channels", function(err, result) {
  //   if(err) {
  //     console.log(err);
  //   }
  //   else 
  //   { 
  //     console.log("Collection Channels dropped.")
  //   }
  // })

  const channelArray=["a","b","c","d","e","f","g","h","i"];

  for(var i=0;i<channelArray.length;i++)
  {
    const channelDoc = await Channel.findOneAndUpdate({channelName: channelArray[i]}, {}, {
      new: true,
      upsert: true
    });
  }

  await Channel.find({
    "channelName": { $in: channelArray }
  }, function(err, docs) {
      console.log(docs)
  });
  
  res.render('channels_mongoSetup', {title:'Mongo Setup', results:"look at console"});

});

module.exports = router;
