var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , log = require('./log')
  , db = 'mongodb://127.0.0.1/db';

mongoose.connect(db, function(err) {
    if (err) {
        log.write('数据库连接失败');
        log.write(err.message);
        process.exit(0);
    }
});

var MoiveSchema = new Schema({
    'name': { type: String },  
    'type': { type: String },
    'status': { type: String },
    'update': { type: Date },
    'url': { type: String },
    'introduction': { type: String }, 
    'largeImg': { type: String },
    'tinyImg': { type: String },
    'resources': { type: String }
});

mongoose.model('Moive', MoiveSchema);

exports.Moive = mongoose.model('Moive');
