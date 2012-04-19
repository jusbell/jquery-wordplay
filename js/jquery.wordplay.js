/*
 * jQuery Wordplay Plugin
 * https://github.com/jusbell/jquery-wordplay
 *
 * Copyright 2012, Justin Brydebell
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
(function($) {

	// Some static vars and default values
	$.wordplay = {
		defaults : {
			wrapWord:'span',
			wrapChar:'span',
			wrapPhrase:false,
			wrapCustom:false,

			splitChar:'',
			splitWord:' ',
			splitPhrase:'. ',
			splitCustom:false,

			cssWord:'word',
			cssChar:'char',
			cssPhrase:'phrase',
			cssCustom:'custom',
			cssSplitter:'split',

			omitWhitespace:false,
			omitSplitter:false,
			text:false,
			autoshow:true
		}
	};

	var priority = ['Custom','Phrase','Word','Char'];
	var instances = [];

	function WordPlay(el, conf) {
		var self = this;
		fire = el.add(self),
		self.$el = $(el);
		self.el = el;


		// Plugin API methods
		$.extend(self, {

			split:function(splitter, type, text){
				if (typeof(text) === "string"){
					return {type:type, nodes:text.split(splitter)};
				} else {
					for (i=0; i < text.nodes.length; i++){
						text.nodes[i] = self.split( splitter, type, text.nodes[i] );
					}
					return text;
				}
			},

			wrap:function(text){
				if (typeof(text) === "string"){
					return text;
				} else{
					var html='',tag='',css='',splitTag='';
					for(var i=0; i<text.nodes.length; i++){
						tag = conf['wrap'+text.type] || 'span';
						css = conf['css'+text.type];
						css += ' ' + css + '-' + i;
						if (conf.omitSplitter || conf['split'+text.type] === ''){
							splitTag = '';
						} else{
							splitTag = '<span class="'+ conf.cssSplitter +' '+ conf['css'+text.type]+'-'+conf.cssSplitter +'">'+conf['split'+text.type]+'</span>';
						}
						html += '<'+ tag +' class="'+ css +'">' + self.wrap(text.nodes[i]) + '</'+tag+'>'+splitTag;
					}
					return html;
				}
			},

			absolutize:function(rebase){
				$.each(priority, function(i, type){
					var items = $('.'+conf['css'+type], self.$el).css('opacity', 0).show();
					items.each(function(){
						var item = $(this);
						item.css( item.position() );
					});
					items.css({
						position : 'absolute',
						opacity : 1
					});
				});
				return self;
			},

			getContainer:function(){
				return self.$el;
			},

			getConf:function(){
				return conf;
			},

			reset:function(){
				self.$el.html(self.reset);
			},

			getWords:function(){
				return $('.'+conf.cssWord, self.$el);
			},

			getChars:function(){
				return $('.'+conf.cssChar, self.$el);
			},

			getPhrases:function(){
				return $('.'+conf.cssPhrase, self.$el);
			},

			show:function(){
				if ($.isFunction(conf.onShow)){
					fire.trigger('onShow');
				}
			},

			hide:function(){
				if ($.isFunction(conf.onHide)){
					fire.trigger('onHide');
				}
			},

			addEffect:function(name, fn){
				$.wordplay.addEffect(name, fn);
			},

			removeEffect:function(name){
				$.wordplay.removeEffect(name);
			},

			getNextInstance:function(){
				var id = self.instanceId;
				if (id > 0 && id == instances.length - 1){
					return instances[0];
				} else if (id != instances.length - 1){
					return instances[id + 1];
				} else {
					return self;
				}
			},

			getPreviousInstance:function(){
				var id = self.instanceId;
				if (id === 0 && instances.length > 0){
					return instances[instances.length - 1];
				} else if (id < instances.length){
					return instances[id - 1];
				}
			}
		});

		// Plugin Callbacks
		$.each("onShow,onHide,onBeforeWrap,onWrap,onBeforeSplit,onSplit".split(","), function(i, name) {

			// configuration
			if ($.isFunction(conf[name])) {
				$(self).bind(name, conf[name]);
			}

			// API
			self[name] = function(fn) {
				if (fn) { $(self).bind(name, fn); }
				return self;
			};
		});


		self.text = conf.text ? conf.text : $.trim( self.$el.text() );
		self.reset = self.text;

		if (conf.omitWhitespace){
			var text = text.replace(/\s{1,}/g, '');
		}

		fire.trigger('onBeforeSplit', [self.text]);
		$.each( priority, function(i, o){
			if (conf['wrap'+o]){
				self.text = self.split( conf['split'+o], o, self.text );
			}
		});
		fire.trigger('onSplit', []);

		fire.trigger('onBeforeWrap', [self.text]);
		self.$el.html( self.wrap(self.text) );
		fire.trigger('onWrap', []);

		if (conf.autoshow){
			self.show();
		}
	}

	// jQuery plugin initialization
	$.fn.wordplay = function(conf) {

		// already constructed --> return API
		var el = this.data("wordplay");
		if (el) { return el; }

		if ($.isFunction(conf)) {
			conf = {onBeforeLoad: conf};
		} else if (typeof(conf) === "string"){
			var uc = conf.charAt(0).toUpperCase();
			obj = {wrapWord:false, wrapChar:false, wrapPhrase:false};
			obj['wrap'+uc+conf.slice(1)] = 'span';
			conf = obj;
		}

		conf = $.extend(true, {}, $.wordplay.defaults, conf);

		this.each(function() {
			_wordplay = new WordPlay($(this), conf);
			instances.push(_wordplay);
			_wordplay.instanceId = instances.length-1;
			$(this).data("wordplay", _wordplay);
		});

		return this;
	};

})(jQuery);
