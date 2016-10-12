Scene_LiveTV = (function(Scene) {

	var Scene_LiveTV = function() {
		this.construct.apply(this, arguments);
	};

	$.extend(true, Scene_LiveTV.prototype, Scene.prototype, {
		init: function(){
			var scope = this;
			this.$el.prepend(App.header(Scenes.livetv));
			this.$header = this.$el.find('.appMenu');
            this.$programInfo = this.$el.find('.liveTV_info');
			this.$playingProgram = this.$el.find('.liveTV_info-container');
			this.$adsPlayer = this.$el.find('#adsPlayer');
			this.$timelineList = this.$el.find('#timelineList');
            this.$channelsList = this.$el.find('#channelList');
            this.$programList = this.$el.find('#programList');
			this.playingChannelId = 1;
            this.playingProgramId = 0;
			this.playingProgramStart = 0;
			this.playingProgramEnd = 0;

			//render timeline
			this.renderTimeline();
            // fetch data
            this.fetchChannels();
			this.updateTimeline();
            this.updateTimelineInterval = setInterval(function(){
                scope.updateTimeline(true);
            }, 10000);
			// update time line active
			setTimeout(function(){
				var $currentTime = scope.$el.find('.first-red.item.item-border');
				scope.scrollTimelineHorizontal(-1 * $currentTime.position().left + 500, 0);
				scope.updateBlocksSize();
				scope.initAds();
				App.throbberHide();
			}, 1000);
			this.bindFocus();
            this.on('hide', this.onHide);
            this.on('show', this.onShow);
		},
		updateBlocksSize: function() {
			var programInfoHeight = $(window).height() - this.$el.find('header').height() - this.$el.find('section.channels').height();
			this.$el.find('section.info').height(programInfoHeight);
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
		renderTimeline: function() {
        	var begin = moment().startOf('day');
			var now = moment();
			var flag = 0;
			for ($i = 0; $i < 48; $i++) {
				var isActive = false;
				if (begin > now && ((begin.unix() - now.unix()) < 1800)) {
					isActive = true;
					flag = $i;
				}
				begin = begin.add(30 * 60, 'seconds');
				var params = {
					active: isActive,
					text: begin.format('HH:mm A')
				};
				this.$timelineList.append(Template.render('tplTimeline', params));
			}
			timelineActive = flag;
        },
		bindFocus: function() {
			var scope = this;
			// focus on channels categories
			$(document).on('focus', '.channelCategory', function(){
				scope.$nav.find('.channelCategory').removeClass(activeClass);
				$(this).addClass(activeClass);
			});

			// bind event focus to change program info
			$(document).on('focus', '.programLink', function(){
				scope.$programList.find('.programLink.'+activeClass).removeClass(activeClass);
				$(this).addClass(activeClass);
				var program = $(this).data();
				var container = $(this).closest('.channel02');
				scope.setActiveProgram(program, true);
				//active channel
				ProgramList.activeChannel(program.idChannel);
				//centered program
				ProgramList.horizontalCenter($(this));
			});

		},
        onHide: function() {
            this.$adsPlayer.html('');
        },
        onShow: function() {
           this.initAdsPlayer();
        },
		render: function() {
			if(Main.device[0] === 'webos') {
				Device.clearHistory();
			}
		},
		activate: function() {
			var scope = this;
			setTimeout(bind(function() {
				Focus.to(scope.$programList.find('.focusable.channel-active:eq(0)'));
			}, this), 750);
			setTimeout(bind(function() {
				App.throbberHide(true);
			}, this), 3000);
		},
		onClick: function($el, event) {
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
			// program link enter
			if($el.hasClass('programLink')) {
				Router.go(true, Scenes.playback);
			}
		},
		navigate: function(direction) {
			if (Focus.isIn(this.$header) && direction == 'down') {
				Focus.to(getNextFocus(this.$programList));
				return;
			}
			// program list handler
			if (Focus.isIn(this.$programList)) {
				var focusing = this.$programList.find('.programLink.focus');
				if (direction == 'up' || direction == 'down') {
					var $currentChannel = Focus.focused.closest('.channel02');
					var currentIndex = $currentChannel.index();
					var $channelsList = this.$programList.find('ul.channel02');
					if (direction == 'up') {
						if (currentIndex > 0) {
							var $targetChannel = $channelsList.eq(currentIndex - 1);
						} else {
							// turn back focus to navigation
							Focus.to(getNextFocus(this.$header));
							return;
						}
					}
					if (direction == 'down') {
						var $targetChannel = $channelsList.eq(currentIndex + 1);	
					}
				
					ProgramList.changeChannel(Focus.focused, $targetChannel, direction);
					return;
				}
				
				if (direction == "left") {
					if (focusing.length && focusing.parent().index() > 0) {
						Focus.to(this.getCircleFocusable(-1));
					}
				}
		 		else if (direction == "right") {
		 			var end = focusing.parent().siblings().length;
 					if (focusing.length && focusing.parent().index() < end - 1) {
						Focus.to(this.getCircleFocusable(1));
					}
		 		}
		 		return;
			}

		 	if (direction == "left") Focus.to(this.getCircleFocusable(-1));
		 	else if (direction == "right") Focus.to(this.getCircleFocusable(1));
		},
		/**
		 * @inheritdoc Scene#create
		 */
		create: function() {
			return $('#scene-LiveTV');
		},
		setActiveProgram: function (program, hideTimeLoad) {
			var now = moment();
			var start = moment.unix(parseInt(program.start) / 1000);
			var end = moment.unix(parseInt(program.end) / 1000);
			program.isPlaying = start <= now && end > now;

			program.beginTime = start.format('hh:mm');
			program.endTime = end.format('hh:mm');
			program.hideTimeLoad = !program.isPlaying;
			this.$playingProgram.html(Template.render('tplLiveTVProgram', {program: program}));
			this.playingProgramId = program.idProgram;
			this.playingProgramStart = parseInt(program.start);
			this.playingProgramEnd = parseInt(program.end);
			// update background
			this.updateTimeline(true);
		},
		fetchPlaying: function(channelId) {
			var scope = this;
			var params = {
				channel_id: this.playingChannelId,
				date : moment().format('YYYY-MM-DD'),
				time: moment().format('h:mm'),
				omit_description: true
			};
			RocketFApi.talk('programDetail', params, function(response){
				if (response.data.list.length) {
					var program = response.data.list[0];//beginTime
					scope.setActiveProgram(program);
				}
			});
		},
		updateTimeline: function(noFetch) {
			noFetch = typeof (noFetch) != und ? noFetch : false;
			if (!this.playingProgramEnd || !this.playingProgramStart) {
				if (!noFetch) {
					this.fetchPlaying(this.playingChannelId);
				}
                return false;
			}

			var fullDuration = this.playingProgramEnd - this.playingProgramStart;
			var playedTime = moment().valueOf() - this.playingProgramStart;
			var percent = playedTime / fullDuration * 100;
			if (percent > 100) {
                // fetch new program if current program going to end
				if (!noFetch) {
					this.fetchPlaying(this.playingChannelId);
				}
                percent = 100;
			}
            this.$playingProgram.find('.time-load-icon').css({left : percent+'%'});
		},
        fetchChannels: function(categoryId) {
            var scope = this;
            var params = {
                category_id : categoryId,
                page_size : CONFIG.contentAPI.pageSize
            };
            RocketFApi.talk('channelList', params, function(response){
                scope.channels = response.data.list;
                scope.$channelsList.html(Template.render('tplChannelsList', {channels: response.data.list}));
                scope.initChannelsList();
            });
		},
        initChannelsList: function() {
            //fetch channels programs
            this.fetchPrograms(this.channels);
        },
        fetchPrograms: function(channels) {
            this.$programList.html('');
            for (i in channels) {
                this.fetchChannelPrograms(channels[i].id, i);
            }
			setTimeout(function() {
                ProgramList.setUp(channels.length);
            }, 1000);
		},
        fetchChannelPrograms: function(channelId, calledCount) {
            var scope = this;
            var params = {
                channel_id : channelId,
                date : moment().format('YYYY-MM-DD'),
                page_size : 100,
				// extra param for fake API only
				calledCount: calledCount
            };
            RocketFApi.talk('programList', params, function(response){
            	var programsOutput = '';
            	var now = moment();
            	var previousEnd = moment().startOf('day');
            	for (i in response.data.list) {
            		var program = response.data.list[i];
					var start = moment(parseInt(program.start));
					var end = moment(parseInt(program.end));
					// different greater than 3minute -> render no info
					var diffs = start.unix() - previousEnd.unix();
                    if (diffs > 180) {
                    	var noInfoStart = (previousEnd.unix() + 60) * 1000;
                    	var noInfoEnd = (start.unix() - 60) * 1000;
                    	var duration = noInfoEnd - noInfoStart ;
                    	duration = Math.round(moment.duration(duration, 'ms').asMinutes());
                    	var params = {
	                    	channel: channelId,
	                    	program: ProgramList.createNoInfoProgram(noInfoStart, noInfoEnd, duration, channelId),
	                    	isPlaying: noInfoStart <= now.valueOf() && noInfoEnd > now.valueOf(),
	                    	percent: duration / (24 * 60) * 100
	                    };
                    	
                    	programsOutput += Template.render('tplProgramNoInfo', params);
                    } 

                    var params = {
                    	channel: channelId,
                    	program: program,
                    	isPlaying: start <= now && end > now,
                    	percent: program.duration / (24 * 60) * 100
                    };
            		previousEnd = end;
                	programsOutput += Template.render('tplProgramHasInfo', params);
            	}
                scope.$programList.append(Template.render('tplProgramList', {programs: programsOutput}, {noEscape: true}));
            });
        },
		scrollTimelineHorizontal: function (leftPos, duration) {
			if (typeof duration == und) {
				duration = 300;
			}
			$('.scrollyeah__shaft').animate({left : leftPos + 'px'}, duration);
		}		
	});
	return Scene_LiveTV;

})(Scene);


var ProgramList = {
	totalChannels: 0,
	channelHeight: 90,
	verticalScroller: null,
	leftPanel: null,
	viewport : {
		top: null,
		left: null,
		right: null,
		bottom: null
	},
	emptyProgram: {
		title: "No info",
		description: "No schedule information"
	},
	createNoInfoProgram: function(start, end, duration, idChannel){
		var noInfoProgram = this.emptyProgram;
		noInfoProgram.start = start;
		noInfoProgram.end = end;
		noInfoProgram.duration = duration;
		noInfoProgram.idChannel = idChannel;

		return noInfoProgram;
	},
	setUp: function(totalChannels) {
		this.verticalScroller = $('#programList');
		this.leftPanel = $('#channelList');
		this.totalChannels = totalChannels;

		var containerPos = elementPos(this.verticalScroller);
        var leftPanelPost = elementPos(this.leftPanel);
		// update viewport of container
		this.viewport = {
			top: containerPos.top,
			left: containerPos.left,
			right: containerPos.right,
			bottom: containerPos.bottom,
			width: $(window).width() - leftPanelPost.width - 160,
			height: containerPos.height
		};
	},
	horizontalCenter: function($el){
        if (this.scroller == null) {
            // we dont want to do this, but cause of AJAX
            this.scroller = $('.scrollyeah__shaft');
        }
        App.toggleInteraction(false);
        var animateLeft = 0;
        var program = $el.parent();
        var programPos = program.index();
        var elRelativeRect = this.relativeRect($el);
        var centerLeft = (this.viewport.width - elRelativeRect.width) / 2;
        if(programPos == 0) {
            // when we reach begin of line
            animateLeft = 0;
        } else {
            if (programPos == (program.parent().find('.programLink').length - 2)) {
                // when we reach end of line
                var moveLeft = Math.round(this.viewport.width - elRelativeRect.width - elRelativeRect.left) ;
            } else {
                // move to center of channel programs
                var moveLeft = Math.round(centerLeft - elRelativeRect.left) ;
            }

            var currentLeft = parseInt(this.scroller.css('left').replace('px', ''));
            var newLeft = currentLeft + moveLeft;
            if (newLeft > 0) {
                animateLeft = 0;
            } else {
                if (moveLeft > 0) {
                    var direction = '+';
                } else {
                    var direction = '-';
                }
                animateLeft = direction + '=' + Math.abs(moveLeft) + "px";
            }
        }

		this.scroller.animate({
			left : animateLeft
		}, 300);
		setTimeout(function(){
			App.toggleInteraction(true);
		}, 250);
	},
	relativeRect : function(el){
		var elRect = elementPos(el);
		return {
			left: elRect.left - this.viewport.left,
			top: elRect.top - this.viewport.top,
			right: elRect.right - this.viewport.right,
			bottom: elRect.bottom - this.viewport.bottom,
			width: elRect.width,
			height: elRect.height
		};
	},
	changeChannel: function($activeProgram, $targetChannel, direction) {
		var activeProgram = $activeProgram.data();
		var $programs = $targetChannel.find(".programLink");
		var $targetProgram = null;
		//detect next focus program
		for (i in $programs) {
			var $program = $programs.eq(i);
			var programData = $program.data();
			if (programData.end > activeProgram.start) {
				var matchedPercent = ((programData.end - activeProgram.start) / (activeProgram.end - activeProgram.start)) * 100;
				if (matchedPercent > 40) {
					$targetProgram = $program;
					break;
				} else {
					$targetProgram = $programs.eq(i+1).length ? $programs.eq(i+1) : $program;
					break;
				}
			}
			if ($targetProgram == null && i == $programs.length - 1) {
				$targetProgram = $program;
			}
		}

        $targetProgram = $targetProgram != null ? $targetProgram : $targetChannel.find(".programLink:last");
		var channelPos = $targetChannel.index();
		var totalChannel = $targetChannel.siblings().length + 1;

		// do animation
		var elRelativeRect = this.relativeRect($targetProgram);
		var centerTop = (this.viewport.height - elRelativeRect.height) / 2;
		if(channelPos <= 1) {
			// when we reach begin of channels
			animateTop = 0;
		} else {
			animateTop =  -1 * (channelPos - 1) * this.channelHeight;
		}
		this.verticalScroller.animate({
			top: animateTop
		}, 300);
		this.leftPanel.animate({
			top: animateTop
		}, 300);

		Focus.to($targetProgram);
	},
	activeChannel: function(idChannel) {
		this.leftPanel.find('.channelLink').removeClass(activeClass);
		this.leftPanel.find('#channel-' + idChannel).addClass(activeClass);
	}
};