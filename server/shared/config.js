/**
 * Configuration object that reads from the working directories .env file and dumps the
 * results into the process.env value. You can see an example of the configuration in
 * .env.example
 *
 * Object.freeze ensures that the values of the configuration cannot be overwritten at
 * runtime by the application.
 */

require('dotenv');

module.exports = Object.freeze({
  mode: process.env.SLACKORD_MODE || 'dev',
  port: process.env.SLACKORD_PORT || '3000',
  // URL of the mongodb instance. Default value matches the docker compose url.
  mongodb_uri: process.env.SLACKORD_MONGODB_URI || 'mongodb://slackord:slackord@127.0.0.1/slackord',
});
