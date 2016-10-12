/**
 * Player controls
 * 
 * Parent: [Scene_VideoPlayer]
 * 
 * @author Mautilus s.r.o.
 * @class Snippet_PlayerControls
 * @extends Snippet
 */

Snippet_PlayerControls = (function(Snippet) {

	var Snippet_PlayerControls = function() {
		this.construct.apply(this, arguments);
	};

	$.extend(true, Snippet_PlayerControls.prototype, Snippet.prototype, {
		/**
		 * @inheritdoc Snippet#init
		 */
		init: function() {
			var scope = this;
			this.name = 'snippet-player-controls';

			// init
			if (!this.inited) {
				this.inited = true;
				// Key events
				this.on('key', function(keyCode) {
					if (keyCode === Control.key.LEFT) {
						if (Player.currentState === Player.STATE_PLAYING) {
							this.parent.backward();
						}
						return false;
					} else if (keyCode === Control.key.RIGHT) {
						if (Player.currentState === Player.STATE_PLAYING) {
							this.parent.forward();
						}
						return false;
					} else if (keyCode === Control.key.UP) {
						//this.show();
						return false;
					} else if (keyCode === Control.key.DOWN) {
						//this.show();
						return false;
					} else if (keyCode === Control.key.ENTER) {
						if ((Player.currentState === Player.STATE_PLAYING) && (Player.currentTime > 0)) {
							this.parent.pause();
						} else if ((Player.currentState === Player.STATE_PAUSED) && (Player.currentTime > 0)) {
							this.parent.play();
						} else if ((Player.currentState !== Player.STATE_PLAYING)) {
							this.parent.play(this.parent.video);
						}
						return false;
					}
				}, this);

			}
		},

		/**
		 * @inheritdoc Snippet#create
		 */
		create: function() {
			return $('#snippet-player-controls', this.parent.$el);
		},

		/**
		 * @inheritdoc Snippet#render
		 * Render the list of tabs on welcome scene.
		 */
		render: function() {
			return this.when(function(promise) {
				promise.resolve();
			}, this);
		},

		/**
		 * @inheritdoc Snippet#focus
		 */
		focus: function() {
			Focus.to($('.controls-placeholder'), this.$el);
		},

		/**
		 * @inheritdoc Snippet#navigate
		 * Handle navigation within the snippet
		 */
		navigate: function(direction, stop) {
			stop();

			if (direction == 'left') {
				Focus.to(this.getFocusable(-1, true));
			} else if (direction == 'right') {
				Focus.to(this.getFocusable(1, true));
			} else if (direction == 'up') {
				// ...
			} else if (direction == 'down') {
				// ...
			}
		},

		/**
		 * @inheritdoc Snippet#onClick
		 * Call onEnter() on focused element
		 */
		onClick: function($el,e,stop) {
			stop();
			this.onEnter($el,e,stop);
		 },

		/**
		 * Event called after Enter is pressed
		 * @param {Object} $el jQuery object of element on enter was triggered
		 * @param {Object} e HTML event
		 * @param {Function} stop Stop function 
		 */
		onEnter: function($el,e,stop) {
		},

		/**
		 * @inheritdoc Snippet#onFocus
		 * Call on focused element
		 * @param {Object} $el jQuery object of element which focused
		 */
		onFocus: function($el) {
			// default trigger
			this.trigger('focus', $el);
		}
	});

	return Snippet_PlayerControls;

})(Snippet);