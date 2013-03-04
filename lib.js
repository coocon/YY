function extend(source, obj) {
    for (var key in obj) {
        source[key] = obj[key]; 
    }
}


exports.extend = extend;
