var mkdirp = require('mkdirp');
var fs = require('fs');
var os = require('os');

function _createDir(path) {
    var result = true;
    if (!mkdirp.sync(path)) {
        result = false;
    }
    if (!result) {
        try {
            result = fs.existsSync(path);
        } catch (e) {
            throw new Error('文件系统错误, fs.existsSync 调用失败:' + e);
        }
    }
    return result;
}

function _getLocalIpV4(sName) {
    var netCards = _getNetCards(sName);

    if (!netCards) {
        return '127.0.0.1';
    }

    return _getIp(netCards, 'IPv4');
}

function _getLocalIpV6(sName) {
    var netCards = _getNetCards(sName);

    if (!netCards) {
        return '::1';
    }

    return _getIp(netCards, 'IPv6');
}

function _getNetCards(sName) {
    var interfaces = os.networkInterfaces();
    var netCards = interfaces[sName] ||
        interfaces['eth0'] ||
        interfaces['无线网络连接'] ||
        interfaces['本地连接'];

    return netCards;
}

function _getIp(aNetCards, sIpFamily) {
    for (var i = 0; i < aNetCards.length; i++) {
        if (aNetCards[i].family == sIpFamily) {
            return aNetCards[i].address;
        }
    }
}

function _getClientIp(req) {
    return req.headers['x-forwarded-for'] || _getTheOtherEndIp(req);
}

function _getTheOtherEndIp(req) {
    return req.ip || req._remoteAddress || (req.connection && req.connection.remoteAddress) || undefined;
}

function isNull(obj) {
    return (typeof (obj) === 'undefined') || (obj === null);
}

function isEmptyString(obj) {
    if (isNull(obj) || obj === '')
        return true;

    if (isArray(obj)) {

    } else if (isString(obj)) {
        return obj.trim().length === 0;
    }
}

function isEmptyObject(obj) {
    if (!obj) {
        return true;
    } else {
        return JSON.stringify(obj) == "{}";
    }
}

function isArray(o) {
    return Object.prototype.toString.call(o) == '[object Array]';
}

function isString(obj) {
    return typeof obj == 'string';
}


function isFunction(oFunNamebj) {
    try {
        if (typeof FunName === "function") {
            return true;
        } else {
            return false;
        }
    } catch (e) {
        return false;
    }

}

function _isEqual(obj1, obj2) {
    var o1 = obj1 instanceof Object;
    var o2 = obj2 instanceof Object;
    if (!o1 || !o2) {/*  判断不是对象  */
        return obj1 === obj2;
    }

    if (Object.keys(obj1).length !== Object.keys(obj2).length) {
        return false;
        //Object.keys() 返回一个由对象的自身可枚举属性(key值)组成的数组,例如：数组返回下表：let arr = ["a", "b", "c"];console.log(Object.keys(arr))->0,1,2;
    }

    for (var attr in obj1) {
        var t1 = obj1[attr] instanceof Object;
        var t2 = obj2[attr] instanceof Object;
        if (t1 && t2) {
            return _isEqual(obj1[attr], obj2[attr]);
        } else if (obj1[attr] !== obj2[attr]) {
            return false;
        }
    }
    return true;
}

function isHtmlRequest(req) {
    var headers = req.headers;
    let isHtml = true;
    if (req.method !== 'GET') {
        isHtml = false;
    } else if (!headers || typeof headers.accept !== 'string') {
        isHtml = false;
    } else if (headers.accept.indexOf('application/json') === 0) {
        isHtml = false;
    } else if (!acceptsHtml(headers.accept)) {
        isHtml = false;
    }
    return isHtml;
}

function acceptsHtml(header) {
    htmlAcceptHeaders = ['text/html', '*/*'];
    for (var i = 0; i < htmlAcceptHeaders.length; i++) {
        if (header.indexOf(htmlAcceptHeaders[i]) !== -1) {
            return true;
        }
    }
    return false;
}

function _isObject(obj){
    if(!obj){
        return false;
    }else{
        return typeof obj == 'object'
    }
}

exports.createDir = _createDir;
exports.getLocalIpV4 = _getLocalIpV4;
exports.getLocalIpV6 = _getLocalIpV6;
exports.getTheOtherEndIp = _getTheOtherEndIp;
exports.getClientIp = _getClientIp;
exports.isEmptyString = isEmptyString;
exports.isNull = isNull;
exports.isEmptyObject = isEmptyObject;
exports.isObject = _isObject
exports.isArray = isArray
exports.isFunction = isFunction;
exports.isEqual = _isEqual;
exports.isHtmlRequest = isHtmlRequest;