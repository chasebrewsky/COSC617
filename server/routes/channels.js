const router = require('express').Router();
const joi = require('joi');
const { Channel, ChannelMessage } = require('../models/channel');
const logger = require('../shared/logger');
const { broadcast } = require("../shared/sockets");
const { publish } = require("../shared/sockets");
const { APIError, APINotFoundError, serialize, absoluteURL } = require('../shared/serialization');


router.get('/', async (req, res) => {
  const channels = await Channel.find({}, { name: 1 }).exec();

  return res.json({ 'results': channels.map(serialize) });
});


const ChannelSchema = joi.object({
  name: joi.string().required().max(255),
});


/**
 * POST request for creating new channels.
 */
router.post('/', async (req, res) => {
  const { error, value } = ChannelSchema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).json(APIError({ error }));
  }

  const existing = await Channel.findOne({ name: value.name }).exec();

  // Channel names must be unique.
  if (existing) {
    return res.status(400).json(APIError({
      fields: { name: ["Value already in use"] },
    }));
  }

  try {
    const channel = await Channel.create(value);
    broadcast('CHANNEL_CREATED', {});

    return res.json(serialize(channel));
  } catch (error) {
    logger.error(error);
    return res.status(500);
  }
});


router.get('/:id', async (req, res) => {
  let channel;

  try {
    channel = await Channel.findOne({ _id: req.params.id }).exec();
  } catch (error) {
    return res.status(404).json(APINotFoundError);
  }

  return res.json(serialize(channel));
});


const MessageQuerySchema = joi.object({
  limit: joi.number().integer().default(20),
  after: joi.date().iso(),
  before: joi.date().iso(),
});


router.get('/:id/messages', async (req, res) => {
  let channel;

  try {
    channel = await Channel.findOne({ _id: req.params.id }).exec();
  } catch (error) {
    return res.status(404).json(APINotFoundError);
  }

  const { error, value: query } = MessageQuerySchema.validate(req.query, { abortEarly: false });

  if (error) {
    return res.status(404).json(APIError({ error }));
  }

  let q = ChannelMessage
    .find(
      { channel: channel._id },
      { user: 1, createdAt: 1, content: 1 },
    )
    .limit(query.limit)
    .sort({ createdAt: -1 })
    .populate('user', ['id', 'firstName', 'lastName']);

  if (query.after) {
    q = q.find({ createdAt: { $gt: query.after } });
  }

  if (query.before) {
    q = q.find({ createAt: { $lt: query.before } });
  }

  const messages = await q.exec();
  const last = messages.length ? messages[messages.length - 1] : null;
  const next = messages.length && messages.length === query.limit
    ? absoluteURL(req, `/channels/${req.params.id}/messages`, {
        limit: query.limit,
        after: last.createdAt.toISOString(),
      })
    : null;

  return res.json({
    next,
    results: messages.map(serialize).map(message => {
      message.user.id = message.user._id;
      delete message.user._id;

      return message
    }),
  })
});


const MessageSchema = joi.object({
  content: joi.string().required(),
});


router.post('/:id/messages', async (req, res) => {
  let channel;

  try {
    channel = await Channel.findOne({ _id: req.params.id }).exec();
  } catch (error) {
    return res.status(404).json(APINotFoundError);
  }

  const { error, value } = MessageSchema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(404).json(APIError({ error }));
  }

  const message = await ChannelMessage.create({
    channel: channel._id,
    user: req.user._id,
    createdAt: new Date(),
    content: value.content,
  });

  publish(channel._id, 'MESSAGE', { userId: req.user._id });

  return res.json(serialize(message));
});


module.exports = router;
