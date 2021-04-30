const express = require('express');
require('express-async-errors');
const path = require('path');
const cookieParser =  require('cookie-parser');
const http = require('http');
const WebSocket = require('ws');

const authRouter = require('./routes/auth');
const appRouter = require('./routes/app');

const db = require('./shared/db');
const config = require('./shared/config');
const logger = require('./shared/logger');
const redis = require('./shared/redis');
const session = require('./shared/session');
const sockets = require('./shared/sockets');
const auth = require('./shared/auth');
const security = require('./shared/security');

// let RedisStore = require('connect-redis')(session);

// Application instance holder.
let app;

module.exports = async () => {
  // If the app was already created, don't do it again.
  if (app) return app;

  await db.connect();

  app = express();

  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'ejs');

  // Middleware
  // app.use(require('pino-http')({ logger }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(session.middleware);
  app.use('/static', express.static(path.join(__dirname, '../dist')));
  app.use('/static', express.static(path.join(__dirname, 'public')));
  // app.use(redis.middleware);
  app.use(cookieParser(config.secret));

  // User middleware. This will place the user object onto the request if it exists.
  app.use(security.CSRFMiddleware)
  app.use(auth.middleware);

  // Authentication routes
  app.use('/', authRouter);
  app.use('/', appRouter)

  // Error handler
  app.use((err, req, res, next) => {
    logger.error(err.stack);
    next(err);
  });

  const server = http.createServer(app);

  sockets.attach(server);

  return {http: server, app};
};
