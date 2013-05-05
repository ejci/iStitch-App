var stitch = function(img) {
    if ( typeof img === 'undefined')
        throw "No image to process";
    if (!(!!window.CanvasRenderingContext2D) || !(!!document.createElement("canvas").getContext) || !(!!window.HTMLCanvasElement))
        throw "No canvas support";
    var _p = {};
    var _palette = [];
    var _version = '0.0.1';
    /**
     * Reduce collor palete
     */
    var reduce = function(imgdata, palette) {
        function nearest(c) {
            var dist = 9999;
            var cr = c;
            for (var i = 0; i < palette.colors.length; i++) {
                var pc = palette.colors[i];
                //http://en.wikipedia.org/wiki/Color_quantization
                var d = Math.sqrt(Math.pow(pc.r - c.r, 2) + Math.pow(pc.g - c.g, 2) + Math.pow(pc.b - c.b, 2));
                if (d < dist) {
                    cr = pc;
                    dist = d;
                }
            }
            return cr;
        }

        palette = (palette) ? palette : _palette[0];
        var d = imgdata.data;
        for (var i = 0; i < d.length; i += 4) {
            var c = nearest({
                r : d[i],
                g : d[i + 1],
                b : d[i + 2]
            });
            d[i] = c.r;
            d[i + 1] = c.g;
            d[i + 2] = c.b;
            d[i + 3] = d[i + 3];
        }
        imgdata.data = d;
        return imgdata;
    }
    /**
     * Convert to grayscale
     */
    var grayscale = function(imgdata) {
        var d = imgdata.data;
        for (var i = 0; i < d.length; i += 4) {
            var r = d[i];
            var g = d[i + 1];
            var b = d[i + 2];
            var v = 0.2126 * r + 0.7152 * g + 0.0722 * b;
            d[i] = d[i + 1] = d[i + 2] = v
        }
        imgdata.data = d;
        return imgdata;
    }
    /**
     * Adjust brightnes of image
     */
    var brightness = function(imgdata, adjustment) {
        if (adjustment == 0) {
            return imgdata;
        }
        var d = imgdata.data;
        for (var i = 0; i < d.length; i += 4) {
            d[i] += adjustment;
            d[i + 1] += adjustment;
            d[i + 2] += adjustment;
        }
        imgdata.data = d;
        return imgdata;
    }
    var stitchies = function(imgdata, opt) {
        var pattern = {
            rows : 0,
            cols : 0,
            data : []
        }
        var p = {};
        p.cols = opt.cols;
        p.size = (_p.width / p.cols);
        p.rows = Math.floor(1 / p.size * _p.height);
        //first canvas to scale down
        var smallCanvas = document.createElement('canvas');
        smallCanvas.height = img.height * (1 / p.size);
        smallCanvas.width = img.width * (1 / p.size);
        var context = smallCanvas.getContext('2d');
        context.drawImage(img, 0, 0, p.cols, p.rows);
        imgdata = context.getImageData(0, 0, p.cols, p.rows);

        //add brightness
        if (opt.brightness) {
            imgdata = brightness(imgdata, opt.brightness);
        }

        //grayscale
        if (opt.grayscale) {
            imgdata = grayscale(imgdata);
            //if grayscale then grayscale palette
            opt.palette = _palette[0];
        }
        //reduce colors
        imgdata = reduce(imgdata, opt.palette);
        var colors = [];
        var getColor = function(color) {
            var id = 0;
            for (var x = 0; x < colors.length; x++) {
                var c = colors[x];
                if (color.r === c.r && color.g === c.g && color.b === c.b) {
                    return x;
                }
                id++;
            }
            //nothing founded. add new color and return id;
            colors.push(color);
            return (id);
        };
        for (var row = 0; row < p.rows; row++) {
            pattern.data[row] = [];
            for (var col = 0; col < p.cols; col++) {
                var dist = (row * p.cols + col) * 4
                var c = {};
                //if no transparency
                if (imgdata.data[dist + 3] !== 0) {
                    c.r = imgdata.data[dist + 0];
                    c.g = imgdata.data[dist + 1];
                    c.b = imgdata.data[dist + 2];
                } else {
                    //transparent = white color
                    c.r = 255;
                    c.g = 255;
                    c.b = 255;
                }
                c.a = 255;
                //find color or push color
                var hc = {
                    c : getColor(c)
                };
                /*
                 c.r = imgdata.data[dist + 0];
                 c.g = imgdata.data[dist + 1];
                 c.b = imgdata.data[dist + 2];
                 c.a = imgdata.data[dist + 3];
                 */
                pattern.data[row].push(hc);
            }
        }

        pattern.cols = p.cols;
        pattern.rows = p.rows;
        pattern.colors = colors;
        return pattern;
    }
    /**
     * Prepare canvas
     */

    var prepareCanvas = function() {
        _p.width = img.width;
        _p.height = img.height;
        //console.log('img.width', _p.width);
        //console.log('img.height', _p.height);
        //create canvas
        //canvas = document.createElement('canvas');
        _p.canvas = document.getElementById('canvas');
        _p.ctx = canvas.getContext('2d');
        _p.canvas.setAttribute('width', _p.width);
        _p.canvas.setAttribute('height', _p.height);
        _p.ctx = _p.canvas.getContext('2d');
        _p.ctx.drawImage(img, 0, 0);
        _p.data = _p.ctx.getImageData(0, 0, _p.width, _p.height);

    }
    var processStitches = function(opt) {
        opt = (opt) ? opt : {};
        opt.cols = (opt.cols) ? opt.cols : 25;
        opt.palette = (opt.palette) ? _palette[opt.palette] : _palette[1];
        prepareCanvas();
        //_p.data = reduce(_p.data, opt.palette);
        _p.stitchies = stitchies(_p.data, opt);
        _p.stitchies.timestamp = (new Date()).getTime();

    };
    var getPattern = function(opt) {
        if (_p.stitchies) {
            _p.stitchies.type = 'x';
            _p.stitchies.version = _version;
            return _p.stitchies;
        }
        return false;
    }
    var getCanvas = function(opt, stitchies) {
        _p.stitchies = (stitchies) ? stitchies : _p.stitchies;
        if (_p.stitchies) {
            var offset = 10;
            opt = (opt) ? opt : {};
            //options
            opt.width = (opt.width) ? opt.width : 600;
            opt.grid = (opt.grid) ? opt.grid : false;
            opt.pixels = (opt.pixels) ? opt.pixels : false;

            //width and heigt
            var size = Math.floor((opt.width / _p.stitchies.cols));
            opt.width = _p.stitchies.cols * size + offset;
            opt.height = _p.stitchies.rows * size + offset;

            //new canvas
            var newCanvas = document.createElement('canvas');
            newCanvas.setAttribute('width', opt.width + offset);
            newCanvas.setAttribute('height', opt.height + offset);
            newCanvas.width = opt.width + offset;
            newCanvas.height = opt.height + offset;
            var newCtx = newCanvas.getContext('2d');
            //background
            newCtx.beginPath();
            newCtx.fillStyle = 'rgba(255,255,255,255)';
            newCtx.fillRect(0, 0, opt.width + offset, opt.height + offset);
            newCtx.stroke();
            //grid x
            for (var x = 1; x < _p.stitchies.cols; x++) {
                newCtx.beginPath();
                if ((x % 10) == 0) {
                    newCtx.strokeStyle = 'rgba(100,100,100,255)';
                    newCtx.lineWidth = 1;
                    newCtx.moveTo(offset + x * size, 0);
                    newCtx.lineTo(offset + x * size, opt.height + 2 * offset);
                } else {
                    newCtx.strokeStyle = 'rgba(200,200,200,200)';
                    newCtx.lineWidth = 1;
                    newCtx.moveTo(offset + x * size, offset + 0);
                    newCtx.lineTo(offset + x * size, opt.height);
                }
                newCtx.stroke();
                newCtx.closePath();
            }
            //grid y
            for (var y = 1; y < _p.stitchies.rows; y++) {
                newCtx.beginPath();
                if ((y % 10) == 0) {
                    newCtx.strokeStyle = 'rgba(100,100,100,255)';
                    newCtx.lineWidth = 1;
                    newCtx.moveTo(0, offset + y * size);
                    newCtx.lineTo(opt.width + 2 * offset, offset + y * size);
                } else {
                    newCtx.strokeStyle = 'rgba(200,200,200,200)';
                    newCtx.lineWidth = 1;
                    newCtx.moveTo(offset + 0, offset + y * size);
                    newCtx.lineTo(opt.width, offset + y * size);
                }
                newCtx.stroke();
                newCtx.closePath();
            }

            //stitchies
            for (var x = 0; x < _p.stitchies.cols; x++) {
                for (var y = 0; y < _p.stitchies.rows; y++) {
                    newCtx.beginPath();
                    var c = _p.stitchies.data[y][x];
                    c = _p.stitchies.colors[c.c];
                    //ignore white :)
                    if ((c.r + c.g + c.b) != (255 * 3)) {
                        newCtx.strokeStyle = 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',255)';

                        newCtx.lineWidth = 2;
                        newCtx.lineCap = 'round';
                        // line \
                        newCtx.moveTo((offset + x * size), (offset + y * size));
                        newCtx.lineTo((offset + x * size) + size, (offset + y * size) + size);
                        newCtx.stroke();
                        // line /
                        newCtx.moveTo((offset + x * size) + size, (offset + y * size));
                        newCtx.lineTo((offset + x * size), (offset + y * size) + size);
                        newCtx.stroke();
                        newCtx.closePath();
                    }
                }
            }

            return newCanvas;
        } else {
            throw "No stitchies.."
        }
    };
    _palette = palette;
    //public methods
    return {
        processStitches : processStitches,
        getPattern : getPattern,
        getCanvas : getCanvas
    }
};
var palette = [];
palette[0] = {
    name : '2-bit Grayscale',
    colors : [{
        r : 0,
        g : 0,
        b : 0
    }, {
        r : 104,
        g : 104,
        b : 104
    }, {
        r : 184,
        g : 184,
        b : 184
    }, {
        r : 255,
        g : 255,
        b : 255
    }]
};
palette[1] = {
    name : '3-bit RGB',
    def : true,
    colors : [{
        r : 0,
        g : 0,
        b : 0
    }, {
        r : 0,
        g : 39,
        b : 251
    }, {
        r : 0,
        g : 249,
        b : 44
    }, {
        r : 0,
        g : 252,
        b : 255
    }, {
        r : 255,
        g : 48,
        b : 22
    }, {
        r : 255,
        g : 63,
        b : 252
    }, {
        r : 255,
        g : 255,
        b : 51
    }, {
        r : 255,
        g : 255,
        b : 255
    }]
};
palette[2] = {
    name : '4-bit RGBI',
    colors : [{
        r : 0,
        g : 0,
        b : 0
    }, {
        r : 0,
        g : 18,
        b : 144
    }, {
        r : 0,
        g : 143,
        b : 21
    }, {
        r : 0,
        g : 144,
        b : 146
    }, {
        r : 155,
        g : 23,
        b : 7
    }, {
        r : 154,
        g : 32,
        b : 145
    }, {
        r : 148,
        g : 145,
        b : 25
    }, {
        r : 184,
        g : 184,
        b : 184
    }, {
        r : 104,
        g : 104,
        b : 104
    }, {
        r : 0,
        g : 39,
        b : 251
    }, {
        r : 0,
        g : 249,
        b : 44
    }, {
        r : 0,
        g : 252,
        b : 255
    }, {
        r : 255,
        g : 48,
        b : 22
    }, {
        r : 255,
        g : 63,
        b : 252
    }, {
        r : 255,
        g : 255,
        b : 51
    }, {
        r : 255,
        g : 255,
        b : 255
    }]
};
palette[3] = {
    name : '3-level RGB',
    colors : [{
        r : 0,
        g : 0,
        b : 0
    }, {
        r : 0,
        g : 18,
        b : 144
    }, {
        r : 0,
        g : 39,
        b : 251
    }, {
        r : 155,
        g : 23,
        b : 7
    }, {
        r : 149,
        g : 47,
        b : 251
    }, {
        r : 255,
        g : 48,
        b : 22
    }, {
        r : 255,
        g : 52,
        b : 146
    }, {
        r : 255,
        g : 63,
        b : 252
    }, {
        r : 0,
        g : 143,
        b : 21
    }, {
        r : 0,
        g : 144,
        b : 146
    }, {
        r : 0,
        g : 148,
        b : 252
    }, {
        r : 148,
        g : 145,
        b : 25
    }, {
        r : 146,
        g : 146,
        b : 146
    }, {
        r : 142,
        g : 150,
        b : 252
    }, {
        r : 255,
        g : 150,
        b : 33
    }, {
        r : 255,
        g : 154,
        b : 253
    }, {
        r : 0,
        g : 249,
        b : 44
    }, {
        r : 0,
        g : 250,
        b : 150
    }, {
        r : 0,
        g : 255,
        b : 254
    }, {
        r : 128,
        g : 250,
        b : 46
    }, {
        r : 126,
        g : 251,
        b : 150
    }, {
        r : 120,
        g : 253,
        b : 254
    }, {
        r : 255,
        g : 253,
        b : 51
    }, {
        r : 255,
        g : 253,
        b : 152
    }, {
        r : 255,
        g : 255,
        b : 255
    }]
};
window.stitch = stitch;
window.palette = palette;
