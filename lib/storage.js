var knox = require('knox');
var snappy = require('snappy');
var path = require('path');

/*
 var obj = {
 foo : "bar"
 };
 writePattern(obj, function(e, id) {
 if (!e) {
 console.log('finished. file id: ' + id);
 //now load data back
 loadPattern(id, function(id, content) {
 console.log('finished. file ' + id + ' content: ', content);
 });

 } else {
 console.error(e)
 }
 });
 */

module.exports = (function() {
    var config = {
        's3' : {
            key : 'KEY',
            secret : 'SECRET',
            bucket : 'BUCKET',
            folder : 'FOLDER'
        }
    }

    var client = knox.createClient({
        key : config.s3.key,
        secret : config.s3.secret,
        bucket : config.s3.bucket
    });

    /**
     * Generates pattern id
     * @param {Number} l length of id (default 5)
     */
    var getPatternId = function(l) {
        l = (l) ? l : 5;
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < l; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }
    /**
     * Write new pattern to s3
     * @param {Object} pattern
     * @param {Object} cb
     */
    var writePattern = function(pattern, cb) {
        generateName(function(file) {
            //pattern = snappy.compressSync(JSON.stringify(pattern));
            //console.log('compressSync', pattern);

            pattern = JSON.stringify(pattern);
            var req = client.put(file.name, {
                'Content-Length' : pattern.length,
                'Content-Type' : 'text/plain'
            });
            req.on('response', function(res) {
                if (200 == res.statusCode) {
                    cb(false, file.id)
                } else {
                    cb({
                        message : 'Amazon S3 error! Cannot write.',
                        response : res
                    }, false);
                }
            });
            req.end(pattern);
        });
    }
    /**
     * Load patter
     * @param {Object} id
     * @param {Object} cb
     */
    var loadPattern = function(patternId, cb) {
        var fileName = path.join(config.s3.folder, patternId + '.json');
        var data = '';
        client.get(fileName).on('response', function(res) {
            if (res.statusCode == 200) {
                res.setEncoding('utf8');
                res.on('data', function(chunk) {
                    data += chunk;
                });
                res.on('end', function(d) {
                    //var pattern = snappy.decompressSync(''+data);
                    //console.log('decompressSync', pattern);
                    var pattern = JSON.parse(data);
                    cb(patternId, pattern);
                });
            } else {
                cb(false, {});
            }
        }).end();
    }
    /**
     * Generate new name of pattern file and check for existing file
     * @param {Object} cb
     * @param {Object} counter
     */
    var generateName = function(cb, counter) {
        counter = (counter) ? counter : 0;
        var patternId = getPatternId();
        var fileName = path.join(config.s3.folder, patternId + '.json');
        client.getFile(fileName, function(err, res) {
            if (err) {
                throw 'Amazon S3 error! There was a problem with Amazon S3 file validation.'
            }
            if (res.statusCode === 404) {
                cb({
                    id : patternId,
                    name : fileName
                });
            } else {
                if (counter >= 10) {
                    throw 'Amazon S3 error! To many duplicate file ids generated.'
                }
                //file exists so try again
                generateName(cb, (counter + 1));
            }
        });
    }
    return {
        writePattern : writePattern,
        loadPattern : loadPattern,
        version : '0.0.1'
    };
})();
