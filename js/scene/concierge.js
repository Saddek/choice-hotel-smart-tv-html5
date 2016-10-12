/**
/**
 * Concierge scene
 *
 * @author Mautilus s.r.o.
 * @class Scene_Welcome
 * @extends Scene
 */

Scene_Concierge = (function (Scene) {

	var Scene_Concierge = function () {
		this.construct.apply(this, arguments);
	};

	$.extend(true, Scene_Concierge.prototype, Scene.prototype, {
		init: function () {
			this.$activeMenu = '';
			this.$el.prepend(App.header(Scenes.concierge));
			this.$header = this.$el.find('.appMenu');
			this.$menu = this.$el.find('#verticalMenu');
			this.$contents = this.$el.find('#conciergeContent');
			this.loadStaticContents();
			this.bindFocus();
		},
		bindFocus: function() {
			var scope = this;
			this.$menu.on('focus', '.concierge-item', function(){
				var target = scope.getSubContainer($(this));
				if (target.length) {
					scope.switchContent(target);
					scope.$activeMenu = $(this);
				}
			});
		},
		switchContent : function($target) {
			this.$contents.find('.concierge-sub-content').removeClass(activeClass);
			$target.addClass(activeClass);
		},
		loadStaticContents: function() {
			var scope = this;
			var contents = ['room-services.html', 'car-rental.html', 'checkout.html', 'business-center.html', 'house-keeping.html', 'valet.html', 'parental-control.html'];
			$.each(contents, function (key, item) {
				var url = './templates/concierge/' + item;
				$.get(url, {}, function(rs){
					scope.$contents.append(rs);
				});
			});
		},
		activate: function () {
			var scope = this;
			Focus.to(getNextFocus(this.$menu));
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
			}
		},
		navigate: function (direction) {
			if (!this.hasFocus()) {
				return Focus.to(getNextFocus(this.$menu));
			}

			if (
				direction == 'left'
				&& Focus.isIn(this.$contents)
				&& Focus.isIn(this.getSubContainer(this.$activeMenu).find('.backToMenu'))
			) {
				return Focus.to(this.$activeMenu);
			}

			if (Focus.isIn(this.$menu)) {
				if (direction == 'up' && Focus.focused.hasClass('first')) {
					return Focus.to(getNextFocus(this.$header));
				}
				if (direction == 'down' && Focus.focused.hasClass('last')) {
					return;
				}
				if (direction == 'right') {
					var $nextFocus = getNextFocus(this.getSubContainer(Focus.focused));
					if ($nextFocus) {
						return Focus.to($nextFocus)
					} else {
						return;
					}

				}
			}

			if (Focus.isIn(this.$header)) {
				if (direction == 'down') {
					return Focus.to(getNextFocus(this.$menu));
				}
				if (direction == "left") {
					if (Focus.focused.hasClass('first')) {
						return;
					}
					return Focus.to(this.getCircleFocusable(-1));
				}
				if (direction == "right") {
					if (Focus.focused.hasClass('last')) {
						return;
					}
					return Focus.to(this.getCircleFocusable(1));
				}
			}
			if (Focus.isIn(this.$contents.find('.concierge-sub-content:eq(0)'))) {
				//sub content room services
				if (direction == 'up' && Focus.focused.hasClass('first')) {
					return;
				}
				if (direction == 'down' && Focus.focused.hasClass('last')) {
					return;
				}
				if (direction == 'left') {
					return Focus.to(getNextFocus(this.$menu));
				}

				if (direction == 'right') {
					var $nextFocus = getNextFocus(this.getSubContainerChild(Focus.focused.closest('.concierge-sub-content')));
					if ($nextFocus.length) {
						return Focus.to($nextFocus);
					}
				}
			}

			if (direction == "up") Focus.to(this.getCircleFocusable(-1));
			if (direction == "down") Focus.to(this.getCircleFocusable(1));
		},
		getSubContainer: function($menu) {
			var target = $menu.data('target');
			return this.$el.find('.concierge-sub-content' + target);
		},
		getSubContainerChild: function($subContainer) {
			return $subContainer.find('.concierge-sub-content-child');
		},
		/**
		 * @inheritdoc Scene#create
		 */
		create: function () {
			return $('#scene-Concierge');
		},
		/**
		 * @inheritdoc Scene#render
		 */
		render: function () {
		}
	});

	return Scene_Concierge;

})(Scene);