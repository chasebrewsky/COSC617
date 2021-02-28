/**
 * Global logging module.
 *
 * Outputs logs in production to JSON, but will pretty print during development.
 */

const config = require('./config');

module.exports = require('pino')({
  prettyPrint: config.mode === 'dev',
});
