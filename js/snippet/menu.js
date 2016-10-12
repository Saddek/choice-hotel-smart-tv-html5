Snippet_Menu = (function(Snippet) {

    var Snippet_Menu = function() {
        this.construct.apply(this, arguments);
    };

    $.extend(true, Snippet_Menu.prototype, Snippet.prototype, {
        /**
         * @inheritdoc Snippet#init
         */

        selector: {
            navlink: '.nav-link'
        },
        init: function() {
            var scope = this;
            this.name = 'snippet-Menu';
            this.$nav = this.$el.find(this.selector.navlink);
            // init
            if (!this.inited) {
                this.inited = true;
            }
            this.on('show', this.onShow);
            this.on('hide', this.onHide);
            this.on('key', function(keyCode, e) {
                if (keyCode == Control.key.RETURN) {
                    scope.onReturn();
                }
            });

            this.bindFocus();
        },

        bindFocus: function() {
            var scope = this;
            this.$el.find(this.selector.navlink).on('focusin', function(){
                scope.$nav.removeClass(activeClass);
                $(this).addClass(activeClass);
            });
        },

        /**
         * @inheritdoc Snippet#create
         */
        create: function() {
            return $('#Menu');
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
            var activeNav = this.$nav.find(activeClass);
            activeNav = (activeNav.length > 0) ? activeNav : this.$nav.eq(0);
            Focus.to(activeNav);
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
                Focus.to(this.getFocusable(-1, true));
            } else if (direction == 'down') {
                Focus.to(this.getFocusable(1, true));
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
            if ($el.hasClass('link-liveTV')) {
                redirect(Url.listLiveTV());
            }
            if ($el.hasClass('link-movies')) {
                redirect(Url.listMovies());
            }
            if ($el.hasClass('link-apps')) {
                redirect(Url.apps());
            }
            if ($el.hasClass('link-settings')) {
                redirect(Url.settings());
            }
        },
        onReturn: function($el, e) {
            this.hide();
            return false;
        },
        onShow: function() {
            this.$previousFocused = Focus.focused;
            var activeNav = this.$el.find(this.selector.navlink + '.' + activeClass);
            activeNav = (activeNav.length > 0) ? activeNav : this.$nav.eq(0);
            Focus.to(activeNav);
            Router.activeScene.isVisible = false;
        },
        onHide: function() {
            Focus.to(this.$previousFocused);
            Router.activeScene.isVisible = true;
        },
        setContent: function(content) {
            this.$content.html(content);
            return this;
        },
        hide: function() {
            this.isVisible = false;
            this.$el.fadeOut();
            this.trigger('hide');
        },
        show: function() {
            this.isVisible = true;
            this.$el.fadeIn();
            this.trigger('show');
        },
    });

    return Snippet_Menu;

})(Snippet);
