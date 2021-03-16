const mongoose = require('mongoose');

module.exports = mongoose.model('Channel', new mongoose.Schema({
  channelName: String
}))
