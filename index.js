/*
 * 获取YYeTs.com 的resourcelist
 */

var list = require('./list')
  , page = 1;

function data() {

    
    list(page, function(list) {
        page++;
        data();
    });
}

function main() {
    data();
}

main();
