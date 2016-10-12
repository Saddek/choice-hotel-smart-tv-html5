/*
* extra super simple slider combine with animate.css
* FOR THIS PROJECT ONLY
* author : Tatsuya
*/
(function ($) {
	$.fn.ssss = function(options) {
		var settings = $.extend({
            interval: 7000
        }, options );

		var slides = this.find('.ssss-slide');
		slides.eq(0).show();
		slides.addClass('animated');
		var totalSlide = slides.length;
		var activeSlide = 0;
		setInterval(function(){
			slides.hide();
			if (activeSlide == totalSlide - 1) {
				activeSlide = 0;
			} else {
				activeSlide++;
			}
			slides.eq(activeSlide).show().addClass('fadeIn');
		}, settings.interval);
	};
}(jQuery));