const mongoose = require('mongoose');
const { toJSON } = require('../shared/serialization');


module.exports = {
  Channel: mongoose.model(
    'Channel',
    new mongoose.Schema({
      name: { type: String, required: true, unique: true },
    }).set('toJSON', toJSON),
  ),
  ChannelMessage: mongoose.model(
    'ChannelMessage',
    new mongoose.Schema({
      channel: { type: mongoose.ObjectId, require: true, ref: 'Channel' },
      createdAt: { type: Date, require: true },
      user: { type: mongoose.ObjectId, required: true, ref: 'User' },
      content: { type: String, required: true },
    }).set('toJSON', toJSON),
  ),
}
