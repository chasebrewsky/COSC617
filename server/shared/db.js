const mongoose = require('mongoose');

const config = require('../shared/config');
const logger = require('../shared/logger');

module.exports = {
  /**
   * Return the current connection to the MongoDB database.
   *
   * @returns {Connection}
   */
  connection: () => mongoose.connection,

  /**
   * Connects to the MongoDB database outlined in the MongoDB URI set in the
   * application configuration. This should only be called once in the application.
   *
   * @returns {Promise<Mongoose>}
   */
  connect: async () => {
    const connection = await mongoose.connect(config.mongodb_uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });
    logger.info("Connected to MongoDB");
    return connection;
  }
};
