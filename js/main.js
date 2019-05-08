! function() {
    var view = {
        $flex: $('.flex'),
        $music: $('#music'),
        $main: $('main'),
        $toggle: $('.toggle'),
        $photo: $('.photo'),
        $title: $('.title'),
        $artist: $('.artist'),
        $channelName: $('.channelName'),
        $music: $('#music'),
        $play: $('#play'),
        $pause: $('#pause'),
        $next: $('#next'),
        $currentTime: $('.currentTime'),
        $duration: $('.duration'),
        $download: $('.download'),
        $progress: $('.progress'),
    };
    var model = {
        originUrl: '//jirenguapi.applinzi.com/fm/',
        channelUrl: '//jirenguapi.applinzi.com/fm/getChannels.php',
        songUrl: '//jirenguapi.applinzi.com/fm/getSong.php',
        channelIdUrl: 'public_fengge_dianyingyuansheng',
        lyricUrl: '//jirenguapi.applinzi.com/fm/getLyric.php',
        lyricObj: {},
        fetch: function(url, data) {
            return $.getJSON(url, data);
        },
        setChannels: function() {
            model.fetch(model.channelUrl, {}).then((response) => {
                for (let i = 0; i < response.channels.length; i++) {
                    let el =
                        `<div class="channel" id="${response.channels[i].channel_id}">
                            <div class="picture" style="background-image: url('${response.channels[i].cover_small}')"></div>
                            <div class="name">${response.channels[i].name}</div>
                        </div>`
                    let $node = $(el);
                    view.$flex.append($node);
                }

            })
        },
        setSong: function() {
            var audioObject = document.querySelector('#music');
            $('.lyrics>p').text('');
            model.lyricObj = {};
            model.fetch(model.songUrl, { channel: model.channelIdUrl }).then((response) => {
                view.$music.attr("src", response.song[0].url);
                view.$photo.css('background-image', 'url(' + response.song[0].picture + ')')
                view.$title.text(response.song[0].title);
                view.$artist.text(response.song[0].artist);
                audioObject.oncanplay = function() {
                    model.setLyric(response.song[0].sid);
                    view.$duration.text(model.timeFormat(audioObject.duration));
                }
            })
        },
        setLyric: function(sid) {
            model.fetch(model.lyricUrl, { sid: sid }).then((response) => {
                response.lyric.split('\n').forEach(function(line) {
                    var times = line.match(/\d{2}:\d{2}/g);
                    var str = line.replace(/\[\d{2}:\d{2}\.\d{2}\]/g, '');
                    if (Array.isArray(times)) {
                        times.forEach(function(time) {
                            if (!(/饥人谷/.test(str))) {
                                model.lyricObj[time] = str
                            }
                        })
                    }
                })
            }, () => {
                $('.lyrics>p').text('暂无歌词');
            })
        },
        timeFormat: function(time) {
            var m = Math.floor(time / 60);
            var s = Math.floor(time % 60);

            if (m < 10) {
                m = '0' + m;
            }
            if (s < 10) {
                s = '0' + s;
            }
            if (parseInt(m) < 1) {
                return '00:' + s;
            } else {
                return m + ':' + s;
            }
        },
    };


    var controller = {
        timer: null,
        init: function() {
            model.setChannels();
            model.setSong();
            controller.bind();
            controller.audio();
            controller.progressMove();
            controller.timeInterval();
            $('body').css('height', document.documentElement.clientHeight)
            $(window).resize(function() {
                $('body').css('height', document.documentElement.clientHeight)
            })
        },
        bind: function() {
            view.$toggle.on('click', function() {
                view.$main.toggleClass('mainMove');
                view.$toggle.toggleClass('toggleRotate')
            });
            view.$flex.on('click', '.channel', function(e) {
                model.channelIdUrl = $(this)[0].id;
                view.$channelName.text($(this).children('.name').text());
                view.$main.toggleClass('mainMove');
                view.$toggle.toggleClass('toggleRotate');
                model.setSong();
            })
        },
        audio: function() {
            var audioObject = document.querySelector('#music');
            audioObject.autoplay = false;
            view.$play.on('click', function() {
                audioObject.play();
                view.$play.hide();
                view.$pause.show();
                audioObject.autoplay = true;
            })
            view.$pause.on('click', function() {
                audioObject.pause();
                view.$pause.hide();
                view.$play.show();
                audioObject.autoplay = false;
            })
            view.$next.on('click', function() {
                model.setSong();
            })
            audioObject.addEventListener('ended', function() {
                model.setSong();
            })
            $('.retreat').on('click', function() {
                view.$main.toggleClass('mainMove');
                view.$toggle.toggleClass('toggleRotate');
            })

        },
        progressMove: function() {
            let drag = false;
            let position = null;
            var audioObject = document.querySelector('#music');
            $('.btn').on('mousedown', function(e) {
                drag = true;
                position = e.clientX;
            });
            $(document).on('mousemove', function(e) {
                if (drag) {
                    window.clearInterval(controller.timer);
                    let bx = parseInt(view.$progress.css('width'));
                    let dx = e.clientX - position;
                    position = e.clientX;
                    if (bx <= -4) {
                        bx = -4
                    }
                    if (bx >= $('.back').width()) {
                        bx = $('.back').width() - 10;
                    }
                    view.$progress.css('width', bx + dx + 'px');
                    view.$currentTime.text(model.timeFormat(Math.floor(parseInt(view.$progress.css('width')) / parseInt($('.back').css('width')) * audioObject.duration)));
                }
            });
            $(document).on('mouseup', function() {
                if (drag) {
                    drag = false;
                    controller.timeInterval();
                    audioObject.currentTime = Math.floor(parseInt(view.$progress.css('width')) / parseInt($('.back').css('width')) * audioObject.duration);
                }
            })
            $('.btn').on('touchstart', function(e) {
                drag = true;
                position = e.originalEvent.changedTouches[0].clientX;
            });
            $(document).on('touchmove', function(e) {
                if (drag) {
                    window.clearInterval(controller.timer);
                    let bx = parseInt(view.$progress.css('width'));
                    let dx = e.originalEvent.changedTouches[0].clientX - position;
                    position = e.originalEvent.changedTouches[0].clientX;
                    if (bx <= -4) {
                        bx = -4
                    }
                    if (bx >= $('.back').width()) {
                        bx = $('.back').width() - 10;
                    }
                    view.$progress.css('width', bx + dx + 'px');
                    view.$currentTime.text(model.timeFormat(Math.floor(parseInt(view.$progress.css('width')) / parseInt($('.back').css('width')) * audioObject.duration)));
                }
            });
            $(document).on('touchend', function() {
                if (drag) {
                    drag = false;
                    controller.timeInterval();
                    audioObject.currentTime = Math.floor(parseInt(view.$progress.css('width')) / parseInt($('.back').css('width')) * audioObject.duration);
                }
            })
        },
        setProgress: function() {
            var audioObject = document.querySelector('#music');
            view.$currentTime.text(model.timeFormat(audioObject.currentTime));
            view.$progress.css('width', audioObject.currentTime / audioObject.duration * 100 + '%');
            view.$download.css('width', audioObject.buffered.end(audioObject.buffered.length - 1) / audioObject.duration * 100 + '%');
        },
        timeInterval: function() {
            controller.timer = setInterval(function() {
                controller.setProgress();
                $('.lyrics>p').text(model.lyricObj[view.$currentTime.text()]);
            }, 1000);
        }
    };
    controller.init();
}.call();