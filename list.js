var request = require('request')
  , EventProxy = require('eventproxy')
  , dom = require('./dom')
  , extend = require('./lib').extend
  , item = require('./item');

var selectors = {
    'list': '.box_4.res_listview .box_1 .boxPadd li',
    'tinyImg': '.f_l_img img', 
    'url': '.f_l_img a',
    'name': '.f_r_info dl dt a strong', 
    'type': '.f_r_info dl dt a', 
    'status': '.f_r_info dl dt',
    'update': '.f_r_info dl dd.list_a span:last'
}

function parseName(item) {
    var html = item.find(selectors['name']).html()
      , reg = /^《.+》/
      , name = reg.exec(html)[0]; 
    return name.replace('《','').replace('》', '')
}
function parseType(item) {
    var html = item.find(selectors['type']).html()
      , type = html.split('<strong>')[0];
    return type.replace('【', '').replace('】', '')
}
function parseStatus(item) {
    var html = item.find(selectors['status']).html() 
      , status = html.split('</a>')[1]; 
    return status.replace('[', '').replace(']', '');
}
function parseUpdate(item) {
    var html = item.find(selectors['update']).html() 
        update = html.split('</font>')[1].split('|')[0].trim();
    return update;
}

function mergeItem(source, callback) {
    console.log('开始获取影片<<' + source.name + '>>');
    console.log('正在请求页面: ' + source.url);
    item(source.url, function(obj) {
        extend(source, obj);  
        callback(source);
    });   
}

function parse(html, callback) {
    console.log('正在解析影片列表页DOM...');
    dom(html, function(window) {
        var ep = new EventProxy() 
          , $ = window.$
          , arr = []
          , list = $(selectors['list'])
          , total = list.length
          , progress = 0;
        
        if (!list || total == 0) {
            console.log('解析失败，可能是由于页面结构改变导致的！！！'); 
            process.exit();
        }
         
        ep.after('parse', total, callback);

        console.log('DOM解析成功，本页共有' + total + '部影片!!!');
        console.log('...............................................');
         
        //转化为数组
        list.each(function(i, item, list) {  
            arr.push(item);
        });

        (function (item) {
            if (!item) return;
            var item = $(item),
            fun = arguments.callee;
            mergeItem({
                'tinyImg': item.find(selectors['tinyImg']).attr('src'),
                'url': item.find(selectors['url']).attr('href'), 
                'name': parseName(item),            
                'type': parseType(item),
                'status': parseStatus(item),
                'update': parseUpdate(item)
            }, function(obj) {
                console.log('页面DOM解析成功!!!')
                console.log('影片<<' + obj.name + '>>获取成功!!!');
                console.log('当前完成' + String(Math.floor((++progress)/total * 100)) + '%');
                console.log('...............................................');
                ep.emit('parse', obj);
                //递归调用自己,从而遍历整个list
                fun.call(null, arr.shift());
            });       
        })(arr.shift())

    });  
}

function list(page, callback) {
    var ep = new EventProxy();

    ep.assign('list', function(html) {
        parse(html, callback); 
    });
    
    console.log('正在请求第' + page + '页影视列表...');
    request({
        'url': 'http://www.yyets.com/php/resourcelist?page=' + page,          
        'method': 'get',
    }, function(err, response, body) {
        console.log('请求成功!!!');
        ep.emit('list', body); 
    });
}

module.exports = list;
