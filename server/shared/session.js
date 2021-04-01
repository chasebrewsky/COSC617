const session = require('express-session');
const RedisStore = require('connect-redis')(session);

const redis = require('./redis');
const config = require('./config');
const { memget } = require("./memoize");


module.exports = {
  get middleware() {
    return session({
      store: new RedisStore({ client: redis.cache }),
      secret: config.secret,
      resave: false,
      saveUninitialized: false,
    });
  },
};

memget(module.exports, ['middleware']);
