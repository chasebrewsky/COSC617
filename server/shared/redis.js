const Redis = require('ioredis');
const config = require('./config');
const logger = require('./logger');


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
  client: () => {
    const client = new Redis(config.redis_uri);
    logger.info("Connected to Redis");
    module.exports.client = () => client;
    return client;
  },
  middleware: (req, res, next) => {
    req.redis = module.exports.client();
    next();
  },
}
