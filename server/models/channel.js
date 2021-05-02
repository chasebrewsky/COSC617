const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId

module.exports = {
  Channel: mongoose.model('Channel', new mongoose.Schema({
    name: String,
  })),
  ChannelMessage: mongoose.model('ChannelMessage', new mongoose.Schema({
    channelId: { type: ObjectId, require: true },
    createdAt: { type: Date, require: true },
    userId: { type: ObjectId, required: true },
    content: { type: String, required: true },
  })),
}
