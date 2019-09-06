/* 
* @description：栏目表
* @author     : hiBruce
*/

var Sequelize = require('sequelize');
var sequelize = require('./db');

// 创建 model
var Article = sequelize.define('article', {
    title: {
        type: Sequelize.STRING,
    },
    intro:{
        type: Sequelize.STRING,
    },
    sort:{//排序
        type:Sequelize.NUMBER
    },
    link:{//link
        type: Sequelize.STRING,
    }
}, {
        freezeTableName: false
    }
);

// 创建表
// XX.sync() 会创建表并且返回一个Promise对象
// 如果参数 force = true 则会把存在的表（如果users表已存在）先销毁再创建表
// 默认情况下 forse = false
let Articles = Article.sync();

// 添加新栏目
exports.addColumn = function (params) {
    // 向 user 表中插入数据
    return this.findByTitle(params.title).then(existIp => {
        if (existIp) {
            return Promise.reject(existIp)
        } else {
            return Articles.create(params);
        }
    })
};

exports.findByTitle = function (title) {
    return Articles.findOne({ where: { title: title } });
};

exports.findAll = function () {
    return Articles.findAll();
};
exports.update = (params) => {
    return Articles.findOne({ where: { id: params.id } })
        .then((ip) => {
            return Articles.update(params);
        })
}

exports.bulkCreate = (ArticleArr) => {
    return Articles.bulkCreate(ArticleArr, { updateOnDuplicate: ['title'] })
}

exports.destroy = id => {
    return Articles.destroy({ where: { id: id } })
}
