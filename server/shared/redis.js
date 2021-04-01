const Redis = require('ioredis');
const config = require('./config');
const { memget } = require("./memoize");


module.exports = {
  /**
   * Returns the redis client.
   *
   * In this function I'm essentially delaying instantiation of the client until its
   * called then replacing the client function with a function that returns the created
   * client. It prevents having to have a boolean check to see if the client was already created.
   *
   * @returns {Redis}
   */
  get cache() { return new Redis(config.redis_uri); },
  get publisher() { return new Redis(config.redis_uri); },
  get subscriber() { return new Redis(config.redis_uri); },
};

memget(module.exports, ['cache', 'publisher', 'subscriber']);
