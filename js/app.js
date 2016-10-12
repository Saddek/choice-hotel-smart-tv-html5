/**
 * Application class
 *
 * @author Mautilus s.r.o.
 * @class App
 * @singleton
 * @mixins Events
 * @mixins Deferrable
 */

App = (function(Events, Deferrable) {

	var App = {
	mac : '00000000ffee',
	ajaxCalling: [],
	/**
	 * @property {Boolean} networkStatus Network status, TRUE if connected
	 */
	networkStatus: true,
    mediaType: null,
    mediaId: null
	};

	$.extend(true, App, Events, Deferrable, {
		/**
		 * @event network
		 * Will be called when network status changes
		 * @param {Boolean} status
		 */

		/**
		 * Initialize Application
		 */
		init: function() {
			var scope = this;
			this.$throbber = $('#appThrobber');
			// is throbber visible
			this.throbberIsShown = true;
			this.noInteraction = false;
			// monitor network connection
			setInterval(function() {
				scope.checkNetworkConnection();
			}, 1000);
			this.login();
			this.loadModules();
			this.loadScenes();
			this.initRouter();
			this.initAjax();
			this.initGreeting();

			// add class active to keep latest focus
			$(document).on('focus', '.horizontal-item', function() {
				var $container = $(this).closest('.horizontal-scroller');
				$('.horizontal-item', $container).removeClass(activeClass);
				$(this).addClass(activeClass);
			});
		},
		login: function() {
			var data = {
				mac: this.mac,
				pin: 'acutek1234'
			};
			RocketFApi.talk('login', data,
				function(response){
					if (response.status == API_SUCCESS) {
						//login success
						console.log(response);
						// App.notification('Login Success', 'You have logged in successfully', 'success');
					} else {
						App.notification('Login Error', response.message, 'error');
					}
				},
				function(message) {
					if (!message) {
						message = "Authentication server response an error";
					}
					App.notification('Login Error', message, 'error');
				}
			)
		},
		// load module HTML
		loadModules: function() {
			var modules = ['header.html', 'popup.html', 'sidebar.html'];
			var modulesDir = './templates/modules/';
			for (i in modules) {
				$.ajax({
					url : modulesDir + modules[i],
					type: 'GET',
					async: false,
					success: function(rs){
						$('body').append(rs);
					}
				});
			}
		},
		// load module HTML
		loadScenes: function() {
			var scenes = ['landing', 'livetv', 'movies', 'purchased', 'concierge', 'food-and-activity', 'room-control', 'playback'];
			var scenesDir = './templates/scenes/';
			for (i in scenes) {
				$.ajax({
					url : scenesDir + scenes[i] + '.html',
					type: 'GET',
					async: false,
					success: function(rs){
						$('body').append(rs);
					}
				});
			}
		},
		initAjax: function() {
			var scope = this;
			$.ajaxSetup({
				beforeSend: function(xhr, request){
					scope.pushAjax(request.toString() + moment().unix().toString());
					scope.throbber(true);
				},
				complete: function(){
					scope.popAjax();
					scope.throbberHide(true);
				}
			});
		},
		initGreeting: function() {
			setInterval(function() {
				//set date to greeting
				$('.greetingHour').length && $('.greetingHour').text(moment().format('hh:mm:ss'));

			}, 1000);
			$('.greetingTime').length && $('.greetingTime').text(moment().format('h:mm A'));
			$('.greetingHour').length && $('.greetingHour').text(moment().format('hh:mm:ss'));
			$('.greetingDate').length && $('.greetingDate').text(moment().format('dddd, MMMM Do, YYYY'));
		},
		/**
		 * Register scenes and route to the `app` scene
		 *
		 * @private
		 */
		initRouter: function() {
			Router.addScene(Scenes.landing, new Scene_Landing);
			Router.addScene(Scenes.concierge, new Scene_Concierge);
			Router.addScene(Scenes.livetv, new Scene_LiveTV);
			Router.addScene(Scenes.movies, new Scene_Movies);
			Router.addScene(Scenes.purchased, new Scene_Purchased);
			Router.addScene(Scenes.activities, new Scene_FoodAndActivity);
			Router.addScene(Scenes.roomcontrol, new Scene_RoomControl);
			Router.addScene(Scenes.playback, new Scene_Playback);
		},
		/**
		 * @private
		 */
		checkNetworkConnection: function() {
			Device.checkNetworkConnection(function(status) {
				if (status !== this.networkStatus) {
					this.networkStatus = status;
					this.trigger('network', this.networkStatus);
				}
			}, this);
		},
		throbber: function(disable) {
			if (this.throbberIsShown)
				return; // only one instance of throbber
			if (disable) {
				this.toggleInteraction(false);
			}
			this.$throbber.show();
			this.throbberIsShown = true;

		},
		toggleInteraction: function(forceFlag) {
			var checkFlag = (forceFlag) == und ? !this.noInteraction : forceFlag;
			if (checkFlag) {
				Control.enable();
				Mouse.enable();
			} else {
				Control.disable();
				Mouse.disable();
			}
			this.noInteraction = checkFlag;
		},
		throbberHide: function(enable) {
			this.throbberIsShown = false;
			this.$throbber.hide();
			if (enable) {
				this.toggleInteraction(true);
			}
		},
		notification: function(title, msg, type) {
			Popup.showMessage(title, msg, type);
		},
		header: function(targetScene) {
			var $menuRendered = $(Template.render('tplHeader', {scene : targetScene}));
            $menuRendered.find('a.focusable.' + targetScene).addClass('active');
            return $menuRendered;
		},
        setMedia: function(type, id) {
            this.mediaType = type;
            this.mediaId = id;
        },
		pushAjax: function(name) {
			this.ajaxCalling.push(name);
		},
		popAjax: function() {
			this.ajaxCalling.pop();
		}
	});

	// Initialize this class when Main is ready
	Main.ready(function() {
		App.init();
		window.Popup = new Snippet_Popup();
		window.Sidebar = new Snippet_Sidebar();
		App.$throbber = $('#appThrobber');
		Router.go(true, Scenes.landing);
	});

	return App;

})(Events, Deferrable);

function c(data) {
	for(var i = 0; i<arguments.length; i++) {
    	console.log(arguments[i]);
  	}
}

var Ads = {
	youtube: '<iframe width="100%" height="100%" src="https://www.youtube-nocookie.com/embed/6pX8IsPV4HQ?rel=0&amp;controls=0&amp;showinfo=0&amp;autoplay=1" frameborder="0" allowfullscreen></iframe>'
};

var Scenes = {
    landing: "Landing",
    concierge: "Concierge",
    livetv: "LiveTV",
    movies: "Movies",
    purchased: "Purchased",
    activities: "FoodAndActivity",
    roomcontrol: "RoomControl",
    playback: "Playback"
};