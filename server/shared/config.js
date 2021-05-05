/**
 * Configuration object that reads from the working directories .env file and dumps the
 * results into the process.env value. You can see an example of the configuration in
 * .env.example
 *
 * Object.freeze ensures that the values of the configuration cannot be overwritten at
 * runtime by the application.
 */

require('dotenv').config();

module.exports = Object.freeze({
  mode: process.env.SLACKLORD_MODE || 'prod',
  port: process.env.SLACKLORD_PORT || '3000',
  // URI of the mongodb instance. Default value matches the docker compose url.
  mongodb_uri: process.env.SLACKLORD_MONGODB_URI || 'mongodb://slacklord:slacklord@127.0.0.1/slacklord',
  // URI of the redis instance. Default value matches the docker compose url.
  redis_uri: process.env.SLACKLORD_REDIS_URI || 'redis://127.0.0.1:6379/',
  // Secret value used for generating secrets. MUST BE CHANGED IN PRODUCTION.
  secret: process.env.SLACKLORD_SECRET || 'random-secret',
  authenticated_user_id: process.env.SLACKLORD_AUTHENTICATED_USER_ID || undefined,
  disable_csrf: process.env.SLACKLORD_DISABLE_CSRF === 'true' || false,
  logging_level: process.env.SLACKLORD_LOGGING_LEVEL || 'info',
});
