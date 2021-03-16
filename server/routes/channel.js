const router = require('express').Router();
const { model } = require('mongoose');
const Channel = require('../models/channel');

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

router.get('/channels/mongoSetup', async (req, res) => {
  
  //Channel.collection.drop();

  const channelArray=["a","b","c","d","e","f","g","h","i"];

  for(var i=0;i<channelArray.length;i++)
  {
    const channelDoc = await Channel.findOneAndUpdate({channelName: channelArray[i]}, {}, {
      new: true,
      upsert: true
    });
  }

  Channel.find({
    "channelName": { $in: channelArray }
  }, function(err, docs) {
      console.log(docs)
  });
  
  res.render('channels_mongoSetup', {title:'Mongo Setup', results:"look at console"});

});

module.exports = router;
