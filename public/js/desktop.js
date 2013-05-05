$(document).ready(function() {
    $('#app-mobile').empty();
    $('#app-desktop').show();
    $('#app-loader').hide();

    //Routes
    var contents = {
        content : [{
            route : '',
            content : '#app-desktop .content-home',
            visible : false
        }, {
            route : '/FAQ',
            content : '#app-desktop .content-faq',
            visible : false
        }, {
            route : '/Contact',
            content : '#app-desktop .content-contact',
            visible : false
        }, {
            route : '/:patterId',
            content : '#app-desktop .content-pattern',
            visible : false
        }],
        getVisible : function() {
            var l = this.content.length;
            for (var i = 0; i < l; i++) {
                if (this.content[i].visible) {
                    return this.content[i];
                }
            }
            return false;
        },
        setVisible : function(c) {
            var l = this.content.length;
            for (var i = 0; i < l; i++) {
                if (this.content[i].content == c) {
                    this.content[i].visible = true;
                } else {
                    this.content[i].visible = false;
                }
            }

        },
        showContent : function(c) {
            var visible = contents.getVisible();
            if (visible) {
                $(visible.content).fadeOut(function() {
                    $(c).fadeIn();
                    beta.shake();
                });

            } else {
                $(c).fadeIn();
            }
            contents.setVisible(c);
        }
    };

    var beta = {};
    beta.show = function() {
        beta.running = true;
        $('#ribbon').animate({
            top : 0
        }, 300).animate({
            top : -30
        }, 150).animate({
            top : -20
        }, 300, function() {
            beta.running = false;
        });
    };
    beta.shake = function() {
        if (beta.running)
            return;
        var r = function(p) {
            return (p) ? Math.floor((Math.random() * 10) + 1) : Math.floor((Math.random() * 100) + 1);
        };
        beta.running = true;
        $('#app-desktop #ribbon').animate({
            top : -20 - r(true)
        }, 100 + r()).animate({
            top : -10 - r(true)
        }, 100 + r()).animate({
            top : -20
        }, 100 + r(), function() {
            beta.running = false;
        });
    };
    //Beta ribbon animation
    var t = setTimeout(function() {
        if ($(window).width() > 1000) {
            beta.show();
        }
    }, 1500);

    //Unsupported browser
    try {
        //test for IE, Opera & canvas support
        if (/MSIE/i.test(navigator.userAgent) || /Opera/i.test(navigator.userAgent) || !(!!window.CanvasRenderingContext2D) || !(!!document.createElement("canvas").getContext) || !(!!window.HTMLCanvasElement)) {
            $('#app-desktop .content-home .support').html($('.content-unsuportedBrowser').html());
        }
    } catch(e) {
        //:( something went wrong = unsuported browser
        $('#app-desktop .content-home .support').html($('.content-unsuportedBrowser').html());
    }
    $('#app-desktop #colors').empty();
    for (var i = 0; i < palette.length; i++) {
        var r = $('<label class="radio"></label>');
        var p = palette[i]

        r.append('<input type="radio" ' + ((p.def) ? 'checked' : '') + ' name="colors" value="' + i + '">');
        for (var j = 0; j < p.colors.length; j++) {
            var c = p.colors[j];
            r.append('<span class="color" style="background-color: rgb(' + c.r + ', ' + c.g + ', ' + c.b + ')"></span>');
        }
        $('#app-desktop #colors').append(r);
    }
    $("#app-desktop #modalOptions input[name='cols']").val(50);
    var exampleSlider = {}
    exampleSlider.actual = 1;
    exampleSlider.max = $('#examples img').length;
    exampleSlider.slide = function() {
        var previous = exampleSlider.actual;
        var next = (previous + 1 > 3) ? 1 : previous + 1;
        exampleSlider.actual = next;
        $('#app-desktop #examples .example' + previous).fadeOut(700, function() {
            $('#app-desktop #examples .example' + next).fadeIn(700, function() {
                var t = setTimeout(function() {
                    exampleSlider.slide();
                }, 3000);
            });

        });
    }
    exampleSlider.start = function() {
        var t = setTimeout(function() {
            exampleSlider.slide();
        }, 3000);
    }
    exampleSlider.start();

    $('#convertImage').click(function(e) {
        if (!loader.running) {
            $('#app-desktop #canvas').empty();
            //$('#inputFile').trigger('click');
            $('#inputFile').click();
        }
    });
    $('#inputFile').change(function(e) {
        var file = e.target.files[0];
        process.start(file);
    });
    $('#modalResult').on('hidden', function() {
        loader.finish();
    });
    //Contact form
    $('#sendMessage').click(function() {
        var s = $('#messageSubject').val();
        var b = $('#messageBody').val();
        if (s !== '' && b !== '') {
            window.open('mailto:miroslav.magda@ejci.net?subject=' + s + '&body=' + b);
        }
    });

    $('#buttonOptions').click(function() {
        $('#modalOptions').modal();
    });
    $('#buttonApplyOptions').click(function() {
        process.applyOptions();
    });
    $('#buttonDownload').click(function() {
        process.download();
    });
    $('#buttonDownloadShared').click(function() {
        $('#buttonDownload').click();
    });

    $('#buttonShare').click(function() {
        process.share();
    });
    $('#buttonEdit').click(function() {
        $('#modalAlert .modal-header h3').html('Comming Soon');
        $('#modalAlert .modal-body').html('<p class="lead">Sorry :( Editing and sharing of patterns is under development :)</p>');
        $('#modalAlert').modal({
            show : true
        });

    });
    var xst = {};
    var process = {};
    process.start = function(file) {
        if (file) {
            //console.log('file.type', file.type);
            if (file.type === "image/jpeg" || file.type === "image/jpg" || file.type === "image/png") {
                loader.start();
                /*var reader = new FileReader();
                 reader.onload = function(e) {
                 $('#imageTemp').attr('src', e.target.result);
                 }
                 reader.readAsDataURL(file);*/

                canvasResize(file, {
                    width : 1600,
                    height : 1600,
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
                $('#modalAlert .modal-header h3').html('Sorry :(');
                $('#modalAlert .modal-body').html('<p class="lead">You are trying to use unsuported file type.</p><p>Please use .jpeg, .jpg or .png file type.</p>');
                $('#modalAlert').modal({
                    show : true
                });
            }
        }
    };
    process.showResult = function(xst, cb) {
        cb = (cb) ? cb : function() {
        };
        var can = xst.getCanvas();
        var pattern = xst.getPattern();
        $('#resultCanvasShare').hide();
        $('#resultCanvas').html(can);
        $('#resultCanvasInfo').html('<div><b>Size: </b>' + pattern.cols + ' <small>x</small> ' + pattern.rows + '<div>');
        var d = $('<div><b>Used colors: </b></div>')
        for (var j = 0; j < pattern.colors.length; j++) {
            var c = pattern.colors[j];
            d.append('<span class="color" style="background-color: rgb(' + c.r + ', ' + c.g + ', ' + c.b + ')"></span>');
        }
        $('#resultCanvasInfo').append(d);
        $('#marketing').slideUp(500, function() {
            $('#result').slideDown(500);
            cb();
        });
    };
    process.applyOptions = function() {
        $('#modalOptions').modal('hide');
        loader.start();
        var cols = $("#modalOptions input[name='cols']").val();
        var palette = $("#modalOptions input[name='colors']:checked").val();
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
            width : 1200
        });
        var dataURL = can.toDataURL("image/png");
        $("#downloadForm input[name='image']").val(dataURL);
        $('#downloadForm').submit();
        loader.finish();
    }
    process.share = function() {
        var pattern = JSON.stringify(xst.getPattern());
        $.post("/share/save", {
            pattern : pattern
        }).fail(function(e) {
            $('#modalAlert .modal-header h3').html('Sorry :(');
            $('#modalAlert .modal-body').html('<p class="lead">Something went wrong...</p><p>Error message:' + e + '</p>');
            $('#modalAlert').modal({
                show : true
            });
        }).done(function(data) {
            var url = "http://istitchapp.com/#/" + data.patternId;
            $("#resultCanvasShare input[name='shareUrl']").val(url);
            $('#resultCanvasShare').slideDown(500);
        });
    }
    process.loadPattern = function(patternId) {
        if (patternId.length < 5) {
            $('#sharedCanvas').html('<i class="icon-exclamation-sign icon-2x"></i><h4>There isn\'t such a pattern :(</h4><p>Check your link please</p>');
            $('#sharedCanvasMeta').hide();
            return;
        }
        xst = new stitch(document.getElementById('image'));
        $.getJSON('share/load/' + patternId, function(pattern) {
            if (!pattern.error) {
                var can = xst.getCanvas(false, pattern);
                $('#sharedCanvas').html(can);
                $('#sharedCanvasInfo').html('<div><b>Size: </b>' + pattern.cols + ' <small>x</small> ' + pattern.rows + '<div>');
                var d = $('<div><b>Used colors: </b></div>')
                for (var j = 0; j < pattern.colors.length; j++) {
                    var c = pattern.colors[j];
                    d.append('<span class="color" style="background-color: rgb(' + c.r + ', ' + c.g + ', ' + c.b + ')"></span>');
                }
                $('#sharedCanvasInfo').append(d);
                $('#sharedCanvasMeta').show(500);
            } else {
                $('#sharedCanvas').html('<i class="icon-exclamation-sign icon-2x"></i><h4>There isn\'t such a pattern :(</h4><p>Check your link please</p>');
                $('#sharedCanvasMeta').hide();
            }
        });

    };
    process.image = function() {
        try {
            loader.start();
            var cols = $("#modalOptions input[name='cols']").val();
            var palette = $("#modalOptions input[name='colors']:checked").val();
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
            $('#modalAlert .modal-header h3').html('Sorry :(');
            $('#modalAlert .modal-body').html('<p class="lead">Something went wrong...</p><p>Error message:' + JSON.stringify(e) + '</p>');
            $('#modalAlert').modal({
                show : true
            });
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
        $('#convertImage').addClass('disabled');
        $('#convertImage').removeClass('btn-success');
        $('#convertImage').addClass('btn-danger');
        $('#convertImage').html('<i class="icon-spinner icon-spin"></i> Processing image...')
    }
    loader.update = function(msg) {
        $('#convertImage').html(msg)
    }
    loader.finish = function() {
        $('#convertImage').removeClass('disabled');
        $('#convertImage').removeClass('btn-danger');
        $('#convertImage').addClass('btn-success');
        $('#convertImage').html('<i class="icon-camera"></i> Create another pattern from picture');
        loader.running = false;
        loader.count++;
    };

    routie('/Contact', function() {
        contents.showContent('#app-desktop .content-contact');
    });
    routie('/FAQ', function() {
        contents.showContent('#app-desktop .content-faq');
    });
    routie('/:patternId', function(patternId) {
        contents.showContent('#app-desktop .content-pattern');
        process.loadPattern(patternId);
    });
    routie('', function() {
        contents.showContent('#app-desktop .content-home');
    });
});

