(function($) {

function winInfo(){
	var win = $(window);
	return {
		width:win.width(),
		height:win.height()
	};
}

function pluckRandom(array){
	var rand = Math.floor(Math.random() * array.length);
	return array[rand];
}

var	directions = ['up','down','left','right']
  , props = ['position','top','left'];

$.effects.fly = function(o) {

	return this.queue(function() {
		var pos, target, offset
		  , el = $(this)
		  , win = winInfo();

		var mode = $.effects.setMode(el, o.options.mode || 'hide'); // Set Mode
		if (mode == 'show'){
			el.css('opacity',0);
		}

		target = el.show().position();
		target.width = el.width();
		target.height = el.height();

		offset = el.offset();

		$.effects.save(el, props);

		if (!o.options.direction || o.options.direction == 'random'){
			o.options.direction = pluckRandom(directions);
		}

		var point;
		switch(o.options.direction){
			case 'up':
				point = {
					top:(mode == 'show')
					? target.top + target.height + (win.height - offset.top)
					: -1 * offset.top - target.height
				};
				break;
			case 'down':
				pos = 'top';
				point = {
					top:(mode == 'show')
					? -1 * offset.top - target.height
					: target.top + target.height + (win.height - offset.top)
				};
				break;
			case 'left':
				point = {
					left:(mode == 'show')
					? target.left + target.width + (win.width - offset.left)
					: -1 * offset.left - target.width
				};
				break;
			case 'right':
				point = {
					left:(mode == 'show')
					? -1 * offset.left - target.width
					: target.left + target.width + (win.width - offset.left)
				};
				break;
			case 'angle':
			case 'forward':
			case 'backward':
				if (!o.options.angle){
					o.options.angle = Math.floor(Math.random() * 360);
				}
				if (!o.options.radius){
					// radius of center of screen to edge of screen
					o.options.radius = Math.sqrt( Math.pow(win.height,2) + Math.pow(win.width,2) ) / 2;
				}
				x = (o.options.radius * Math.cos(o.options.angle * Math.PI / 180.0)) + target.left;
				y = (o.options.radius * Math.sin(o.options.angle * Math.PI / 180.0)) + target.top;

				point = {
					top:y,
					left:x
				};

				if ((o.options.direction == 'forward' || o.options.direction == 'backward') && mode == 'hide'){
					var percent;
					if (o.options.direction == 'forward'){
						percent = parseInt(o.options.percent, 10) || 150;
					} else {
						percent = parseInt(o.options.percent, 10) || 99;
					}
					var ratio = percent / 100;
					var font = el.css('font-size');
					var match = /(px|em|pt|%)$/.exec(font);
					var unit = (match.length == 2) ? match[0] : 'px';
					font = parseInt(font, 10);
					var newFont;
					if (o.options.direction == 'forward'){
						newFont = font + (font * ratio);
					} else {
						newFont = font - (font * ratio);
					}
					$.extend(point, {
						fontSize: newFont + unit,
						opacity:0,
						color:'red'
					});
				}
				break;
		}

		$('body').css('overflow','hidden');

		var animation;
		if (mode == 'show'){
			animation = target;
			el.css(point).css('opacity',1).show();
		} else {
			animation = point;
		}

		el.animate(animation, { queue: false, duration: o.duration, easing: o.options.easing, complete: function() {
			if(mode == 'hide') {
				el.hide();
			}
			$('body').css('overflow','visible');
			$.effects.restore(el, props);
			if(o.callback) {
				o.callback.apply(el[0], arguments); // Callback
			}
			el.dequeue();
		}});
	});
};

})(jQuery);
