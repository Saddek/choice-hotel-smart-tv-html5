var HorizontalScroller = function(scroller){
	this.scroller = scroller;
	this.container = scroller.parent();
	this.inited = false;
	var scope = this;
	var selector = {
		item : '.horizontal-item'
	};

	var init = function(scroller) {
		var scrollerPos = elementPos(scroller);
		if (scrollerPos.width <= 0) return false;
		scope.viewport = {
			top: scrollerPos.top,
			left: scrollerPos.left,
			right: scrollerPos.right,
			bottom: scrollerPos.bottom,
			width: scrollerPos.width,
			height: scrollerPos.height
		};
		var $items = scroller.find(selector.item);
		var realWidth = 0;
		$items.each(function(key, val){
            var $item = $(val);
			realWidth += $item.width() + pixelFromString($item.css("marginLeft")) + pixelFromString($item.css("marginRight"));
		});
		scope.realWidth = realWidth;
		scope.inited = true;
		scope.scroller.css('left', 0);
	};

	var relativeRect = function(el){
		var elRect = elementPos(el);
		return {
			left: elRect.left - scope.viewport.left,
			top: elRect.top - scope.viewport.top,
			right: elRect.right - scope.viewport.right,
			bottom: elRect.bottom - scope.viewport.bottom,
			width: elRect.width,
			height: elRect.height
		};
	};

	var pixelFromString = function(string) {
		return parseFloat(string.substring(0, string.length - 2));
	};

	var centerItem = function($el){
		if (!scope.inited) {
			init(scope.container);
		}
        var navClassName = selector.item.substring(1);
        if (scope.realWidth <= scope.viewport.width || !$el.hasClass(navClassName)) {
			return;
		}
		App.toggleInteraction(false);
		var currentLeft = pixelFromString(scope.scroller.css('left'));
		var animateLeft = 0;
		var elRelativeRect = relativeRect($el);
		var centerLeft = (scope.viewport.width - elRelativeRect.width) / 2;
		var moveLeft = Math.round(centerLeft - elRelativeRect.left) ;
		var newLeft = currentLeft + moveLeft;
		if (newLeft > 0) {
			// reach beginning of items
			animateLeft = 0;
		} else if (Math.abs(newLeft) > (scope.realWidth - scope.viewport.width)) {
			// reach end of items
			animateLeft = scope.viewport.width - scope.realWidth;
		} else {
			if (moveLeft > 0) {
				var direction = '+';
			} else {
				var direction = '-';
			}
			animateLeft = direction + '=' + Math.abs(moveLeft) + "px";
		}
		scope.scroller.animate({
			left : animateLeft
		}, 300);
		setTimeout(function(){
			App.toggleInteraction(true);
		}, 200);
	};

	init(this.container);
	return {
		selector: selector,
		center : centerItem
	}
};