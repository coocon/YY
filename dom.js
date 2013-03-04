var jsdom = require("jsdom")
  , jqueryPath = './jquery.js';
function dom(html, callback) {
    jsdom.env(html, [jqueryPath], function(errors, window) {
        if (errors) {
            console.log(errors); 
            return;
        } 
        callback(window);
    });
}

module.exports = dom;
