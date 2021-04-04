const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId

module.exports = {
  DMChannel: mongoose.model('DMChannel', new mongoose.Schema({
    id: ObjectId,
    users: { type: [ObjectId] }
  })),
  DMChannelMessage: mongoose.model('DMChannelMessage', new mongoose.Schema({
    id: ObjectId,
    channelId: { type: ObjectId, require: true },
    userId: { type: ObjectId, required: true },
    content: { type: String, required: true }
  },{
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
    }
  ))
}
