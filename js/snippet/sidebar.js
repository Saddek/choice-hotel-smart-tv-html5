Snippet_Sidebar = (function(Snippet) {

    var Snippet_Sidebar = function() {
        this.construct.apply(this, arguments);
    };

    $.extend(true, Snippet_Sidebar.prototype, Snippet.prototype, {
        /**
         * @inheritdoc Snippet#init
         */

        selector: {
            navlink: '.nav-link'
        },
        init: function() {
            var scope = this;
            this.name = 'snippet-Sidebar';
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
                scope.activeNav($(this));
            });
        },

        activeNav : function($nav) {
            this.$nav.removeClass(activeClass);
            $nav.addClass(activeClass);
        },

        /**
         * @inheritdoc Snippet#create
         */
        create: function() {
            return $('#sidebar');
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
            Focus.to(getNextFocus(this.$el));
        },

        /**
         * @inheritdoc Snippet#navigate
         * Handle navigation within the snippet
         */
        navigate: function(direction, stop) {
            stop();
            if (direction == 'left' || direction == 'right') {
                this.hide();
            } else if (direction == 'up') {
                Focus.to(this.getCircleFocusable(-1));
            } else if (direction == 'down') {
                Focus.to(this.getCircleFocusable(1));
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
            var targetScene = $el.data('target');
            if (targetScene) {
                Router.go(targetScene);
            } else {
                Router.go(true, Scenes.landing);
            }
            this.hide();
        },
        onReturn: function($el, e) {
            this.hide();
            return false;
        },
        onShow: function() {
            Router.activeScene.isVisible = false;
            this.$previousFocused = Focus.focused;
            Focus.to(getNextFocus(this.$el));
        },
        onHide: function() {
            Router.activeScene.isVisible = true;
            if (this.$previousFocused.length && this.$previousFocused.belongsTo(Router.activeScene.$el)) {
                Focus.to(this.$previousFocused);
            }
            this.$previousFocused = '';
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

    return Snippet_Sidebar;

})(Snippet);
