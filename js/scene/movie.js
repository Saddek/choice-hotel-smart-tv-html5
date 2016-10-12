Scene_Movies = (function(Scene) {

    var Scene_Movies = function() {
        this.construct.apply(this, arguments);
    };

    $.extend(true, Scene_Movies.prototype, Scene.prototype, {
        init: function(){
            this.$el.prepend(App.header(Scenes.movies));
            this.$header = this.$el.find('.appMenu');
            this.$nav = this.$el.find('.nav .horizontal-scroller-container');
            this.$navScroller = this.$nav.find('.horizontal-scroller');
            this.$movieScroller = this.$el.find('#moviesThumbs .horizontal-scroller');
            this.$adsPlayer = this.$el.find('.ads-player');
            this.$showPurchasedBtn = this.$el.find('#showPurchased');
            // movie info section
            this.$movieCover = this.$el.find('#movieCover');
            this.$movieTitle = this.$el.find('#movieTitle');
            this.$movieDesc = this.$el.find('#movieDesc');

            this.bindFocus();
            this.initAds();
            this.on('hide', this.onHide);
        },
        initAds: function() {
            var scope = this;
            this.$el.find('.ad-slider').each(function(key, slider) {
                $(slider).ssss();
            });
        },
        initAdsPlayer: function() {
            this.$adsPlayer.html(Ads.youtube);
        },
        bindFocus: function() {
            var scope = this;

            // render movie info when focus on movie thumb
            this.$movieScroller.on('focus', '.horizontal-item', function() {
                var $item = $(this);
                scope.setActiveMovie($item.data('title'), $item.data('cover'), $item.data('description'));
            });
        },
        setActiveMovie: function(title, cover, description) {
            this.$movieCover.css({
                backgroundImage: "url("+ cover +")"
            });
            this.$movieTitle.html(title);
            this.$movieDesc.html(description);
        },
        activate: function() {
            this.fetchCategories();
            this.fetchMovies(0);
            this.initAdsPlayer();
            setTimeout(function() {
                App.throbberHide(true);
            }, 2000);
        },
        onHide: function() {
            this.$adsPlayer.html('');
        },
        onClick: function($el, event) {
            this.onEnter.apply(this, arguments);
        },
        onEnter: function($el, event) {
            if ($el.belongsTo(this.$header)) {
                var targetScene = $el.data('target');
                if (Scenes[targetScene]) {
                    Router.go(true, Scenes[targetScene]);
                }
                return;
            }
            // thumb enter handle
            if ($el.hasClass("movieCategory")) {
                this.$nav.find('.movieCategory').removeClass(activeClass);
                $el.addClass(activeClass);
                return this.fetchMovies($el.data('id'));
            }
            // purchased Movies handle
            if ($el.prop('id') == 'showPurchased') {
                return Router.go(true, Scenes.purchased);
            }
            // main Movies handle
            if ($el.hasClass('movieThumb')) {
                App.setMedia('movie', $el.data('id'));
                return Router.go(true, Scenes.playback);
            }

        },
        navigate: function(direction) {
            // if no focused -> focus first nav
            if (!this.hasFocus()) {
                Focus.to(getNextFocus(this.$nav));
                return false;
            }
            if (direction == 'right') {
                if (Focus.focused.hasClass('last')) {
                    return;
                }
            }
            if (direction == 'left') {
                if (Focus.focused.hasClass('first')) {
                    return;
                }
            }

            if (Focus.isIn(this.$header)) {
                if (direction == 'down') {
                    Focus.to(getNextFocus(this.$nav));
                    return false;
                }
            }

            if (Focus.isIn(this.$movieScroller)) {
                if (direction == 'down') {
                    Focus.to(this.$showPurchasedBtn);
                    return false;
                }
                if (direction == 'up') {
                    Focus.to(getNextFocus(this.$nav));
                    return false;
                }

                var nextFocus = null;
                if (direction == "left") {
                    nextFocus = this.getCircleFocusable(-1);
                } else if (direction == "right") {
                    nextFocus = this.getCircleFocusable(1);
                }
                if (nextFocus != null) {
                    this.movieScroller.center(nextFocus);
                }
            }
            // channels categories handler
            if (Focus.isIn(this.$nav)) {
                if (direction == 'up') {
                    Focus.to(getNextFocus(this.$header));
                    return false;
                }
                if (direction == 'down') {
                    Focus.to(getNextFocus(this.$movieScroller));
                }
                var nextFocus = null;
                if (direction == "left") {
                    nextFocus = this.getCircleFocusable(-1);
                } else if (direction == "right") {
                    nextFocus = this.getCircleFocusable(1);
                }
                if (nextFocus != null) {
                    this.navScroller.center(nextFocus);
                }
            }

            if (Focus.isIn(this.$showPurchasedBtn)) {
                if (direction == 'up') {
                    Focus.to(getNextFocus(this.$movieScroller));
                }
                return false;
            }

            if (direction == "left") Focus.to(this.getCircleFocusable(-1));
            else if (direction == "right") Focus.to(this.getCircleFocusable(1));
        },
        /**
         * @inheritdoc Scene#create
         */
        create: function() {
            return $('#scene-Movies');
        },
        /**
         * @inheritdoc Scene#render
         */
        render: function() {

        },
        fetchCategories: function() {
            var scope = this;
            RocketFApi.talk('moviesCategories', {}, function(response){
                scope.$navScroller.html(Template.render('tplMoviesCategories', response));
                scope.navScroller = new HorizontalScroller(scope.$navScroller);
            });
        },
        fetchMovies: function(categoryId) {
            var scope = this;
            var params = {
                category_id : categoryId,
                page_size : CONFIG.contentAPI.pageSize,
                include_details: true
            };
            RocketFApi.talk('moviesByCategories', params, function(response){
                scope.$movieScroller.html(Template.render('tplMoviesThumbs', response.data));
                scope.movieScroller = new HorizontalScroller(scope.$movieScroller);
                var firstItem = typeof(response.data.list[0]) != undefined ? response.data.list[0] : null;
                if (firstItem) {
                    scope.setActiveMovie(firstItem.title, firstItem.poster, firstItem.details.description);
                }
            });
        }
    });

    return Scene_Movies;

})(Scene);