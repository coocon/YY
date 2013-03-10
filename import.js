var db = require('./db')
  , Moive = db.Moive;

function createMoive(newMoive, callback) {  
    var moive = new Moive();
    moive.name = newMoive.name;   
    moive.type = newMoive.type;
    moive.status = newMoive.status;
    moive.update = new Date(newMoive.date);
    moive.url = newMoive.url;
    moive.introduction = newMoive.introduction;
    moive.resources = newMoive.resources;
    moive.tinyImg = newMoive.tinyImg;
    moive.largeImg = newMoive.largeImg;
    moive.save(function(err, moive) {
        if (err) {
            return callback(err); 
        }         
        callback(null, moive);
    });
}

exports.createMoive = createMoive;
