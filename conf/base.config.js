const path = require("path");
const resolve = file => path.resolve(__dirname, file);
const isProd = false;
let userConfig;
var util = require('../server/middleware/utils');
if (isProd) {
    userConfig = require("./base.prod.config.js")
} else {
    userConfig = require("./base.dev.config.js")
}
let lanoConfig = {
    'port': 3000,
    //是否开启gzip压缩，默认开发不开启，生产开启
    'gzip': false,
    'redis': {},
    //往前端渲染时，store里插入的值
    'setRenderDataFromSession': [],
    /*配置session*/
    'cms-session': {
        //session超时时间，默认为900s，即15min
        'timeout': 2 * 60 * 60,

        //浏览器中存储cookie的名称，默认为'lano.connect.sid'
        'name': 'cms.connect.sid',

        //cookie信息
        'cookie': {
            //cookie对应的domain属性值，false表示不带domain属性
            'domain': false,

            //cookie对应的path属性值，默认为根目录'/'
            'path': '/',

            //httpOnly属性，默认为true
            'httpOnly': true
        }
    },
    /**
    * 上传文件配置
    */
    'upload': {
        // 映射路径
        'mount-path': '/upfile',

        // 文件服务器提供商 local -本地文件服务器 , oss -阿里云oss服务器
        'upload-provider': 'local',

        // 临时目录位置
        'tempDir': './temp',

        // 本地文件服务器
        'local': {
            // 文件服务器位置
            'fileServerUrl': 'http://localhost:3000/upload',
            'location': 'upload'
        }
    }

}

module.exports = Object.assign(lanoConfig,userConfig);

/**
 * 合并APP本地配置信息与默认配置信息
 */
function fnMergConf(oSource, oTarget) {
    for (var key in oSource) {
        if ((key in oTarget) && util.isObject(oSource[key]) && !util.isArray(oSource[key])) {
            fnMergConf(oSource[key], oTarget[key]);
            continue;
        }
        oTarget[key] = oSource[key];
    }
}
