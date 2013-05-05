(function(w) {
    var _load = {};
    _load.isMobile = /mobile/i.test(navigator.userAgent);
    _load.isIE = (/MSIE/i.test(navigator.userAgent));
    _load.isDevel = true;
    _load.t = (_load.isDevel) ? '' : 'min.';
    _load.s3 = (_load.isDevel) ? '' : 'http://istitchapp.s3-website-us-east-1.amazonaws.com/pub';
    /**
     * Import Javascript
     */
    _load.requireScript = function(f, c) {
        var head = document.getElementsByTagName("head")[0];
        var script = document.createElement('script');
        var cb = (c) ? c : function() {
        };
        script.src = '' + f;
        script.type = 'text/javascript';
        script.onload = cb;
        script.onreadystatechange = function() {
            if (this.readyState == 'complete') {
                cb();
            }
        }
        head.appendChild(script);
        //head.parentNode.insertBefore(script);
    }
    /**
     * Import CSS
     */
    _load.requireStyle = function(f, c) {
        var head = document.getElementsByTagName("head")[0];
        var style = document.createElement('link');
        var cb = (c) ? c : function() {
        };
        style.href = '' + f;
        style.rel = 'stylesheet';
        style.onload = cb;
        style.onreadystatechange = function() {
            if (this.readyState == 'complete') {
                cb();
            }
        }
        head.appendChild(style);
        //head.parentNode.insertBefore(style);

    }
    /**
     * Console
     */
    if ( typeof console == "undefined") {
        this.console = {
            log : function() {
            }
        };
    }
    /**
     * Simple mobile / desktop switch
     */
    if (_load.isMobile) {
        //MOBILE
        /**
         * Android issue
         * Don't use callback in css files or you you're gonna have a bad time!
         */
        _load.requireStyle(_load.s3+'/css/mobile.' + _load.t + 'css', false);
        _load.requireStyle(_load.s3+'/css/themes/my-custom-theme.min.css', false);
        _load.requireStyle('http://code.jquery.com/mobile/1.3.0/jquery.mobile.structure-1.3.0.min.css', false);
        //_load.requireStyle('http://code.jquery.com/mobile/1.3.0/jquery.mobile-1.3.0.min.css',false);
        _load.requireScript('http://code.jquery.com/jquery-1.9.1.min.js', function() {
            _load.requireScript('http://code.jquery.com/mobile/1.3.0/jquery.mobile-1.3.0.min.js', function() {
                _load.requireScript(_load.s3+'/js/stitch.' + _load.t + 'js', function() {
                    _load.requireScript(_load.s3+'/js/mobile.' + _load.t + 'js', false);
                });
            });
        });
        /*_load.requireScript('/js/lib/binaryajax.min.js', function() {
         _load.requireScript('/js/lib/canvasResize.min.js', function() {
         _load.requireScript('/js/lib/exif.min.js', function() {
         _load.requireScript('/js/stitch.' + _load.t + 'js', false);
         });
         });
         });*/
        _load.requireScript(_load.s3+'/js/lib/canvasResizeAll.min.js', false);
    } else {
        //DESKTOP
        _load.requireStyle('http://netdna.bootstrapcdn.com/twitter-bootstrap/2.3.1/css/bootstrap-combined.no-icons.min.css', function() {
            _load.requireStyle('http://netdna.bootstrapcdn.com/font-awesome/3.0.2/css/font-awesome.css', function() {
                _load.requireStyle(_load.s3+'/css/desktop.' + _load.t + 'css', false);

            });
        });
        _load.requireScript('http://code.jquery.com/jquery-1.9.1.min.js', function() {
            _load.requireScript('http://netdna.bootstrapcdn.com/twitter-bootstrap/2.3.1/js/bootstrap.min.js', function() {
                _load.requireScript(_load.s3+'/js/lib/routie/routie.min.js', function() {
                    _load.requireScript(_load.s3+'/js/stitch.' + _load.t + 'js', function() {
                        _load.requireScript(_load.s3+'/js/desktop.' + _load.t + 'js', function() {
                        });
                    });
                });
            });
        });
        //IF MSIE than there is no need to load libs for image processing :(
        if (!(_load.isIE)) {
            /*_load.requireScript('/js/lib/binaryajax.min.js', function() {
             _load.requireScript('/js/lib/canvasResize.js', function() {
             _load.requireScript('/js/lib/exif.min.js', function() {
             });
             });
             });*/
            _load.requireScript(_load.s3+'/js/lib/canvasResizeAll.min.js', false);
        }
    }

})(window);
/**
 * GOOGLE ANALYTICS
 */
var _gaq = _gaq || [];
_gaq.push(['_setAccount', (/istitchapp/i.test(document.location)) ? 'UA-39213885-1' : 'UA-XXXXX-Y']);
_gaq.push(['_setCustomVar', 1, 'APP', (/mobile/i.test(navigator.userAgent)) ? 'Mobile' : 'Desktop', 1]);
_gaq.push(['_trackPageview']);
(function() {
    var ga = document.createElement('script');
    ga.type = 'text/javascript';
    ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(ga, s);
})();
