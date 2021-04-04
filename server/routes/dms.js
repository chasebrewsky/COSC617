const router = require('express').Router();
const Counter = require('../models/counter');
const DMS = require('../models/dms');
const User = require('../models/users');

const mongoose = require('mongoose');

// DMS Default resp
router.get('/', async (req, res) => {
    let dms_sample = {
        "results": [
          {
            "id": "12345",
            "user": {
              "id": "12345",
              "username": "george.costanza"
            },
            "unread": 0
          }
        ]
      };
  res.json(dms_sample);
});

// POST New MSG
// /api/dms/{id}/messages
router.post('/:id/messages', async (req, res) => {
    let channel_id = req.params.id;
    // add some check for object_id
    let msg_txt = req.body.content;
    const record = await DMS.DMChannelMessage.create(
        {
        channelId: mongoose.Types.ObjectId(channel_id), 
        userId: mongoose.Types.ObjectId('60697f34c02efa3e20827866'),
        content: msg_txt
        }
    );
    console.log(record);
    res.json(record);
});

// Get Channel Messages
// /api/dms/{id}/messages
// router.get('/:id/messages-all', async (req, res) => {
//     let channel_id = req.params.id;
//     const result = await DMS.DMChannelMessage.find({'channelId': channel_id});
//     res.json(result);
// });
// http://localhost:3000/api/dms/606981c2d2414b32ec85f07c/messages?last=6069acba99d6e64244c563d3&limit=10

router.get('/:id/messages', async (req, res) => {
    let previous = req.query.last;
    let channel_id = req.params.id;
    let limit = parseInt(req.query.limit, 10);
    // filter results
    let filter = {'channelId': channel_id};
    // if valid previous --> sort id 
    if (mongoose.Types.ObjectId.isValid(previous)) {
        filter = {'channelId': channel_id,
        '_id': {'$lt': previous }};
    }; 
    const result = await DMS.DMChannelMessage.find(filter) //, '_id channelId userId context')
    .sort({'_id': -1}).limit(limit) // .sort('-created_at')
    // Get last Item
    let last_item = result.slice(-1).pop()._id
    // ** add check for final item here **

    // Format final response
    let final_resp = {};
    final_resp["previous"] = previous || null;
    final_resp["next"] =  "http://localhost:3000/api/dms/"
                        + `${encodeURIComponent(channel_id)}`
                        + "/messages"
                        +`?last=${encodeURIComponent(last_item)}` 
                        + `&limit=${encodeURIComponent(limit)}`;
    final_resp["results"] = result;
                        // for result in results --> result.id = result._id; delete result._id;
    //result.slice(-1).pop();
    res.json(final_resp);
});

// Create Test Channel
router.post('/test1', async (req, res) => {
    const dmc = DMS.DMChannel
    //dmc.watch().on('change', data => console.log(new Date(), data));
    let some_user = new User();
    await dmc.create({users: some_user.id});
    //let new_msg = new User();
    await DMS.DMChannelMessage.create({
        channelId: mongoose.Types.ObjectId('606981c2d2414b32ec85f07c'), 
    userId: mongoose.Types.ObjectId('60697f34c02efa3e20827866'),
    content: 'comment body test2'}
    );
    res.json({"rs": "POST request to the homepage"});
});

// router.get('/about', async (req, res) =>  {
//     //const dmc = DMS.DMChannel
//     const filter = {};
//     const all_dmc = await DMS.DMChannel.find(filter);
//     let ids = [];
//     await all_dmc.forEach(element => {
//         ids.push(element._id)
//     });
//     console.log("ids", ids)
//     let all_msgs = await DMS.DMChannelMessage.find().where('channelId').in(ids);
//     res.json({"results": all_msgs});
// });


module.exports = router;
