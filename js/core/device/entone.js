/**
 * Entone set top box device, overrides Device. Holds initialisation and all basic stuff about this device.
 *
 * @author trungtran07@gmail.com
 * @class Device_Entone
 * @extends Device
 */

Device_Entone = (function(Events) {
    var Device_Entone = {};

    $.extend(true, Device_Entone, Events, {
        /**
         * @inheritdoc Device#init
         */
        init: function(callback, scope) {
            var self = this, onShow, onShowCalled = false, onLoad;

            // override default modules
            this.override();

            onShow = function() {
                if (onShowCalled) {
                    return;
                }

                onShowCalled = true;

                self.setKeys();

                if (callback) {
                    callback.call(scope || self);
                }
            };

            onLoad = function() {

                // this event should be called right after everything is ready and window is shown
                window.onShow = onShow;

                // window.onShow method doesn't work in emulator
                setTimeout(function() {
                    onShow();
                }, 2000);
            };

            // checks if API libraries are loaded and ready, if not, its called again later
            onLoad();
        },

        /**
         * @inheritdoc Device#exit
         */
        exit: function() {
            window.close();
        },

        /**
         * @inheritdoc Device#getFirmware
         */
        getFirmware: function() {
            return ENTONE.stb.getBoardVersion();
        },

        /**
         * @inheritdoc Device#getUID
         */
        getUID: function() {
            return null;
        },

        /**
         * @inheritdoc Device#getIP
         */
        getIP: function() {
            return ENTONE.stb.getIPAddress();
        },

        /**
         * @inheritdoc Device#getDeviceName
         */
        getDeviceName: function() {
            return ENTONE.stb.getHardwareModel();
        },

        /**
         * @inheritdoc Device#getCountry
         */
        getCountry: function() {
            return null;
        },

        /**
         * @inheritdoc Device#getLanguage
         */
        getLanguage: function() {
            return navigator.language;
        },

        /**
         * @inheritdoc Device#getDate
         */
        getDate: function() {
            var date;

            try {
                date = this.TIME.getEpochTime() * 1000;

            } catch (e) {
                date = new Date().getTime();
            }

            return new Date(date);
        },

        /**
         * @inheritdoc Device#getTimeZoneOffset
         */
        getTimeZoneOffset: function() {
            return null;
        },

        /**
         * @inheritdoc Device#checkNetworkConnection
         */
        checkNetworkConnection: function(callback, scope) {
            return null;
        },

        /**
         * Initialize key codes
         *
         * @private
         */
        setKeys: function() {

            Control.setKeys({
                LEFT: ENTONE.input.KEY_LEFT,
                RIGHT: ENTONE.input.KEY_RIGHT,
                UP: ENTONE.input.KEY_UP,
                DOWN: ENTONE.input.KEY_DOWN,
                ENTER: ENTONE.input.KEY_ENTER,
                RETURN: ENTONE.input.KEY_BACK,
                ZERO: ENTONE.input.KEY_0,
                ONE: ENTONE.input.KEY_1,
                TWO: ENTONE.input.KEY_2,
                THREE: ENTONE.input.KEY_3,
                FOUR: ENTONE.input.KEY_4,
                FIVE: ENTONE.input.KEY_5,
                SIX: ENTONE.input.KEY_6,
                SEVEN: ENTONE.input.KEY_7,
                EIGHT: ENTONE.input.KEY_8,
                NINE: ENTONE.input.KEY_9,
                RED: ENTONE.input.KEY_RED,
                GREEN: ENTONE.input.KEY_GREEN,
                YELLOW: ENTONE.input.KEY_YELLOW,
                BLUE: ENTONE.input.KEY_BLUE,
                PLAY: ENTONE.input.KEY_PLAY,
                PAUSE: ENTONE.input.KEY_PAUSE,
                STOP: ENTONE.input.KEY_STOP,
                REC: ENTONE.input.KEY_RECORD,
                FF: ENTONE.input.KEY_FASTFORWARD,
                RW: ENTONE.input.KEY_REWIND,
                TOOLS: -1,
                PUP: -ENTONE.input.KEY_CHANNELUP,
                PDOWN: ENTONE.input.KEY_CHANNELDOWN,
                CHLIST: -1,
                PRECH: ENTONE.input.KEY_PREVIOUSCHAPTER,
                TXTMIX: -1,
                FAVCH: ENTONE.input.KEY_FAVORITES,
                EXIT: ENTONE.input.KEY_EXIT,
                INFO: ENTONE.input.KEY_INFO
            });
        },

        /**
         * Override default modules
         *
         * @private
         */
        override: function() {

            //if (typeof Device_Entone_Storage !== 'undefined' && Storage) {
            //    Storage = $.extend(true, Storage, Device_Entone_Storage);
            //}
            //
            //
            //if (typeof Device_Entone_Player !== 'undefined' && Player) {
            //    Player = $.extend(true, Player, Device_Entone_Player);
            //}
            /*
             // rewrite input
             if (typeof Device_Entone_Input !== 'undefined' && Input) {
             Input = Device_Entone_Input;
             }

             // rewrite keyboard
             if (typeof Device_Entone_Keyboard !== 'undefined' && Keyboard) {
             Keyboard = new Device_Entone_Keyboard;
             }
             */
        },

        /**
         * Load specific JS library or file
         *
         * @private
         * @param {String} src
         */
        loadJS: function(src) {
            document.head.appendChild(s);
            s.src = src;
        },

        /**
         * Load specific OBJECT
         *
         * @private
         * @param {String} id
         * @param {String} clsid
         */
        loadObject: function(id, clsid) {
            var objs = document.getElementsByTagName('object');

            if (objs) {
                for (var i in objs) {
                    if (objs[i] && objs[i].id === id) {
                        return objs[i];
                    }
                }
            }

            var obj = document.createElement('object');
            obj.id = id;
            obj.setAttribute('classid', clsid);

            document.body.appendChild(obj);

            return obj;
        },
    });

    if (typeof document.head === 'undefined') {
        document.head = document.getElementsByTagName('head')[0];
    }

    if (typeof document.body === 'undefined') {
        document.body = document.getElementsByTagName('body')[0];
    }

    return Device_Entone;

})(Events);