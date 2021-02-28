const mongoose = require('mongoose');

module.exports = mongoose.model('Counter', new mongoose.Schema({
  id: mongoose.Schema.Types.ObjectId,
  count: { type: Number, min: 0, required: true },
}))
