Scene_Apps = (function (Scene) {

	var Scene_Apps = function () {
		this.construct.apply(this, arguments);
	};

	$.extend(true, Scene_Apps.prototype, Scene.prototype, {
		init: function () {
			this.fetchData();

			this.$galleryApps = this.$el.find('#appsSlideShow');
			this.$prevBtn = this.$el.find('.prevBtn');
			this.$nextBtn = this.$el.find('.nextBtn');
		},
		activate: function () {
			Focus.to(this.$galleryApps.find('.thumb:eq(0)'));
		},
		onClick: function ($el, event) {
			this.onEnter.apply(this, arguments);
		},
		onEnter: function ($el, event) {
			// arrows handle
			if ($el.hasClass("prevBtn")){
				Gallery.slidePrev(this.$galleryApps, false);
			}
			else if ($el.hasClass("nextBtn")){
				Gallery.slideNext(this.$galleryApps, false);
			}

			// thumb enter handle
			if ($el.hasClass("thumb")) {
				this.goToApp($el);
			}
		},
		navigate: function (direction) {
			if (Focus.isIn(this.$galleryApps.find('.thumbs'))) {
				switch (direction) {
					case "left":
						Gallery.slidePrev(this.$galleryApps); break;
					case "right":
						Gallery.slideNext(this.$galleryApps);break;
					case "up":
						Focus.to(this.$prevBtn);break;
					case "down":
						Focus.to(this.$nextBtn);break;
				}
			}
			else if (Focus.isIn(this.$prevBtn) && direction == 'right' || Focus.isIn(this.$nextBtn) && direction == 'left') {
				Focus.to(this.$galleryApps.find('.thumb.active'));
				return false;
			}
		},
		/**
		 * @inheritdoc Scene#create
		 */
		create: function () {
			return $('#scene-Apps');
		},
		/**
		 * @inheritdoc Scene#render
		 */
		render: function () {
		},
		onReturn: function ($el) {
			Router.goBack();
		},
		/**
		 * go to (open) active app
		 * @param $el
         */
		goToApp: function($el) {
			App.notification('Notice', 'Launch App ' + $el.data('appName'));
		},
		fetchData: function() {
			RocketFApi.fakeTalk('/apps', 'get', {}, function(response){
				if (response.status == API_SUCCESS) {
					var templateRendered = Mustache.render($('#tplAppsSlideshow').html(), response);
					$('#appsSlideShow').html(templateRendered);
				}
			});
		}
	});

	return Scene_Apps;

})(Scene);