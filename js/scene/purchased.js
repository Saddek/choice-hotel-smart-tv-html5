/**
 /**
 * Purchased scene
 *
 * @author Mautilus s.r.o.
 * @class Scene_Purchased
 * @extends Scene
 */

Scene_Purchased = (function (Scene) {

    var Scene_Purchased = function () {
        this.construct.apply(this, arguments);
    };

    $.extend(true, Scene_Purchased.prototype, Scene.prototype, {
        init: function () {
            // row height use for animation
            this.handleKey = false;
            this.rowHeight = 388;
            this.currentRow = 1;

            this.$el.prepend(App.header(Scenes.purchased));
            this.$header = this.$el.find('.appMenu');

            this.$listPurchased = this.$el.find('.list-purchased-movies');
            this.$backToMovies = this.$el.find('.back-to-movies');

            this.fetchPurchasedMovies();
            this.initAds();
            this.on('hide', this.onHide);
        },
        onHide: function() {
            this.handleKey = false;
        },
        initAds: function() {
            var scope = this;
            this.$el.find('.ad-slider').each(function(key, slider) {
                $(slider).ssss();
            });
        },
        activate: function () {
            var scope = this;

            Focus.to(this.getNextFocus(this.$listPurchased));
            setTimeout(function(){
                App.throbberHide(true);
                scope.handleKey = true;
            }, 1000);
        },
        getNextFocus: function($container) {
            var lastActive = $container.find('.focusable.' + activeClass);
            return lastActive.length ? lastActive : $container.find('.focusable:eq(0)');
        },
        onClick: function ($el, event) {
            this.onEnter.apply(this, arguments);
        },
        onEnter: function ($el, event) {
            if (!this.handleKey) return false;

            if ($el.hasClass('back-to-movies')) {
                return Router.go(true, Scenes.movies);
            }
            if ($el.hasClass('purchasedMovie')) {
                return Router.go(true, Scenes.playback);
            }
        },
        navigate: function (direction) {
            if (!this.hasFocus()) {
                Focus.to(this.getNextFocus(this.$listPurchased));
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
                    Focus.to(this.$backToMovies);
                    return false;
                }
            }

            if (Focus.isIn(this.$backToMovies)) {
                if (direction == "left") {
                    return false;
                }
                if (direction == 'down' || direction == 'right') {
                    Focus.to(this.getNextFocus(this.$listPurchased));
                    return false;
                }
                if (direction == 'up') {
                    Focus.to(getNextFocus(this.$header));
                    return false;
                }
            }
            // carousel handler
            if (Focus.isIn(this.$listPurchased)) {
                var listPurchasedHandled = this.handleKeyListPurchased(direction);
                if (!listPurchasedHandled) {
                    return false;
                }
            }

            if (direction == "left") Focus.to(this.getCircleFocusable(-1));
            else if (direction == "right") Focus.to(this.getCircleFocusable(1));
        },
        handleKeyListPurchased: function (direction) {
            var currentIndex = Focus.focused.data('index');
            var $nextFocus = '';
            if (direction == 'up') {
                if (this.currentRow == 1) {
                    Focus.to(this.$backToMovies);
                    return false;
                } else {
                    $nextFocus = this.$listPurchased.find('.focusable').eq(currentIndex - 3);
                    this.currentRow += -1;
                    this.moveToRow();
                    Focus.to($nextFocus);
                }
            }
            if (direction == 'down') {
                if (this.currentRow < this.totalRow) {
                    $nextFocus = this.$listPurchased.find('.focusable').eq(currentIndex + 3);
                    if ($nextFocus.length) {
                        this.currentRow += 1;
                        if (this.currentRow < this.totalRow) {
                            this.moveToRow();
                        }
                        Focus.to($nextFocus);
                    }

                }
            }

            return true;
        },
        moveToRow: function() {
            var translateY = this.rowHeight * (this.currentRow - 1);
            this.$listPurchased.css({
                transform: "translate(0, -" + translateY + "px)",
                "transition": "transform 400ms"
            });
        },
        /**
         * @inheritdoc Scene#create
         */
        create: function () {
            return $('#scene-Purchased');
        },
        /**
         * @inheritdoc Scene#render
         */
        render: function () {
        },
        onReturn: function ($el) {
            Router.goBack();
        },
        fetchPurchasedMovies: function() {
            var scope = this;
            RocketFApi.talk('purchasedMovies', {}, function(response){
                scope.$listPurchased.html(Template.render('tplPurchasedVideos', response.data));
                scope.total = response.data.list.length;
                scope.totalRow = Math.ceil(scope.total / 3);
            });
        }

    });

    return Scene_Purchased;

})(Scene);