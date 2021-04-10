const mongoose = require('mongoose');

module.exports = mongoose.model('users', new mongoose.Schema({
  id: mongoose.Schema.Types.ObjectId,
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true }, // THIS MUST BE HASH BEFORE SAVING IN DB. Argon2 seems to be the best.
  firstName: { type: String },
  lastName: { type: String },
}))