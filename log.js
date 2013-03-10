var fs = require('fs')
  , path = './logFile'
  
  , log = fs.createWriteStream(path, {'flag': 'a'});

exports.write = function(str) {
    log.write(str + '\n');
    console.log(str);
}
