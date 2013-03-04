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
    item(source.url, function(obj) {
        extend(source, obj);  
        callback(source);
    });   
}

function parse(html, callback) {
    dom(html, function(window) {
        var ep = new EventProxy() 
          , $ = window.$
          , list = $(selectors['list']);
        
        if (!list || list.length == 0) {
            console.log('获取resourcelist失败，可能是由于页面结构改变导致的！！！'); 
            process.exit();
        }
         
        ep.after('parse', list.length, callback);
         
        list.each(function(i, item, list) {  
            var item = $(item);
            mergeItem({
                'tinyImg': item.find(selectors['tinyImg']).attr('src'),
                'url': item.find(selectors['url']).attr('href'), 
                'name': parseName(item),            
                'type': parseType(item),
                'status': parseStatus(item),
                'update': parseUpdate(item)
            }, function(obj) {
                console.log(obj);
                ep.emit('parse', obj);
            });
        });

    });  
}

function list(page, callback) {
    var ep = new EventProxy();

    ep.assign('list', function(html) {
        parse(html, callback); 
    });;
    request({
        'url': 'http://www.yyets.com/php/resourcelist?page=' + page,          
        'method': 'get',
    }, function(err, response, body) {
        ep.emit('list', body); 
    });
}

module.exports = list;
