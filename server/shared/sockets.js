const redis = require('./redis');
const session = require('./session');
const auth = require('./auth');
const logger = require('./logger');
const WebSocket = require('ws');
const { memget } = require('./memoize');

const serialize = (type, payload) => JSON.stringify({ type, payload });
const send = (ws, type, payload) => ws.send(serialize(type, payload));

const CHANNEL_EVENTS = Object.freeze({
  TYPING: 'TYPING',
  MESSAGE: 'MESSAGE',
});

class Channel {
  constructor(id) {
    this.id = id;
    this.connections = new Set();
  }

  add(ws) {
    if (this.connections.has(ws)) return;

    this.connections.add(ws);

    const remove = () => this.remove(ws);
    const unsubscribe = id => {
      if (id !== this.id) return;

      ws.removeEventListener('close', remove);
      ws.removeEventListener('unsubscribe', unsubscribe);
    };

    ws.on('close', remove);
    ws.on('unsubscribe', unsubscribe);
  }

  remove(ws) {
    if (!this.connections.has(ws)) return;

    ws.emit('unsubscribe', this.id);
  }

  publish(event, payload) {
    logger.debug({ event, payload, channel: `CHANNEL:${this.id}` }, 'Publishing to redis');
    redis.publisher.publish(`CHANNEL:${this.id}`, JSON.stringify({ type: event, payload }));
  }
}

const manager = {
  channels: {},
  subscribe(ws, id) {
    let channel = this.channels[id];

    if (!channel) {
      redis.subscriber.subscribe(`CHANNEL:${id}`, (err, count) => {
        if (err) return logger.error(err);

        logger.debug("Currently subscribed to %d channels", count);
      });

      channel = new Channel(id);
      this.channels[id] = channel;
    }

    channel.add(ws);
  },
  unsubscribe(ws, id) {
    if (!(id in this.channels)) return;

    const channel = this.channels[id];
    channel.remove(ws);

    if (!channel.connections.size) {
      redis.subscriber.unsubscribe(`CHANNEL:${id}`, (err, count) => {
        if (err) return logger.error(err);

        logger.debug("Currently subscribed to %d channels", count);
      });

      delete this.channels[id];
    }
  },
};

const WS_EVENT_HANDLERS = {
  SUBSCRIBE: (ws, { ids }) => {
    for (const id of ids) {
      manager.subscribe(ws, id);
    }
  },

  UNSUBSCRIBE: (ws, { ids }) => {
    for (const id of ids) {
      manager.unsubscribe(ws, id);
    }
  },

  SET_ACTIVE_CHANNEL: (ws, { id }) => ws.channelId = id,

  REMOVE_ACTIVE_CHANNEL: (ws, { id }) => {
    if (!ws.channelId || id !== ws.channelId) return;

    delete ws.channelId
  },

  TYPING: (ws) => {
    logger.debug({ channelId: ws.channelId, channels: manager.channels }, 'TYPING');
    if (!ws.channelId || !manager.channels[ws.channelId]) return;

    const channel = manager.channels[ws.channelId];
    const user = { id: ws.user.id, name: [ws.user.firstName, ws.user.lastName].join(' ') };
    channel.publish(CHANNEL_EVENTS.TYPING, { user });
  },
};


const REDIS_HANDLERS = {
  TYPING: (channel, { user }) => {
    for (const ws of channel.connections) {
      if (ws.channelId === channel.id && ws.user._id.toString() !== user.id) {
        send(ws, CHANNEL_EVENTS.TYPING, { user });
      }
    }
  },

  MESSAGE: (channel, { id }) => {
    for (const ws of channel.connections) {
      send(ws, CHANNEL_EVENTS.MESSAGE, { id });
    }
  },
}

const parse = message => {
  try {
    const { type, payload } = JSON.parse(message);
    return [type, payload];
  } catch (err) {
    logger.error(err);
    return [null, null];
  }
};

module.exports = {
  get server() {
    const server = new WebSocket.Server({ noServer: true });

    server.on('connection', ws => {
      logger.debug("Received websocket connection");

      ws.on('message', message => {
        const [type, payload] = parse(message);
        const handler = WS_EVENT_HANDLERS[type];
        logger.debug({ type, payload }, "Received websocket message");

        if (!handler) {
          return logger.error("Received unknown websocket message type %s", type);
        }

        try {
          handler(ws, payload)
        } catch (err) {
          logger.error(err);
        }
      });

      ws.on('close', (code, reason) => {
        logger.debug({ code, reason }, "Websocket closed connection");
      })
    });

    redis.subscriber.on('message', (name, message) => {
      const channelId = name.replace('CHANNEL:', '');
      const channel = manager.channels[channelId];
      logger.debug({ name, message, channelId }, "Received redis message");

      if (!channel) return;

      const [type, payload] = parse(message);
      const handler = REDIS_HANDLERS[type];
      logger.debug({ type, payload }, "Decoded redis message");

      if (!handler) {
        return logger.error("Received unknown redis subscriber message type %s", data.type);
      }

      try {
        handler(channel, payload)
      } catch (err) {
        logger.error(err);
      }
    });

    return server;
  },

  attach: http => {
    http.on('upgrade', (request, socket, head) => {
      logger.debug("Received upgrade request");

      session.middleware(request, {}, () => {
        auth.middleware(request, {}, () => {
          if (!request.user) logger.debug("Request not authorized for websocket connection");

          module.exports.server.handleUpgrade(request, socket, head, ws => {
            logger.debug("Request upgraded to websocket connection");
            ws.user = request.user;
            module.exports.server.emit('connection', ws, request);
          });
        });
      });
    });
  },
};

memget(module.exports, ['server']);
