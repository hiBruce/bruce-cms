var session = require('express-session');
const redis = require('redis')
let RedisStore = require('connect-redis')(session)

const config = require("../../conf/base.config.js")

module.exports = function () {
  var options = {
    secret: '7730ff70-cfb9-11e9-906d-db65bb163b94',
    saveUninitialized: true,
    unset: 'destroy',
    resave: false,
    cookie: {
      httpOnly: true,
      path: '/'
    }
  };

  var redisConf;
  var sessionConf =config['cms-session'] || {};
  sessionConf.cookie = sessionConf.cookie || {};

  var ttl = sessionConf.timeout || 900;

  redisConf =config.redis;

  if (redisConf) {
    console.log('session第三方存储|host: ' + redisConf.host
      + '|port: ' + redisConf.port);
    redisConf.logErrors = fnLogErrors;
    redisConf.prefix = redisConf.prefix || 'lano-';
    redisConf.ttl = ttl;
    redisConf.db = redisConf.db || 0;
    
    let client = redis.createClient(redisConf)
    options.store = new RedisStore({ client });
  }

  /*设置secret*/
  options.secret = sessionConf.secret || options.secret;

  /*设置cookie的名称*/
  options.name = sessionConf.name || 'lano.connect.sid';

  /*这是domain与path*/
  if (sessionConf.cookie.domain) {
    options.cookie.domain = sessionConf.cookie.domain;
  }

  if (sessionConf.cookie.expires) {
    options.cookie.expires = sessionConf.cookie.expires;
  }

  if (sessionConf.cookie.httpOnly === false) {
    options.cookie.httpOnly = false;
  }

  if (sessionConf.cookie.maxAge) {
    options.cookie.maxAge = sessionConf.cookie.maxAge;
  }

  if (sessionConf.cookie.path) {
    options.cookie.path = sessionConf.cookie.path;
  }

  if (sessionConf.cookie.sameSite) {
    options.cookie.sameSite = sessionConf.cookie.sameSite;
  }

  if (sessionConf.cookie.secure) {
    options.cookie.secure = sessionConf.cookie.secure;
  }

  return session(options);
};

function fnLogErrors(err) {
  logger.error('connect-redis error|', err);
}