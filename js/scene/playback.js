Scene_Playback = (function(Scene) {

    var Scene_Playback = function() {
        this.construct.apply(this, arguments);
    };
    $.extend(true, Scene_Playback.prototype, Scene.prototype, {
        init: function(){
            var scope = this;
            this.playerControlTimeout = null;
            this.mediaType = null;
            this.mediaId = null;
            // elements init
            this.$elPlayBtn = this.$el.find('.b-play');
            this.$elPlayBtnIcon = this.$el.find('.b-play img');
            this.$loader = this.$el.find('.b-play .player-loader');
            this.$playerControlsWrapper = this.$el.find('.player-controls');
            this.$playerControls = this.$playerControlsWrapper.find('#playerControls');
            this.$playbackFooter = this.$el.find('.playback-footer');

            this.on('hide', this.onHide);
            if (!this.inited) {
                this.inited = true;

                //Player.init({playbackFooter: this.$playbackFooter});
                /* ** init player events ** */
                Player.on('statechange', function(state) {
                    // pause/play icon
                    this.$el.toggleClass('ui-paused', state === Player.STATE_PAUSED);

                    // throbbers
                    if (state === Player.STATE_BUFFERING){
                        this.showLoader();
                    } else if (state === Player.STATE_PLAYING) {
                        this.hideLoader();
                    } else {
                        this.showLoader('play');
                    }
                }, this);

                Player.on('timeupdate', function(time) {
                    if (Player.currentState == Player.STATE_PLAYING || (Device.isTIZEN && time > 0)) {
                        if (this.isVisible) {
                            if (this.seekPosition >= 0 && Player.STATE_PLAYING && time > 100) {
                                this.firstSeekProcess();
                            }
                            this.update();
                        }
                    }
                }, this);

                Player.on('durationchange', function(time) {
                    if (this.isVisible) {
                        App.throbberHide(true);
                    }
                }, this);

                Player.on('buffer', function(buffered) {

                    var percent = null;
                    // FF4+, Chrome
                    if (buffered && buffered.length > 0 && buffered.end && Player.duration) {
                        percent = parseInt(buffered.end(0)) * 1000 / Player.duration;
                    }
                    // Some browsers (e.g., FF3.6 and Safari 5) cannot calculate target.bufferered.end()
                    // to be anything other than 0. If the byte count is available we use this instead.
                    // Browsers that support the else if do not seem to have the bufferedBytes value and
                    // should skip to there. Tested in Safari 5, Webkit head, FF3.6, Chrome 6, IE 7/8.
                    else if (Player.el.bytesTotal != undefined && Player.el.bytesTotal > 0 && Player.el.bufferedBytes != undefined) {
                        percent = Player.el.bufferedBytes / Player.el.bytesTotal;
                    }
                    if (percent !== null) {
                        percent = 100 * Math.min(1, Math.max(0, percent));
                    }
                    scope.$elBufferBar.width(percent +'%');
                }, this);

                Player.on('play', function() {
                    // play 1st times
                    this.showControls();
                }, this);

                Player.on('seek', function(time) {
                    console.log('PLAYER: SEEK ' + time);
                }, this);

                Player.on('pause', function() {
                    console.log('PLAYER: PAUSE');
                }, this);

                Player.on('stop', function() {
                    console.log('PLAYER: STOP');
                }, this);

                Player.on('end', function() {
                    console.log('PLAYER: END');
                }, this);

                Player.on('reset', function() {
                    console.log('PLAYER: RESET');
                    if (this.isVisible) {
                        this.reset();
                    }
                }, this);

                Player.on('error', function() {
                    console.log('PLAYER: ERROR');
                }, this);


                Player.on('fullscreen', function() {
                    scope.$playerControls.addClass('fullscreen');
                    scope.$playbackFooter.hide();
                }, this);

                Player.on('fitscreen', function() {
                    scope.$playerControls.removeClass('fullscreen');
                    scope.$playbackFooter.show();
                }, this);

                /* ** init event beforekey ** */

                this.on('beforekey', function(keyCode){
                    if (keyCode === Control.key.RETURN){
                        return;
                    }

                    if (keyCode === Control.key.PLAY){
                        if ((Player.currentState === Player.STATE_PAUSED) && (Player.currentTime > 0)) {
                            this.play();
                        } else if (Player.currentState !== Player.STATE_PLAYING) {
                            this.play(this.video);
                        }
                        return false;
                    } else if (keyCode === Control.key.PAUSE) {
                        scope.pause();
                        return false;
                    } else if (keyCode === Control.key.FF) {
                        scope.forward();
                        return false;
                    } else if (keyCode === Control.key.RW) {
                        scope.backward();
                        return false;
                    } else if (keyCode === Control.key.STOP) {
                        scope.stop();
                        return false;
                    } else if (keyCode === Control.key.INFO) {
                        Popup.info();
                        return false;
                    }

                }, this);

                this.initKeyHandler();
                /* ** check mousemove ** */

                this.$el.mousemove(function(event) {
                    var divPageX = Math.abs(scope.mousePageX - event.pageX),
                        divPageY = Math.abs(scope.mousePageY - event.pageY);

                    if (divPageX >= 10 || divPageY >= 10) {
                        scope.mousePageX = event.pageX;
                        scope.mousePageY = event.pageY;
                    }
                });
            }
        },
        onHide: function() {
            Player.stop();
            Player.hide();
        },
        initKeyHandler: function() {
            this.on('key', function(keyCode) {
                if (!Player.isFullscreen) {
                    this.handleKeyFitScreen(keyCode);
                } else {
                    this.handleKeyFullScreen(keyCode);
                }
            }, this);
        },
        handleKeyFitScreen: function(keyCode) {
            if (keyCode === Control.key.LEFT) {
                this.backward();
            } else if (keyCode === Control.key.RIGHT) {
                this.forward();
            } else if (keyCode === Control.key.UP) {
                //Player.volume('up', 5);
            } else if (keyCode === Control.key.DOWN) {
                //Player.volume('down', 5);
            } else if (keyCode === Control.key.ENTER) {
                if ((Player.currentState === Player.STATE_PLAYING) && (Player.currentTime > 0)) {
                    this.pause();
                } else if ((Player.currentState === Player.STATE_PAUSED && Player.currentTime > 0) || Player.currentState !== Player.STATE_PLAYING) {
                    this.play();
                }
            }
        },
        handleKeyFullScreen: function(keyCode) {
            if (keyCode === Control.key.LEFT) {
                this.backward();
            } else if (keyCode === Control.key.RIGHT) {
                this.forward();
            } else if (keyCode === Control.key.UP) {
                //Player.volume('up', 5);
            } else if (keyCode === Control.key.DOWN) {
                //Player.volume('down', 5);
            } else if (keyCode === Control.key.ENTER) {
                if ((Player.currentState === Player.STATE_PLAYING) && (Player.currentTime > 0)) {
                    this.pause();
                } else if ((Player.currentState === Player.STATE_PAUSED && Player.currentTime > 0) || Player.currentState !== Player.STATE_PLAYING) {
                    this.play();
                }
            }
        },
        showLoader: function(target) {
            if (typeof(target) != und && target == 'play') {
                this.$elPlayBtnIcon.show();
                this.$loader.hide();
            } else {
                this.$elPlayBtnIcon.hide();
                this.$loader.show();
            }
            this.$elPlayBtn.show();
        },
        hideLoader: function() {
            this.$elPlayBtn.hide();
        },
        showControls: function() {
            return false;
            this.$playerControlsWrapper.fadeIn(1000);
            var scope = this;
            this.playerControlTimeout = setTimeout(function() {
                scope.hideControls();
            }, 3000);
        },
        hideControls: function() {
            this.$playerControlsWrapper.fadeOut();
        },
        showKeys: function() {
            var bottomKeys = $('.bottom-keys');
            bottomKeys.addClass(activeClass);
            Player.fitscreen();
        },
        hideKeys: function() {
            var bottomKeys = $('.bottom-keys');
            bottomKeys.removeClass(activeClass);
            Player.fitscreen();
        },
        /**
         * @inheritdoc Scene#create
         */
        create: function() {
            return $('#scene-Playback');
        },

        /**
         * @inheritdoc Scene#render
         */
        render: function() {
            return this.when(function(promise) {
                var scope = this;
                Focus.to(this.$elPlayBtn);
                this.rendered = true;
                promise.resolve();
            }, this);
        },

        /**
         * @inheritdoc Scene#activate
         */
        activate: function() {
            c(App.mediaType);
            var scope = this;
            this.rendered = false;
            this.stoped = true;
            if (App.mediaType == MEDIA_TYPE.MOVIE) {
                this.fetchMovie(App.mediaId);
            } else {
                this.fetchLiveTV(App.mediaId);
            }
            this.$elCurrentTime = this.$el.find('.current-time');
            this.$elRemainingTime = this.$el.find('.remaining-time');
            this.$elDuration = this.$el.find('.duration');
            this.$elProgressBar = this.$el.find('.player-progress .inner');

            setTimeout(bind(function() {
                App.throbberHide(true);
            }, this), 3000);
        },

        /**
         * @inheritdoc Scene#deactivate
         */
        deactivate: function() {

        },

        /**
         * Seek Process function on first play or advertising
         */
        firstSeekProcess: function() {
            if (this.seekPosition > 0) {
                this.seek(this.seekPosition);
            }

            this.seekPosition = -1;
            this.$el.removeClass('seek-process');
        },

        /**
         * Player update progress bar
         *
         * @private
         */
        update: function() {
            var time = Player.currentTime,
                duration = Player.duration,
                state = Player.currentState,
                percentage = 0;
            if (time <= 100) return;

            if (this.$el.hasClass('seek-process')) {
                time = this.seekPosition;
            }

            percentage = 100 / duration * time;
            if (!this.$elCurrentTime) {
                return;
            }
            var currentText = secondsToText(time / 1000);
            var remainingText = '-' + secondsToText((duration - time) / 1000);
            var durationText = secondsToText(Math.ceil(duration / 1000))
            this.$elCurrentTime.html(currentText);
            this.$elRemainingTime.html(remainingText);
            this.$elDuration.html(durationText);
            // PROGRESS BAR UPDATE
            this.$elProgressBar.css({width: percentage + '%'});
        },

        /**
         * Reset Vedeo Player scene
         *
         * @private
         */
        reset: function() {
            this.$elProgressBar && this.$elProgressBar.width('0%');
            this.$elBufferBar && this.$elBufferBar.width('0%');
            this.$elDuration && this.$elDuration.text('-00:00');
            this.$elCurrentTime && this.$elCurrentTime.text('00:00');
        },

        /*
         *********************************************************
         * Player controls
         *********************************************************
         */

        /**
         * STOP video player
         */
        stop: function() {
            this.stoped = true;
            Player.stop();
        },

        /**
         * PLAY video player
         * @param {String} url (video)
         * @param {Number} position (ms)
         */
        play: function(url) {
            this.stoped = false;
            // URL
            if (url) {
                this.video = url;
                Player.play(url);
            } else if (Player.currentState != Player.STATE_PLAYING) {
                Player.play();
            }
        },

        /**
         * PAUSE video player
         */
        pause: function() {
            if (Player.currentState === Player.STATE_PLAYING && Player.currentTime > 0) {
                Player.pause();
            }
        },

        /**
         * FORWARD video player
         */
        forward: function() {
            if (Player.currentState === Player.STATE_PLAYING && Player.currentTime > 0) {
                Player.forward();
            }
        },

        /**
         * BACKWARD video player
         */
        backward: function() {
            if (Player.currentState === Player.STATE_PLAYING && Player.currentTime > 0) {
                Player.backward();
            }
        },

        /**
         * SEEK video player
         * @param {Number} position (ms)
         */
        seek: function(position) {
            Player.seek(position);
        },

        /*
         *********************************************************
         * Scene events
         *********************************************************
         */

        /**
         * @inheritdoc Scene#onLangChange
         */
        onLangChange: function(firstTime, langCode) {
            I18n.translateHTML(this.$el);
        },

        /**
         * @inheritdoc Scene#onReturn
         */
        onReturn: function($el,e,stop) {
            if (App.popupShowing) {
                this.hideInfo();
            } else {
                if (stop) {stop()};
                // stop playing
                this.stop();
                Router.goBack(null);
            }
        },

        /**
         * Handle other than usual key (i.e. color keys)
         * @param {Number} keyCode Numeris code representation
         * @param {Object} $el jQuery object
         * @param {Event} event HTML event
         */
        onOther: function(keyCode, $el, event) {
        },

        /**
         * @inheritdoc Scene#onClick
         */
        onClick: function($el,e,stop) {
            if (stop) {stop()}

            this.onEnter($el,e,stop);
            this.trigger('click', $el, event);
        },

        /**
         * Event called after Enter is pressed
         * @param {Object} $el jQuery object of element on enter was triggered
         * @param {Object} e HTML event
         * @param {Function} stop Stop function
         */
        onEnter: function($el,e,stop) {
            if (stop) {stop()}
        },
        fetchMovie: function(movieId) {
            var scope = this;
            RocketFApi.talk('movieDetail', {movie_id: movieId}, function(response) {
                var parameters = {
                    movie: response.data,
                    hideBtn: true
                };
                scope.$playbackFooter.find('.visible-footer').html(Template.render('tplPlayerFooter', parameters));
                Player.setPoster(response.data.poster);
                // render player controls
                RocketFApi.talk('mediaInfo', {
                    content_info_id: response.data.id,
                    include_media_resources: true
                }, function(result){
                    if (result.data.list[0].mediaResources != null && result.data.list[0].mediaResources.length) {
                        scope.video = result.data.list[0].mediaResources[0].src;
                        scope.reset();
                        scope.play(scope.video);
                        Player.show();
                    } else {
                        scope.showError();
                    }
                });
                scope.$playerControls.html(Template.render('tplPlayerControls', parameters.movie));
                scope.$elBufferBar = scope.$el.find('.screen-load');
                // render popup info                                                    
                // Popup.setContent(Template.render('tplPopupInfo', parameters));

            })
        },
        fetchLiveTV: function(channelId) {
            var scope = this;
            RocketFApi.talk('channelDetail', {channel_id: channelId}, function(response) {
                var params = {
                    channel_id: channelId,
                    date : moment().format('YYYY-MM-DD'),
                    omit_description: true
                };
                // get program list
                RocketFApi.talk('programList', params, function(rs) {
                    // get playing and next programs
                    var now = moment();
                    var playing = null;
                    var nextPrograms = [];
                    for (index in rs.data.list) {
                        var item = rs.data.list[index];
                        var begin = moment(parseInt(item.start));
                        var end = moment(parseInt(item.end));
                        if (playing != null) {
                            if (nextPrograms.length < 3) {
                                nextPrograms.push(item);
                                continue;
                            } else {
                                break;
                            }
                        }
                        if (begin <= now && end > now) {
                            playing = item;
                        }
                    }
                    nextPrograms.beginTime = function(){
                        return moment(parseInt(this.start)).format('HH:mm');
                    };
                    var parameters = {
                        liveTV: response.data.list[0],
                        hideBtn: true,
                        nextPrograms : nextPrograms,
                        playing: playing
                    };

                    scope.$playbackFooter.find('.visible-footer').html(Template.render('tplPlayerFooter', parameters));
                    if (playing && typeof (playing.poster) != und)
                        Player.setPoster(playing.poster);
                    // render player controls
                    scope.$playerControls.html(Template.render('tplPlayerControls', parameters.playing));
                    scope.$elBufferBar = scope.$el.find('.screen-load');
                    scope.$el.find('.player-progress, .duration').hide();

                    if (response.data.list[0].streams != null && response.data.list[0].streams.length) {
                        scope.video = response.data.list[0].streams[0].src;
                        scope.reset();
                        scope.play(scope.video);
                        Player.show();
                    } else {
                        scope.showError();
                    }
                });

            })
        },
        showError: function() {
            App.notification('Notice', 'This content is currently not available.');
        }
    });

    return Scene_Playback;

})(Scene);