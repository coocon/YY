var request = require('request')
  , EventProxy = require('eventproxy')
  , extend = require('./lib').extend
  , dom = require('./dom');

var selectors = {
    'content': '.AreaLL',
    'largeImg': '.box_4 .res_infobox .f_l_img img',
    'description': '.box_4 .res_infobox .f_r_info .r_d_info li:last', 
    'movieList': '.box_4 .box_1 .resod_list', 
    'movieName': '.l a', 
    'movieSize': '.l .b .f5',
    'movieLinks': '.r a'
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

function parseMovie(lis, $) {
    var obj = {};
    for (var i=0,len=lis.length; i<len; i++) {
        var li = $(lis[i]) 
          , format = li.attr('format') 
          , movieName = li.find(selectors['movieName']).attr('title') 
          , movieSize = li.find(selectors['movieSize']).html() 
          , movieLinks = parseLinks(li.find(selectors['movieLinks']));    

        if (!obj[format]) {
            obj[format] = []; 
        } 
        obj[format].push({
            'movieName': movieName, 
            'movieSize': movieSize,
            'movieLinks': movieLinks 
        });
    }
    return obj;
} 

function parseMovieList(list, $) {
    var movie = {};
    if (!list || list.length == 0) return movie;
    for (var i=0,len=list.length; i<len; i++) {
        var ul = $(list[i]) 
          , season = ul.attr('season')
          , lis = ul.find('li');
        if (!movie[season]) {
            movie[season] = {} 
        }               
        if (!lis || lis.length == 0) {
            break; 
        }
        extend(movie[season], parseMovie(lis, $));
    }
    return movie;
}

function parseDescription(el) {
    var childs = el.childNodes;
    for (var i=childs.length-1; i>=0; i--) {
        if (childs[i].nodeType == 1 && childs[i].style.display == 'none') {
            return childs[i].innerHTML; 
        } 
    }
    return '';
}

function parse(html, callback) {
    dom(html, function(window) {
        var $ = window.$       
          , content = $(selectors['content']);
          
        callback({
            'largeImg': content.find(selectors['largeImg']).attr('src'),    
            'description': parseDescription(content.find(selectors['description'])[0]), 
            'movie': parseMovieList(content.find(selectors['movieList']), $) 
        });
    });
}

function item(url, callback) {
    var ep = new EventProxy();
    ep.assign('item', function(html) {
        console.log('开始解析DOM...');
        parse(html, callback); 
    });
    request({
        'url': url,             
        'method': 'get'
    }, function(err, response, body) {
        console.log('页面请求成功!!!');
        ep.emit('item', body); 
    });
}

module.exports = item;



