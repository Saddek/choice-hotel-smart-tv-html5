/*
 ********************************************************
 * Copyright (c) 2013 Mautilus s.r.o. (Czech Republic)
 * All rights reserved.
 *
 * You may obtain a copy of the License at LICENSE.txt
 ********************************************************
 */

/**
 * Samsung Player class
 * 
 * @author Mautilus s.r.o.
 * @class Device_Samsung_Player
 * @extends Player
 */

Device_Samsung_Player = (function(Events) {
	var Device_Samsung_Player = {
	};

	$.extend(true, Device_Samsung_Player, {

		/**
		 * @inheritdoc Player#initNative
		 */
		initNative: function() {
			this.el = Device.SEFPLAYER;
			this.$el = $(this.el);
			// need for correction timeshift liveStream
			this._lastSeekBy = 0;     // milisec
			this._accSeekTime = 0;    // milisec
			this._realLastSeekBy = 0; // milisec
			this._lastTime = null;    // milisec

			this.el.OnEvent = this.onEvent;
			this.el.Open('Player', '0001', 'InitPlayer');

		},

		/**
		 * @inheritdoc Player#deinitNative
		 */
		deinitNative: function() {
			this.el.Execute('Stop');
			this.el.Close();
		},

		/**
		 * @inheritdoc Player#native
		 */
		native: function(cmd, attrs) {
			var url;

			if (cmd === 'play') {
				if (attrs && attrs.url) {
					this.el.Execute('Stop');

					url = this.prepareUrl(this.url);
					console.network('PLAYER', url);

					this.el.Execute('InitPlayer', url);
					//init
					//console.log('INIT working variable');
					this._lastSeekBy = 0;     // milisec
					this._accSeekTime = 0;    // milisec
					this._realLastSeekBy = 0; // milisec
					this._lastTime = null;    // milisec

					if (this.customData) {
						// set DRM custom data
						this.el.Execute('SetPlayerProperty', '3', this.customData, this.customData.length);
					}
				}

				if (attrs && attrs.position) {
					// StartPlayback takes position in seconds
					this.el.Execute('StartPlayback', parseFloat(attrs.position, 10) / 1000);

				} else {
					this.el.Execute('StartPlayback', 0);
				}

				this.state(this.STATE_PLAYING);
				return true;

			} else if (cmd === 'pause') {
				this.el.Execute('Pause');
				this.state(this.STATE_PAUSED);
				return true;

			} else if (cmd === 'stop') {
				return this.el.Execute('Stop');

			} else if (cmd === 'seek') {
				var position = Math.round((attrs.position - this.currentTime) / 1000);
				this._lastSeekBy = position;
				if (attrs.position === 0) {
					position = Math.round(this.currentTime / 1000);
					this._lastSeekBy = (position * -1);
					this.el.Execute('JumpBackward', position);

				} else if (position >= 0) {
					this.el.Execute('JumpForward', position);

				} else {
					this.el.Execute('JumpBackward', position * -1);
				}

				return true;

			} else if (cmd === 'playbackSpeed') {
				return this.el.Execute('SetPlaybackSpeed', attrs.speed);

			} else if (cmd === 'show') {
				this.width = attrs.width || this.width;
				this.height = attrs.height || this.height;
				this.top = (typeof attrs.top !== 'undefined' ? attrs.top : this.top);
				this.left = (typeof attrs.left !== 'undefined' ? attrs.left : this.left);

				this.$el.css('visibility', 'visible');

				this.el.Execute('SetDisplayArea', Math.round(this.left / 1.333), Math.round(this.top / 1.333), Math.round(this.width / 1.333), Math.round(this.height / 1.333));

			} else if (cmd === 'hide') {
				// stop clears the screen
				this.el.Execute('Stop');

				this.$el.css('visibility', 'hidden');

				if (Device.PLUGIN && Device.PLUGIN.setOffScreenSaver) {
					Device.PLUGIN.setOffScreenSaver();
				}

			} else if (cmd === 'setVideoDimensions') {
				var h = Math.round((this.width / attrs.width) * attrs.height);
				// widescreen
				if (h <= 720) {
					this.left = 0;
					this.top = Math.round((this.height - h) / 2);
					this.width= 1280;
					this.height = h;
				// not widescreen
				} else {
					var w = Math.round((this.height / attrs.height) * attrs.width);
					this.left = Math.round((this.width - w) / 2);
					this.top = 0;
					this.width= w;
					this.height = 720;
				}

				this.el.Execute('SetDisplayArea', Math.round(this.left / 1.333), Math.round(this.top / 1.333), Math.round(this.width / 1.333), Math.round(this.height / 1.333));

			} else if (cmd === 'currentBitrate') {
				return this.el.Execute('GetCurrentBitrates');

			} else if (cmd === 'audioTrack') {
				if (!this.duration) {
					this.one('durationchange', function() {
						this.el.Execute('SetStreamID', 1, attrs.index || 0);
					}, this);

					return;
				}
				return this.el.Execute('SetStreamID', 1, attrs.index || 0);

			} else if (cmd === 'mute') {
				// @todo: implement mute native API, http://www.samsungdforum.com/Guide/ref00014/sef_plugin_audio.html

			} else if (cmd === 'unmute') {
				// @todo: implement un-mute native API
			}

		},

		/**
		 * @private
		 */
		prepareUrl: function(url) {
			if (typeof url === 'object' && url.DRM_URL) {
				return this.prepareUrlWidevine(url);
			}

			if (url.match(/\.wvm/) && !url.match(/\|COMPONENT\=WV/)) {
				return this.prepareUrlWidevine($.extend(true, {}, this.config.DRMconfig || {}, {url: url}));

			} else if (url.match(/\.m3u8/) && !url.match(/\|COMPONENT\=HLS/)) {
				url += '|COMPONENT=HLS';

			} else if (this.customData && !url.match(/\|COMPONENT\=/)) {
				url += '|COMPONENT=WMDRM';
			}

			return url;
		},

		/**
		 * @private
		 */
		prepareUrlWidevine: function(opts) {
			var url = String(opts.url);

			var optsStr = [];
			var defaults = {
					'DEVICE_ID': this.getESN(),
					'DEVICE_TYPE_ID': 60,
					'COMPONENT': 'WV'
			};

			opts = $.extend(true, {}, defaults, opts);

			$.each(opts, function(k, v) {
				if (k !== 'url') {
					optsStr.push(k + '=' + v);
				}
			});

			return url + '|' + optsStr.join('|');
		},

		/**
		 * @private
		 */
		getESN: function() {
			var deviceId = null;

			try {
				deviceId = Device.EXTERNALWIDGET.GetESN('WIDEVINE');

			} catch (e) {
				return false;
			}

			return deviceId;
		},

		onDurationChange: function(duration) {
			this.duration = Math.round(duration);
			this.trigger('durationchange', this.duration);
		},

		/**
		 * @private
		 */
		OnBufferingStart: function() {
			this.state(this.STATE_BUFFERING);
		},

		/**
		 * @private
		 */
		OnBufferingComplete: function() {
			this.state(this.prevState !== this.STATE_BUFFERING ? this.prevState : this.STATE_PLAYING);
		},

		/**
		 * @private
		 */
		OnCurrentPlayTime: function(time) {

			if (this.isTimeshiftedLiveStream) {
				this._lastSeekBy = (this._lastSeekBy || 0) * 1000; // to ms
				this._accSeekTime = this._accSeekTime || 0;
				this._realLastSeekBy = 0;
				if(this._lastSeekBy) {
					this._lastTime = this._lastTime === null ? this.duration : this._lastTime;
					this._realLastSeekBy = time - this._lastTime;
					if(this._realLastSeekBy > 1500 || this._realLastSeekBy < -1500) {  // assurance about done real seek
						this._accSeekTime += this._realLastSeekBy;                     // accumulate seekTimes
						this._accSeekTime = this._accSeekTime > 0 ? 0 : this._accSeekTime;   // check bounds of accSeekTime 
						this._lastSeekBy = 0;                                          // clear lastSeek					
					}
				}
				// console.warn('SAM currTime: ' + toTimee(time) + ', duration: ' + this.duration + '(ms), isTimeShift: ' + this.isTimeshiftedLiveStream + ', lastSeekBy: ' + this._lastSeekBy + ', realLastSeekBy: ' + this._realLastSeekBy + ', accSeekTime: ' + this._accSeekTime);		

				this._lastTime = time;                      // save currTime
				var corrTime = this.duration + this._accSeekTime;  // correct currTime
				time = corrTime;
			}

			this.onTimeUpdate(time);

			if (this.duration && this.looping && time >= this.duration - 1200) {
				// stop 1.2s before its end, because it solves hang issue while looping
				this.onEnd();

			} else if (this.duration && this.duration > 0 && time >= this.duration) {
				this.onEnd();
			}
		},

		/**
		 * @private
		 */
		OnStreamInfoReady: function() {
			this.onDurationChange(this.el.Execute('GetDuration'));
		},

		/**
		 * @private
		 */
		OnStreamNotFound: function() {
			this.onError(1, 'not_found');
		},

		/**
		 * @private
		 */
		OnNetworkDisconnected: function() {
			this.onError(2, 'connection');
		},

		/**
		 * @private
		 */
		OnConnectionFailed: function() {
			this.onError(2, 'connection');
		},

		/**
		 * @private
		 */
		OnRenderError: function(errorCode) {
			var msg = '';

			if (errorCode === 1) {
				msg = 'Unsupported container';
			} else if (errorCode === 2) {
				msg = 'Unsupported video codec';
			} else if (errorCode === 3) {
				msg = 'Unsupported audio codec';
			} else if (errorCode === 6) {
				msg = 'Corrupted stream';
			}

			this.onError(3, 'render', msg);
		},

		/**
		 * @private
		 */
		OnDRMError: function(errorCode) {
			var msg = '';

			this.onError(4, 'drm', msg);
		},

		/**
		 * @private
		 */
		OnCustomEvent: function(code) {
			this.onError(code, 'custom');
		},

		/**
		 * State 7
		 * @private
		 */
		OnPlaybackStart: function() {
			this.trigger('playbackstart');
		},

		/**
		 * @private
		 */
		onEvent: function(eventCode, param) {
			if (eventCode === 1 || eventCode === 2) {
				// 2 = OnAuthenticationFailed
				Player.OnConnectionFailed();

			} else if (eventCode === 3) {
				Player.OnStreamNotFound();

			} else if (eventCode === 4) {
				Player.OnNetworkDisconnected();

			} else if (eventCode === 6) {
				Player.OnRenderError(param);

			} else if (eventCode === 7) {
				Player.OnPlaybackStart();

			} else if (eventCode === 9) {
				Player.OnStreamInfoReady();

				try {
					console.info('Player Info >>>' + "\n"
							+ ' URL: ' + Player.prepareUrl(Player.url) + "\n"
							+ ' Duration: ' + Player.el.Execute('GetDuration') + "\n"
							+ ' Resolution: ' + Player.el.Execute('GetVideoResolution') + "\n"
							+ ' Bitrates: ' + Player.el.Execute('GetAvailableBitrates') + "\n"
							+ ' Audio tracks: ' + Player.el.Execute('GetTotalNumOfStreamID', 1) + "\n"
							+ ' Subtitle tracks: ' + Player.el.Execute('GetTotalNumOfStreamID', 5)
					);

				} catch (e) {

				}

			} else if (eventCode === 11) {
				Player.OnBufferingStart();

			} else if (eventCode === 12) {
				Player.OnBufferingComplete();

			} else if (eventCode === 14) {
				Player.OnCurrentPlayTime(param);

			} else if (eventCode === 100) {
				Player.OnDRMError(param);
			}
		}
	});

	return Device_Samsung_Player;

})(Events);