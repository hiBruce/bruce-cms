module.exports = {
    'port':3000,
     //往前端渲染时，store里插入的值
     'setRenderDataFromSession': [],
    'redis': {
        'host': '10.100.23.107',
        'port': 6379,
        'password': 'foobared',
        'db': 10,
        'prefix': 'cms-', 
        'connect_timeout': 60*60*2
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
