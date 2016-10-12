/**
/**
 * Landing scene
 *
 * @author Mautilus s.r.o.
 * @class Scene_Welcome
 * @extends Scene
 */

Scene_Landing = (function (Scene) {

	var Scene_Landing = function () {
		this.construct.apply(this, arguments);
	};

	$.extend(true, Scene_Landing.prototype, Scene.prototype, {
		init: function () {
			this.$top = this.$el.find('#topSection');
			this.$bottom = this.$el.find('#bottomSection');
			this.$sticker = this.$el.find('#div_sticker');
			this.$welcome = this.$el.find('#welcome');
			this.$menu = this.$el.find('#menuBar');
			this.$topSlider = this.$el.find('#topSlider');
			this.bindFocus();
		},
		initTopSlider: function() {
			this.$topSlider.ssss();
		},
		resize: function() {
			var windowHeight = $(window).height();
			this.$top.height(windowHeight * 0.55);
			this.$bottom.height(windowHeight * 0.45);
			this.$bottom.find('.landing-banner.small').height(windowHeight * 0.45 / 2);
			this.$welcome.height(this.$top.height() - this.$menu.height());
		},
		activate: function () {
			var scope = this;
			setTimeout(function(){
				if (!scope.inited) {
                    scope.resize();
                    scope.initTopSlider();
                    scope.inited = true;
                }
			}, 200);
            App.throbberHide(true);
            c(getNextFocus(this.$menu));
            Focus.to(getNextFocus(this.$menu));
        },
		onClick: function ($el, event) {
			this.onEnter.apply(this, arguments);
		},
		onEnter: function ($el, event) {
			if ($el.hasClass('menu-item') || $el.hasClass('promotionLink')) {
				var targetScene = $el.data('target');
				if (Scenes[targetScene]) {
					Router.go(true, Scenes[targetScene]);
				} else {
	                Router.go(true, Scenes.landing);
	            }
			}

		},
		bindFocus: function() {
            var scope = this;
			var $navItems = this.$menu.find('.focusable');
			$(document).on('focus', '#menuBar a.focusable, #bottomSection a.focusable', function(){
				$(this).closest('.focusable-container').find('.focusable').removeClass(activeClass);
				$(this).addClass(activeClass);
			});
		},
		navigate: function (direction) {
			if (!this.hasFocus()) {
				this.focus();
				return;
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

			if (Focus.isIn(this.$menu)) {
				if (direction == 'down') {
					Focus.to(getNextFocus(this.$bottom));
					return;
				}
				if (direction == 'up') {
					Focus.to(this.$sticker);
					return;
				}
			}
			if (Focus.isIn(this.$sticker) && direction == 'down') {
				Focus.to(this.$menu.find('.' + activeClass));
				// return;
			}
			if (Focus.isIn(this.$bottom) && direction == 'up') {
				Focus.to(getNextFocus(this.$menu));
				// return;
			}

			if (direction == "left") Focus.to(this.getCircleFocusable(-1));
			else if (direction == "right") Focus.to(this.getCircleFocusable(1));
		},
		/**
		 * @inheritdoc Scene#create
		 */
		create: function () {
			return $('#scene-Landing');
		},
		/**
		 * @inheritdoc Scene#render
		 */
		render: function () {
		},
		onReturn: function ($el) {
			if (typeof(webOS) != und && typeof (webOS.platformBack) == 'function') {
				webOS.platformBack();
			} else {
				Router.goBack();
			}
		}

	});

	return Scene_Landing;

})(Scene);