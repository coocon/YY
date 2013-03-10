var request = require('request')
  , EventProxy = require('eventproxy')
  , extend = require('./lib').extend
  , dom = require('./dom')
  , log = require('./log');

var selectors = {
    'content': '.AreaLL',
    'largeImg': '.box_4 .res_infobox .f_l_img img',
    'introduction': '.box_4 .res_infobox .f_r_info .r_d_info li:last', 
    'resourceList': '.box_4 .box_1 .resod_list', 
    'resourceName': '.l a', 
    'resourceSize': '.l .b .f5',
    'resourceLinks': '.r a'
};

function parseLinks(links) {
    var obj = {};
    if (!links || links.length == 0) {
        return obj; 
    }
    for (var i=0,len=links.length; i<len; i++) {
        //电驴
        if (links[i].getAttribute('type') == 'ed2k') {
            obj['easymule'] = links[i].href; 
        } 
        //迅雷
        if (links[i].getAttribute('thunderhref')) {
            obj['thunder'] = links[i].getAttribute('thunderhref');
        }
    }
    return obj;
}

function parseResource(lis, $) {
    var obj = {};
    for (var i=0,len=lis.length; i<len; i++) {
        var li = $(lis[i]) 
          , format = li.attr('format') 
          , resourceName = li.find(selectors['resourceName']).attr('title') 
          , resourceSize = li.find(selectors['resourceSize']).html() 
          , resourceLinks = parseLinks(li.find(selectors['resourceLinks']));   

        if (!obj[format]) {
            obj[format] = []; 
        } 
        obj[format].push({
            'resourceName': resourceName, 
            'resourceSize': resourceSize,
            'resourceLinks': resourceLinks 
        });
    }
    return obj;
} 

function total(list) {
    var count = 0;
    for (var i=0,len=list.length; i<len; i++) {
        var lis = list[i].getElementsByTagName('li');
        count += lis.length;
    } 
    log.write('共有' + count + '个资源');
}

function parseResourceList(list, $) {
    var resource = {};
    if (!list || list.length == 0) return resource;
    list = Array.prototype.splice.call(list, 0);
    total(list, $);
    for (var i=0,len=list.length; i<len; i++) {
        var ul = list[i] 
          , season = ul.getAttribute('season')
          , lis = ul.getElementsByTagName('li');
        if (!resource[season]) {
            resource[season] = {} 
        }               
        lis = Array.prototype.splice.call(lis, 0);
        if (!lis || lis.length == 0) {
            break; 
        }
        extend(resource[season], parseResource(lis, $));
    }
    return resource;
}

function parseIntroduction(el) {
    var childs = el.childNodes;
    for (var i=childs.length-1; i>=0; i--) {
        if (childs[i].nodeType == 1 && childs[i].style.display == 'none') {
            return childs[i].innerHTML; 
        } 
    }
    return '';
}

function parse(html, callback, d) {
    dom(html, function(window) {
        var $ = window.$       
          , content = $(selectors['content']);
          
        callback({
            'largeImg': content.find(selectors['largeImg']).attr('src'),    
            'introduction': parseIntroduction(content.find(selectors['introduction'])[0]), 
            'resources': JSON.stringify(parseResourceList(content.find(selectors['resourceList']), $)) 
        }, d);
    });
}

function item(url, callback) {
    var ep = new EventProxy();
    ep.assign('item', function(html) {
        log.write('开始解析DOM...');
        parse(html, callback, new Date()); 
    });
    request({
        'url': url,             
        'method': 'get'
    }, function(err, response, body) {
        log.write('页面请求成功!!!');
        ep.emit('item', body); 
    });
}

module.exports = item;



