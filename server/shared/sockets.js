const redis = require('./redis');
const session = require('./session');
const logger = require('./logger');
const WebSocket = require('ws');
const { memget } = require('./memoize');

const subscriptions = new Map();

function subscribe(ws, channel) {
  let sockets = subscriptions.get(channel);
  if (!sockets) {
    redis.subscriber.subscribe(channel, (err, count) => {
      if (err) return logger.error(err);
      logger.debug("Currently subscribed to %d channels", count);
    });
    sockets = new Set();
    subscriptions.set(channel, sockets);
  }
  sockets.add(ws);
  ws.channel = channel;
}

function unsubscribe(ws, channel) {
  const sockets = subscriptions.get(channel);
  if (!sockets) return;
  sockets.delete(ws);
  if (sockets.length) return;
  logger.debug("Unsubscribing from redis channel %s", channel);
  redis.subscriber.unsubscribe(channel, (err, count) => {
    if (err) return logger.error(err);
    logger.debug("Currently subscribed to %d channels", count);
  });
  subscriptions.delete(channel);
}

const socketHandlers = {
  channel_subscribe: (ws, message) => {
    const channel = message.payload;
    // Remove websocket from channel if its connected to one.
    if (ws.channel) unsubscribe(ws, ws.channel);
    subscribe(ws, channel);
  },

  /**
   * Publishes that someone started typing to the redis channel.
   * @param ws
   * @param message
   */
  typing: (ws, message) => {
    redis.publisher.publish(ws.channel, JSON.stringify({
      type: 'typing',
      payload: message.payload,
    }));
  },
};


const redisHandlers = {
  typing: (channel, message) => {
    const sockets = subscriptions.get(channel);
    if (!sockets) return;
    sockets.forEach(socket => {
      socket.send(JSON.stringify({
        type: 'typing',
        payload: message.payload,
      }));
    });
  },
}


module.exports = {
  get server() {
    const server = new WebSocket.Server({ noServer: true });

    server.on('connection', ws => {
      logger.debug("Received websocket connection");

      ws.on('message', message => {
        let data;
        try {
          data = JSON.parse(message);
        } catch (err) {
          return logger.error(err);
        }
        const handler = socketHandlers[data.type];
        logger.debug({ data }, "Received websocket message");
        if (handler) return handler(ws, data);
        logger.error("Received unknown websocket message type %s", data.type);
      });

      ws.on('close', (code, reason) => {
        logger.debug({ code, reason }, "Websocket closed connection");
        if (!ws.channel) return;
        unsubscribe(ws, ws.channel);
      })
    });

    redis.subscriber.on('message', (channel, message) => {
      const data = JSON.parse(message);
      const handler = redisHandlers[data.type];
      logger.debug({ channel, data }, "Received redis subscription message");
      if (handler) return handler(channel, data);
      logger.error("Received unknown redis subscriber message type %s", data.type);
    });

    return server;
  },
  attach: http => {
    http.on('upgrade', (request, socket, head) => {
      logger.debug({ request }, "Received upgrade request");

      session.middleware(request, {}, () => {
        // Authentication logic goes here.
        logger.debug({ request }, "Request authorized for websocket connection");

        module.exports.server.handleUpgrade(request, socket, head, ws => {
          logger.debug({ request }, "Request upgraded to websocket connection");
          module.exports.server.emit('connection', ws, request);
        });
      });
    });
  },
};

memget(module.exports, ['server']);
