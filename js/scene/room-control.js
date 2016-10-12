/**
/**
 * RoomControl scene
 * 
 * @author Mautilus s.r.o.
 * @class Scene_Welcome
 * @extends Scene
 */

Scene_RoomControl = (function (Scene) {

	var Scene_RoomControl = function () {
		this.construct.apply(this, arguments);
	};

	$.extend(true, Scene_RoomControl.prototype, Scene.prototype, {
		init: function () {
			
		},
		
		activate: function () {
			var scope = this;
			App.throbberHide();
		},
		onClick: function ($el, event) {
			this.onEnter.apply(this, arguments);
		},
		onEnter: function ($el, event) {
		},
		navigate: function (direction) {
			if (direction == "left") Focus.to(this.getCircleFocusable(-1));
			else if (direction == "right") Focus.to(this.getCircleFocusable(1));
		},
		/**
		 * @inheritdoc Scene#create
		 */
		create: function () {
			return $('#scene-RoomControl');
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

	return Scene_RoomControl;

})(Scene);