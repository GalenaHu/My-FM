! function() {
    var view = {
        $music: $('#music'),
        $play: $('#play'),
        $pause: $('#pause'),
        $next: $('#next'),
    };
    var controller = {
        init: function() {
            controller.bind();
        },
        bind: function() {
            var audioObject = document.querySelector('#music')
            view.$play.on('click', function() {
                audioObject.play();
                view.$play.hide();
                view.$pause.show();
            })
            view.$pause.on('click', function() {
                audioObject.pause();
                view.$pause.hide();
                view.$play.show();
            })
        }
    };
    controller.init();
}.call()