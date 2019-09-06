/* 
* @description：栏目表
* @author     : hiBruce
*/

var Sequelize = require('sequelize');
var sequelize = require('./db');

// 创建 model
var Column = sequelize.define('column', {
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
let Columns = Column.sync();

// 添加新栏目
exports.addColumn = function (params) {
    // 向 user 表中插入数据
    return this.findByTitle(params.title).then(existIp => {
        if (existIp) {
            return Promise.reject(existIp)
        } else {
            return Columns.create(params);
        }
    })
};

exports.findByTitle = function (title) {
    return Columns.findOne({ where: { title: title } });
};

exports.findAll = function () {
    return Columns.findAll();
};
exports.update = (params) => {
    return Columns.findOne({ where: { id: params.id } })
        .then((ip) => {
            return Columns.update(params);
        })
}

exports.bulkCreate = (ColumnArr) => {
    return Columns.bulkCreate(ColumnArr, { updateOnDuplicate: ['title'] })
}

exports.destroy = id => {
    return Columns.destroy({ where: { id: id } })
}
