#!/usr/bin/env node

const config = require('../shared/config');
const logger = require('../shared/logger');

require('../app.js')().then(({ http, app }) => {
  app.set('port', config.port);

  // Create and listen on server.
  const server = http.listen(app.get('port'), () => {
    const address = server.address();
    logger.info(`Server is listening on ${address.address}:${address.port}`);
  });
}).catch(err => {
  logger.error(err.stack);
});



