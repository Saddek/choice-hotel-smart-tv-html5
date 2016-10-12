/*
 ********************************************************
 * Copyright (c) 2013 Mautilus s.r.o. (Czech Republic)
 * All rights reserved.
 *
 * You may obtain a copy of the License at LICENSE.txt
 ********************************************************
 */

/**
 * Template class, supported engines: Mustache, Nunjucks and Dust.js
 *
 * @author Mautilus s.r.o.
 * @class Template
 * @singleton
 * @mixins Events
 */

Template = (function(Events) {
	var Template = {
		/**
		 * @property {Object} config General config hash
		 */
		config: {
			/**
			 * @cfg {String} engine Template engine (handlebars,mustache|nunjucks|dust)
			 */
			engine: 'handlebars'
		}
	};

	$.extend(true, Template, Events, {
		init: function(config) {
			/**
			 * @property {Object} engine Engine instance (Handlebars,Mustache/Dust/Nunjucks/etc.)
			 */
			this.engine = null;

			/**
			 * @property {Boolean} async (read-only) Whether template engine is asynchronous
			 */
			this.async = false;

			// compiled templates
			this.compiled = {};

			this.configure(config);

			if(this.config.engine === 'handlebars'){
				if(typeof Handlebars === 'undefined'){
					throw new Error('Handlebars is not loaded');
				}

				this.engine = Handlebars;

			} else if(this.config.engine === 'mustache'){
				if(typeof Mustache === 'undefined'){
					throw new Error('Mustache is not loaded');
				}

				this.engine = Mustache;

			} else if(this.config.engine === 'nunjucks'){
				if (typeof nunjucks === 'undefined'){
					throw new Error('nunjucks.js is not loaded');
				}

				this.engine = nunjucks;

			} else if(this.config.engine === 'dust'){
				if(typeof dust === 'undefined'){
					throw new Error('dust.js is not loaded');
				}

				this.engine = dust;
			}

			// register helpers
			this.registerHelpers();
		},
		registerHelpers: function() {
			if (this.config.engine == 'handlebars') {
				this.engine.registerHelper('durationText', function(duration) {
					//duration in seconds
					return secondsToDuration(duration);
				});
				this.engine.registerHelper('lineSeparator', function(key, perLine) {
					if ((key + 1) % perLine == 0) {
						return new Handlebars.SafeString('<div class="clear"></div>');
					}
				});
				this.engine.registerHelper("math", function(lvalue, operator, rvalue, options) {
					lvalue = parseFloat(lvalue);
					rvalue = parseFloat(rvalue);

					return {
						"+": lvalue + rvalue,
						"-": lvalue - rvalue,
						"*": lvalue * rvalue,
						"/": lvalue / rvalue,
						"%": lvalue % rvalue
					}[operator];
				});
			}
		},
		/**
		 * Set class config hash
		 *
		 * @param {Object} config Hash of parameters
		 */
		configure: function(config) {
			this.config = $.extend(true, this.config || {}, config);
		},
		/**
		 * Render template
		 *
		 * @param {String} tplName Template name
		 * @param {Object} attrs
		 * @param {Function} callback Async. callback or {} options
		 * @returns {String}
		 */
		render: function(tplName, attrs, callback){
			if (this.config.engine == 'handlebars') {
				return this.get(tplName, callback)(attrs);
			}
			return this.get(tplName)(attrs, callback);
		},
		/**
		 * Get compiled template
		 *
		 * @param {String} tplName
		 * @returns {Function}
		 */
		get: function(tplName, options){
			if(typeof this.compiled[tplName] !== 'undefined'){
				return this.compiled[tplName];
			}

			return (this.compiled[tplName] = this.compile(tplName, options));
		},
		/**
		 * Set HTML template
		 *
		 * @param {String} tplName
		 * @param {String} html
		 */
		set: function(tplName, html){
			this.compiled[tplName] = this.engineCompile(tplName, html);
		},
		/**
		 * Compile template
		 *
		 * @param {String} tplName
		 * @param {Object} options | null
		 * @returns {Function}
		 */
		compile: function(tplName, options){
			var els, html;

			els = document.getElementsByTagName('script');

			for(var i in els){
				if(els.hasOwnProperty(i) && els[i] && els[i].type === 'text/html' && els[i].getAttribute('data-name') === tplName){
					html = els[i].innerHTML.replace(/^\s+|\s+$/g, '');
					break;
				}
			}

			return this.engineCompile(tplName, html || '', options);
		},
		/**
		 * @private
		 */
		engineCompile: function(tplName, html, options){
			if(this.config.engine === 'nunjucks'){
				return bind(function(attrs){
					return this.engine.renderString(html, attrs);
				}, this);

			} else if(this.config.engine === 'dust'){
				var c = this.engine.compile(html, tplName);

				return bind(function(attrs, callback){
					if(typeof callback !== 'function'){
						callback = function(){};
					}

					this.engine.loadSource(c);
					return this.engine.render(tplName, attrs, callback);
				}, this);
			}

			return this.engine.compile(html, options);
		}
	});

	// Initialize this class when Main is ready
	Main.ready(function(){
		Template.init(CONFIG.template);
	});

	return Template;

})(Events);