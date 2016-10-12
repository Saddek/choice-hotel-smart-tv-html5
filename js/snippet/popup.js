Snippet_Popup = (function(Snippet) {

    var Snippet_Popup = function() {
        this.construct.apply(this, arguments);
    };

    $.extend(true, Snippet_Popup.prototype, Snippet.prototype, {
        /**
         * @inheritdoc Snippet#init
         */
        init: function() {
            var scope = this;
            this.name = 'snippet-popup';
            this.$wrapper = this.$el.find('.popup');
            this.$closeBtn = this.$el.find('#popupClose');
            this.$content = this.$el.find('#popupContent');
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
        },

        /**
         * @inheritdoc Snippet#create
         */
        create: function() {
            return $('#popupInfo');
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
            Focus.to(this.$closeBtn, this.$el);
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
            if ($el.prop('id') == 'popupClose' || $el.hasClass('confirm')) {
                this.hide();
                return false;
            }
        },
        onReturn: function($el, e) {
            this.hide();
            return false;
        },
        onShow: function() {
            this.$previousFocused = Focus.focused;
            Focus.to(this.$closeBtn);
            c(this.$closeBtn);
            if (Router.activeScene) {
                Router.activeScene.isVisible = false;
            }
        },
        onHide: function() {
            Focus.to(this.$previousFocused);
            if (Router.activeScene) {
                Router.activeScene.isVisible = true;
            }
            this.$wrapper.prop('class', 'popup');
        },
        setContent: function(content) {
            this.$content.html(content);
            return this;
        },
        show: function(notification) {
            if (notification) {
                this.$wrapper.prop('class', 'popup message');
                var messageTemplate = Template.render('tplPopupMessage', notification);
                this.setContent(messageTemplate);
            }
            this.isVisible = true;
            this.$el.show();
            this.trigger('show');
        },
        info: function(notification) {
            this.$wrapper.addClass('popupInfo');
            this.show(notification);
        },
        showMessage: function(title, message, showCancel) {
            var notification = {
                header: title,
                message: message,
                showCancel: showCancel
            };
            this.show(notification);
        }
    });

    return Snippet_Popup;

})(Snippet);
