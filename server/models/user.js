const mongoose = require('mongoose');

module.exports = mongoose.model('User', new mongoose.Schema({
  username: { type: String, unique: true, required: true, sparse: true},
  password: { type: String, required: true },
  firstName: { type: String },
  lastName: { type: String },
  channelIds: [mongoose.ObjectId],
}));
