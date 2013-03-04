/*
 * 获取YYeTs.com 的resourcelist
 */

var list = require('./list')
  , page = 1;

function data() {

    console.log('正在获取第' + page + '页。');

    list(page, function(list) {
        page++;
        data();
    });
}

function main() {
    data();
}

main();
