const path = require('path')
const express = require('express')
const favicon = require('serve-favicon')
const compression = require('compression')
const app = express()
const logger = require("./server/middleware/logger")
const resolve = file => path.resolve(__dirname, file)
const cmsConfig = require("./conf/base.config")
const isProd = false

const microcache = require('route-cache')
const useMicroCache = isProd


app.use(favicon(path.join(__dirname, 'favicon.ico')))

//是否开启gzip压缩
if (cmsConfig.gzip) {
  app.use(compression({ threshold: 0 }))
}

const serve = (path, cache) => express.static(resolve(path), {
  maxAge: cache && isProd ? 1000 * 60 * 60 * 24 * 30 : 0
})

app.use(microcache.cacheSeconds(1, req => useMicroCache && req.originalUrl))

/* 解析请求体的中间件，必须开启 */
var bodyParser = require('body-parser');

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
  extended: true
}));

/* 解析cookie的中间件 */
app.use(require('cookie-parser')());

/* session持久化 */
app.use(require('./server/middleware/persist-session')());

//renderer初始化
global.renderer = require("./server/ssr/renderer")(app);

require('./conf/app-local.js')(app);

// 处理404
app.use(function (req, res, next) {
  if (req.url) {
    logger.error('[app.js:251]Cannot find:' + req.url);
  }
  res.status(404).end();
});

// 错误处理
app.use(function (err, req, res, next) {
  logger.error('捕获express异常|', err);
  err = err || {};
  err.status = err.status || 500;
  res.status(err.status);
  var oErrorPath = lanoUtils.getJsonProp(sConfFile, 'error-path');
  if (err.status == 404) {
    res.status(404).end();
    return;
  }
  res.status(500).end();
  return;
});

// 未捕获的异常处理
app.use(function (err, req, res, next) {
  logger.error('未捕获的express异常|', err);
  res.send('服务器发生未知错误，请与管理员联系。');
});

/* 处理进程未捕获的异常 */
process.on('uncaughtException', function (err) {
  logger.error('未捕获的进程异常|uncaughtException|', err);
});
/* 处理promise中的未catch异常，此方法仅对原生promise有效 */
process.on('unhandledRejection', error => {
  logger.error('未处理的promise-reject异常|unhandledRejection|', error);
});

module.exports = app;