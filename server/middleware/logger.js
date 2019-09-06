var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');
var log4js = require("log4js");

/*日志级别映射*/
var logLevels = { error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 };
/*应用根路径*/
var rootDir = process.env.NODE_lano_ROOT || __dirname;
/*服务器运行状态*/
var appEnv = (process.env.NODE_ENV === 'production') ? 'production' : 'development';
/*开发模式下的日志级别*/
var levelDev;
/*生产模式下的日志级别*/
var levelPro;
/*日志存放路径*/
var logsPath;
/*配置文件*/


/*设置缺省状态下的默认日志级别以及存放路径*/
levelDev = (levelDev in logLevels) ? levelDev : 'debug';
levelPro = (levelPro in logLevels) ? levelPro : 'warn';
logsPath = logsPath || "logs";

/*根据运行环境选择日志级别*/
var logLevel = (appEnv === 'development') ? levelDev : levelPro;
/*确定日志存放位置*/
var logsRealPath = path.join(rootDir, logsPath);

/*创建日志输出目录*/
if(!fs.existsSync(logsRealPath)){
  if(!mkdirp.sync(logsRealPath)){
    logsRealPath = rootDir;
    console.log("创建日志输出目录失败，日志将存储在应用根目录下。");
  }
}

var logFileName = path.join(logsRealPath, 'business');


log4js.configure({
    appenders: {
        logFile: {
            type: "dateFile",
            filename:logFileName, 
            alwaysIncludePattern: true,
            pattern: "-yyyy-MM-dd.log",
            encoding: 'utf-8',
            maxLogSize: 11024 
				}, 
        xcLogConsole: {
            type: 'console'
        }
    },
    categories: {
        default: {
            appenders: ['logFile', 'xcLogConsole'],
            level: logLevel
        },
        logFile: {
            appenders: ['logFile'],
            level: 'all'
        }
    },
});



var log = {};

var infoLogger = log4js.getLogger('info');
var errorLogger = log4js.getLogger('error');
var debugLogger = log4js.getLogger('debug');

//封装错误日志
log.error = function (message, e) {
	const errorJson = "";
	try{
		if (!e) {
			errorJson = JSON.stringify(e);	
		}	
	} catch(ee){
		
	}
	
	var msg = errorJson.length > 0 ? message + ' Error => ' + errorJson : message;
	errorLogger.error(msg);
};

//封装响应日志
log.debug = function (message) {
    debugLogger.debug(message);
};

//封装响应日志
log.info = function (message) {
	infoLogger.info(message);
};

//封装响应日志
log.logReqStart = function (uniqueId, req) {
	debugLogger.debug('[' + uniqueId  + ']Execute Request url :' + req.originalUrl);
};

log.logReqEnd = function (uniqueId, req, wastSecond) {
	debugLogger.debug('  [' + uniqueId  + ']Request url :' + req.originalUrl + " total wast : " + wastSecond + ' second');
};

log.logReqError = function (uniqueId, req, wastSecond, e) {
	const errorJson = "";
	try{
		if (!e) {
			errorJson = JSON.stringify(e);	
		}	
	} catch(ee){
		
	}
	
	debugLogger.debug('  [' + uniqueId  + ']Request url ERROR :' + req.originalUrl + " execute error. Total wast : " + wastSecond +' second. Error =>' + errorJson);
};

module.exports = log ;