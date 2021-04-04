const express = require('express');
require('express-async-errors');
const path = require('path');
const session = require('express-session');
const cookieParser =  require('cookie-parser');

const indexRouter = require('./routes');
const dms = require('./routes/dms');
const db = require('./shared/db');
const config = require('./shared/config');
const logger = require('./shared/logger');
const redis = require('./shared/redis');

let RedisStore = require('connect-redis')(session);

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
  app.use(require('pino-http')({logger}));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(session({
    store: new RedisStore({ client: redis.client() }),
    secret: config.secret,
    resave: false,
    saveUninitialized: false,
  }))
  app.use(redis.middleware);
  app.use(cookieParser(config.secret));
  app.use(express.static(path.join(__dirname, 'public')));

  // Routes
  app.use('/', indexRouter);
  app.use('/api/dms', dms);
  // // Catch 404 and forward to error handler
  // app.use((req, res, next) => {
  //   next(createError(404));
  // });

  // Error handler
  app.use((err, req, res, next) => {
    logger.error(err.stack);
    next(err);
  });

  return app;
};
