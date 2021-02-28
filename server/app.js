const express = require('express');
require('express-async-errors');
const path = require('path');
const cookieParser =  require('cookie-parser');

const indexRouter = require('./routes');
const db = require('./shared/db');
const logger = require('./shared/logger');

// Application instance holder.
let app;

module.exports = async () => {
  // If the app was already created, don't do it again.
  if (app) return app;

  await db.connect()

  app = express();

  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'ejs');

  // Middleware
  app.use(require('pino-http')({logger}));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, 'public')));

  // Routes
  app.use('/', indexRouter);

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
