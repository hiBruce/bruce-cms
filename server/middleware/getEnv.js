/*
 * @description 获取当前环境
 * @return [string]
 */
let env = JSON.stringify(process.env.NODE_ENV) || 'development';

switch (env) {
    case 'dev':
        env = '"development"';
        break;
    case 'pro':
        env = '"production"';
        break;
    default:
        env = '"development"';
        break;

}

function getEnv() {
    return env;
}

function isProd() {
    if (env == '"production"') {
        return true;
    } else {
        return false;
    }
}


module.exports = {
    getEnv: getEnv,
    isProd: isProd
}