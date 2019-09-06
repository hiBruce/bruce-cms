var express = require("express");
var path = require('path');
var fs = require('fs');
var uuid = require('uuid')
var multipart = require('connect-multiparty');
var router = express.Router();
var oConf = require("../../conf/base.config.js")['upload'];

// 创建临时文件目录
var tempDir = path.join(__dirname, '../../', oConf.tempDir || './temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir)
}

// 设置默认临时路径
var multipartMiddleware = multipart({ uploadDir: tempDir });

router.post('/', multipartMiddleware, function (req, res) {
    reciveFile(req, res, 'post');
});

module.exports = router;

/**
 * 接收上传的文件
 * @param req
 * @param res
 */
function reciveFile(req, res) {
    // 如果采用本地文件存储，则这里不做任何改动，如果采用阿里云存储，则这里还需要进行处理
    function applyFid(result) {
        result.fid = req.query.fid;
        result.filename = req.query.name;
        return result;
    }

    if (oConf['upload-provider'] == 'fdfs') {
        sendToFDFS(oConf['fdfs'], req).then(function (result) {
            if (req.files.upload) {
                var uploadResult = `<script type="text/javascript">window.parent.CKEDITOR.tools.callFunction('${req.query.CKEditorFuncNum}',' ${result.url}');</script>`
                res.send(uploadResult);
            } else {
                res.send(applyFid(result));
            }
        });
    } else {
        sendToLocal(req).then(function (result) {
            if (req.files.upload) {
                var uploadResult = `<script type="text/javascript">window.parent.CKEDITOR.tools.callFunction('${req.query.CKEditorFuncNum}',' ${result.url}');</script>`
                res.send(uploadResult);
            } else {
                res.send(applyFid(result));
            }
        });
    }
}

function sendToLocal(req) {
    return new Promise((resolve, reject) => {
        // 检查本地文件夹是否存在，如果不存在，则创建本地文件夹
        var uploadDir = path.join(__dirname, '../../', oConf['local'].location || 'upload');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir)
        }
        var baseUrl = oConf['local'].fileServerUrl;
        if (req.files) {
            if (req.files.upload) {
                req.files.Filedata = req.files.upload;
            }
            if (req.files.Filedata) {
                var filename = req.files.Filedata.name;
                var fileExt = getFileExtention(filename);
                var newFileName = generateUuidFileName() + fileExt;
                var newPath = path.join(uploadDir, newFileName);
                var newUrl = baseUrl + '/' + newFileName;

                // 保存文件到目录中去
                fs.rename(req.files.Filedata.path, newPath, function (err) {
                    if (err) {
                        reject({
                            resultCode: -1,
                            message: '上传失败',
                            success: false
                        })
                    } else {
                        resolve({
                            resultCode: 0,
                            message: '上传成功',
                            success: true,
                            filename: encodeURIComponent(req.files.Filedata.name),
                            size: req.files.Filedata.size,
                            url: newUrl
                        });
                    }

                });
            }
        } else {
            reject({
                resultCode: -1,
                message: '没有找到要上传的文件！',
                success: false
            })
        }
    })
}

function sendToFDFS(config, req) {
    return new Promise((resolve, reject) => {
        if (req.files) {
            let files = req.files.Filedata;
            if (!files) {
                files = req.files.file;
            }
            if (files) {
                var filename = files.name;
                var filepath = files.path;
                var filesize = files.size;
                var fileExt = getFileExtention(filename);
                if (fileExt.indexOf('.') == 0) {
                    fileExt = fileExt.substring(1);
                }
                var fs = require('fs');
                var FdfsClient = require('fdfs');
                var fdfsClient = new FdfsClient(config);
                var rs = fs.createReadStream(filepath);
                fdfsClient.upload(rs, {
                    size: filesize,
                    ext: fileExt
                }).then(function (fileId) {
                    var newUrl;
                    if (fileId.indexOf('/') > 0)
                        newUrl = config.serverUrl + '/' + fileId;
                    else
                        newUrl = config.serverUrl + fileId;

                    resolve({
                        resultCode: 0,
                        message: '上传成功',
                        success: true,
                        filename: encodeURIComponent(filename),
                        size: filesize,
                        url: newUrl
                    });
                }).catch(function (err) {
                    reject({
                        resultCode: -1,
                        message: '上传失败',
                        success: false
                    });
                });
            }
        } else {
            reject({
                resultCode: -1,
                message: '没有找到要上传的文件！',
                success: false
            })
        }
    })

}


// 获取文件扩展名
function getFileExtention(fname) {
    return fname.substring(fname.lastIndexOf('.'));
}

// 产生一个uuid随机字符串
function generateUuidFileName() {
    return uuid.v1();
}