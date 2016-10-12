/**
 /**
 * FoodAndActivity scene
 *
 * @author Mautilus s.r.o.
 * @class Scene_Welcome
 * @extends Scene
 */

Scene_FoodAndActivity = (function (Scene) {

    var Scene_FoodAndActivity = function () {
        this.construct.apply(this, arguments);
    };

    $.extend(true, Scene_FoodAndActivity.prototype, Scene.prototype, {
        init: function () {
            this.$el.prepend(App.header(Scenes.activities));
            this.$header = this.$el.find('.appMenu');
            this.$nav = this.$el.find('.nav .horizontal-scroller-container');
            this.$navScroller = this.$nav.find('.horizontal-scroller');
            this.$adsPlayer = this.$el.find('.ads-player');
            this.$activityScroller = this.$el.find('#activitiesThumbs .horizontal-scroller');
            // activity info section
            this.$activityCategory = this.$el.find('#activityCategory');
            this.$activityCover = this.$el.find('#activityCover');
            this.$activityTitle = this.$el.find('#activityTitle');
            this.$activityDesc = this.$el.find('#activityDesc');
            this.bindFocus();
            this.initAds();
            this.on('hide', this.onHide);
        },

        initAds: function () {
            var scope = this;
            this.$el.find('.ad-slider').each(function (key, slider) {
                $(slider).ssss();
            });
        },
        initAdsPlayer: function () {
            this.$adsPlayer.html(Ads.youtube);
        },

        activate: function () {
            var scope = this;
            this.fetchCategories();
            this.initAdsPlayer();
            setTimeout(function () {
                App.throbberHide(true);
            }, 2000);
        },
        onHide: function () {
            this.$adsPlayer.html('');
        },
        onClick: function ($el, event) {
            this.onEnter.apply(this, arguments);
        },
        onEnter: function ($el, event) {
            if ($el.belongsTo(this.$header)) {
                var targetScene = $el.data('target');
                if (Scenes[targetScene]) {
                    Router.go(true, Scenes[targetScene]);
                }
                return;
            }
            // thumb enter handle
            if ($el.hasClass("activityCategory")) {
                this.$nav.find('.activityCategory').removeClass(activeClass);
                $el.addClass(activeClass);
                return this.fetchActivities($el.data('name'));
            }
            // main Activities handle
            if ($el.hasClass('activityThumb')) {
            }
        },
        bindFocus: function () {
            var scope = this;
            // render activity info when focus on activity thumb
            this.$activityScroller.on('focus', '.horizontal-item', function () {
                var $item = $(this);
                scope.setActiveActivity($item.data('title'), $item.data('cover'), $item.data('description'), $item.data('categoryName'));
            });
        },
        setActiveActivity: function (title, cover, description, category) {
            this.$activityCategory.html(category);
            this.$activityCover.css({
                backgroundImage: "url(" + cover + ")"
            });
            this.$activityTitle.html(title);
            this.$activityDesc.html(description);
        },
        fetchCategories: function () {
            var scope = this;
            RocketFApi.talk('activityCategories', {}, function (response) {
                scope.$navScroller.html(Template.render('tplActivitiesCategories', response));
                scope.navScroller = new HorizontalScroller(scope.$navScroller);
                scope.fetchActivities(response.data[0].title);
            });

        },
        fetchActivities: function (category) {
            var scope = this;
            var params = {
                category: category,
                page_size: CONFIG.contentAPI.pageSize
            };
            RocketFApi.talk('activitiesByCategories', params, function (response) {
                scope.$activityScroller.html(Template.render('tplActivitiesThumbs', response.data));
                scope.activityScroller = new HorizontalScroller(scope.$activityScroller);
                var firstItem = typeof(response.data.list[0]) !== undefined ? response.data.list[0] : null;
                if (firstItem) {
                    scope.setActiveActivity(firstItem.title, firstItem.poster, firstItem.details.description, firstItem.categoryName);
                }
            });
        },
        navigate: function (direction) {
            // if no focused -> focus first nav
            if (!this.hasFocus()) {
                return Focus.to(getNextFocus(this.$nav));
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
                    return Focus.to(getNextFocus(this.$nav));
                }
            }

            if (Focus.isIn(this.$activityScroller)) {
                if (direction == 'down') {
                    return Focus.to(this.$showPurchasedBtn);
                }
                if (direction == 'up') {
                    return Focus.to(getNextFocus(this.$nav));
                }
            }
            // channels categories handler
            if (Focus.isIn(this.$nav)) {
                if (direction == 'up') {
                    return Focus.to(getNextFocus(this.$header));
                }
                if (direction == 'down') {
                    return Focus.to(getNextFocus(this.$activityScroller));
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

            if (direction == "left") Focus.to(this.getCircleFocusable(-1));
            else if (direction == "right") Focus.to(this.getCircleFocusable(1));
        },
        /**
         * @inheritdoc Scene#create
         */
        create: function () {
            return $('#scene-FoodAndActivity');
        },
        /**
         * @inheritdoc Scene#render
         */
        render: function () {
        },
        onReturn: function ($el) {
            Router.goBack();
        }

    });

    return Scene_FoodAndActivity;

})(Scene);