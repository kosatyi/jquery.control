var walker = require('filewalker');
var fs = require('fs');

module.exports = function(dir,output,done){
    var list   = [];
    var base     = dir.concat('/');
    walker(dir).on('file', function(path){
        list.push(path);
    }).on('done',function(){
        var contents;
        var result   = {};
        list.forEach(function(path){
            contents = fs.readFileSync(base.concat(path));
            result[path] = contents.toString();
        });
        fs.writeFileSync(output,JSON.stringify(result));
        done && done();
    }).walk();
};