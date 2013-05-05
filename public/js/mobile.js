/**
 * :( hack... i realy dont like this
 */
var hash = window.location.hash;
if (!(/mobile/i.test(hash) || hash.length < 3)) {
    window._patternId = hash.substr(2, 100);
    window.location = '#mobile-share';
}

$(document).ready(function() {
    //get static content
    $('head').append('<meta name="viewport" content="width=device-width, initial-scale=1">');
    $('#mobile-faq .content').html($('#app-desktop .content-faq').html());
    $('#app-desktop').empty();
    $('#app-mobile').show();
    $('#app-loader').hide();
    //APP
    var m = {};
    m.apple = {};
    m.android = {};
    m.apple.os = (navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false );
    m.android.os = (navigator.userAgent.match(/android/i) ? true : false );
    var fileChooser = (m.apple.os) ? $('#inputFile') : $('#inputMobileFile');
    if (m.apple.os) {
        $('.ios').show();
    } else if (m.android.os) {
        $('.otherOs').show();
    } else {
        $('.unsuportedOs').show();
    }
    $('#sendMessageMobile').click(function() {
        var s = $('#messageSubjectMobile').val();
        var b = $('#messageBodyMobile').val();
        if (s !== '' && b !== '') {
            window.open('mailto:miroslav.magda@ejci.net?subject=' + s + '&body=' + b);
        }
    });
    $('#convertMobileImage').click(function(e) {
        $('#inputFile').trigger('click');
    });
    $('#buttonOptionsMobile').click(function(e) {
        $("#optionsPanel").panel("open");
    });
    $('#buttonApplyOptionsMobile').click(function(e) {
        $("#optionsPanel").panel("close");
        process.applyOptions();
    });
    $('#buttonSaveMobile').click(function(e) {
        process.download();
    });
    $('#buttonShareMobile').click(function(e) {
        process.share();
    });

    $('#buttonSaveShareMobile').click(function() {
        $('#buttonSaveMobile').click();
    });
    //console.log(fileChooser);
    fileChooser.change(function(e) {
        var file = e.target.files[0];
        process.start(file);
    });
    var xst = {};
    var process = {};
    process.start = function(file) {
        if (file) {
            //console.log('file.type', file.type);
            if (file.type === "image/jpeg" || file.type === "image/jpg") {
                loader.start();
                canvasResize(file, {
                    width : 100,
                    height : 100,
                    crop : false,
                    quality : 100,
                    callback : function(data, w, h) {
                        $('#image').attr('src', data);
                        $('#image').attr('width', w);
                        $('#image').attr('height', h);
                        $('#image').load(function() {
                            process.image();
                        });

                    }
                });
            } else {
                alert('Sorry :( You are trying to use unsuported file type.');
            }
        }
    };
    process.share = function() {
        loader.start();
        var pattern = JSON.stringify(xst.getPattern());
        $.post("/share/save", {
            pattern : pattern
        }).fail(function(e) {
            alert('Something went wrong...');
            loader.finish();
        }).done(function(data) {
            var url = "http://istitchapp.com/#/" + data.patternId;
            $("#resultCanvasShareMobile input[name='shareUrl']").val(url);
            $("#resultCanvasShareMobile").show();
            loader.finish();
        });
    }
    process.showResult = function(xst, cb) {
        cb = (cb) ? cb : function() {
        };
        var can = xst.getCanvas();
        var pattern = xst.getPattern();
        $("#resultCanvasShareMobile").hide();
        $('#resultCanvasMobile').html(can);
        $('#resultCanvasMobile canvas').css('width', '80%');
        $('#resultCanvasInfoMobile').html('<div><b>Size: </b>' + pattern.rows + ' <small>x</small> ' + pattern.cols + '<div>');
        var d = $('<div><b>Used colors: </b></div>')
        for (var j = 0; j < pattern.colors.length; j++) {
            var c = pattern.colors[j];
            d.append('<span class="color" style="background-color: rgb(' + c.r + ', ' + c.g + ', ' + c.b + ')"></span>');
        }
        $('#resultCanvasInfoMobile').append(d);
        $('#marketingMobile').slideUp(500, function() {
            $('#resultMobile').slideDown(500);
            cb();
        });

    };
    process.applyOptions = function() {
        loader.start();
        var cols = $("#optionsPanel input[name='cols']").val();
        var palette = $("#optionsPanel input[name='colors']:checked").val();
        xst.processStitches({
            cols : (parseInt(cols, 10) > 100) ? 100 : parseInt(cols, 10),
            palette : palette
        });
        process.showResult(xst, function() {
            loader.finish();
        });
    };
    process.download = function() {
        loader.start();
        var can = xst.getCanvas({
            width : 800
        });
        var dataURL = can.toDataURL("image/png");
        var f = $('<form action="/download" target="_blank" method="POST"></form>');
        var v = $('<input name="image" type="text" value="' + dataURL + '"/>');
        f.append(v);
        f.submit();
        loader.finish();
    }
    process.loadPattern = function(patternId) {
        $('#sharedCanvasMobile').show();
        if (patternId.length < 5) {
            $('#sharedCanvasMobile').html('<h4>There isn\'t such a pattern :(</h4><p>Check your link please</p>');
            $('#sharedCanvasMobile').hide();
            return;
        }
        xst = new stitch(document.getElementById('image'));
        $.getJSON('share/load/' + patternId, function(pattern) {
            if (!pattern.error) {
                var can = xst.getCanvas(false, pattern);
                $('#sharedCanvasMobile').html(can);
                $('#sharedCanvasMobile canvas').css('width', '80%');
                $('#sharedCanvasInfoMobile').html('<div><b>Size: </b>' + pattern.cols + ' <small>x</small> ' + pattern.rows + '<div>');
                var d = $('<div><b>Used colors: </b></div>')
                for (var j = 0; j < pattern.colors.length; j++) {
                    var c = pattern.colors[j];
                    d.append('<span class="color" style="background-color: rgb(' + c.r + ', ' + c.g + ', ' + c.b + ')"></span>');
                }
                $('#sharedCanvasInfoMobile').append(d);
                $('#sharedCanvasMetaMobile').show(500);
            } else {
                $('#sharedCanvasMobile').html('<h4>There isn\'t such a pattern :(</h4><p>Check your link please</p>');
                $('#sharedCanvasMobile').hide();
            }
        });

    };
    process.image = function() {
        try {
            loader.start();
            var cols = $("#optionsPanel input[name='cols']").val();
            var palette = $("#optionsPanel input[name='colors']:checked").val();
            xst = new stitch(document.getElementById('image'));
            xst.processStitches({
                cols : (parseInt(cols, 10) > 100) ? 100 : parseInt(cols, 10),
                palette : palette
            });
            process.showResult(xst, function() {
                loader.finish();
            });

        } catch(e) {
            loader.finish();
            alert('Sorry :( Something went wrong...');
        }
    }
    /**
     * Loader (progress)
     */
    var loader = {};
    loader.running = false;
    loader.count = 0;
    loader.start = function() {
        loader.running = true;
        $.mobile.loading("show");
    }
    loader.update = function(msg) {
    }
    loader.finish = function() {
        $.mobile.loading("hide");
        loader.running = false;
        loader.count++;
    };

    //$('#colorsMobile').empty();
    //$('#colorsMobile').empty();
    for (var i = 0; i < palette.length; i++) {
        var r = $('<label class="radio"></label>');
        var p = palette[i]

        r.append('<input type="radio" ' + ((p.def) ? 'checked' : '') + ' name="colors" value="' + i + '">');
        for (var j = 0; j < p.colors.length; j++) {
            var c = p.colors[j];
            r.append('<span class="color" style="background-color: rgb(' + c.r + ', ' + c.g + ', ' + c.b + ')"></span>');
        }
        $('#colorsMobile').append(r);
        $('#colorsMobile').append('<br /><br />');
    }
    if (window._patternId) {
        process.loadPattern(window._patternId);
    }
    //low resolution fix
    if (m.apple.os || ($(window).width() >= 320 && m.android.os)) {
        //UI
        var exampleSlider = {}
        exampleSlider.actual = 1;
        exampleSlider.max = $('#app-mobile .examples img').length;
        exampleSlider.slide = function() {
            var previous = exampleSlider.actual;
            var next = (previous + 1 > 3) ? 1 : previous + 1;
            exampleSlider.actual = next;
            $('#app-mobile .examples .example' + previous).fadeOut(700, function() {
                $('#app-mobile .examples .example' + next).fadeIn(700, function() {
                    var t = setTimeout(function() {
                        exampleSlider.slide();
                    }, 3000);
                });

            });
        }
        exampleSlider.start = function() {
            $('#app-mobile .examples').show();
            var t = setTimeout(function() {
                exampleSlider.slide();
            }, 3000);
        }
        exampleSlider.start();
    }
});

