const express = require('express');
require('express-async-errors');
const path = require('path');
const cookieParser =  require('cookie-parser');
const http = require('http');
const WebSocket = require('ws');

const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth')
const db = require('./shared/db');
const auth = require('./shared/auth');
const config = require('./shared/config');
const logger = require('./shared/logger');
const session = require('./shared/session');
const sockets = require('./shared/sockets');

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
  app.use(require('pino-http')({ logger }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(session.middleware);
  app.use(cookieParser(config.secret));
  app.use(express.static(path.join(__dirname, 'public')));

  // User middleware. This will place the user object onto the request if it exists.
  app.use(auth.middleware);

  // Routes
  app.use('/', authRouter);
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

  const server = http.createServer(app);

  sockets.attach(server);

  return {http: server, app};
};
