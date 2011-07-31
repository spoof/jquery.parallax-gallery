/*!
 * jQuery Prallax Gallery v0.1
 *
 * Copyright 2011, Sergey Safonov
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * Based on http://tympanus.net/codrops/2011/01/03/parallax-slider/
 * 
 * Date: Wed Jul 27 13:44:48 2011 +0400
 */
 
(function($) {
	var $container, $sliderWrapper, $imagesContainer, $thumbs, $thumbsWrapper, $thumbsContainer, 
		loaded = 0, $backgrounds = [], speed = 0, easing, easingBg, total_images = 0, current = 0, 
		w_w = $(window).width(), touchOffset,
		
		calcHiddenSize = function($element, $container) {
			var copy = $element.clone().css({visibility: 'hidden', display: 'block'});
			$container.append(copy);
			var size = {
						width: copy.width(),
						height: copy.height(),
						outerwidth: copy.outerWidth(),
						outerheight: copy.outerHeight()
			};
			copy.remove();
			return size;
		},
		
		resizeImage = function($image) {
			var img    = new Image();
			img.src    = $image.attr("src");
			var img_width = img.width, img_height = img.height;
			var $imageBox = $image.parent(".image-box");
			var containerWidth = $imageBox.width(), containerHeight = $imageBox.height();
			
			var in_container_size = calcHiddenSize($image, $imageBox);
			var in_container_width = in_container_size.width, 
				in_container_height = in_container_size.height,
				outer_width = in_container_size.outerwidth,
				outer_height = in_container_size.outerheight;
			
			var border_w = (outer_width - in_container_width < 0) ? 0 : outer_width - in_container_width;
			var border_h = (outer_height - in_container_height < 0) ? 0 : outer_height - in_container_height;

			var ratio_x = containerWidth / img_width;
			var ratio_y = containerHeight / img_height;
			
			ratio = ratio_x < ratio_y ? ratio_x : ratio_y;
			var new_width = Math.floor(img_width * ratio);
			var new_height = Math.floor(img_height * ratio);
			$image.css({
					"margin-left": (containerWidth - new_width) / 2,
					"margin-top": (containerHeight - new_height) / 2
				}).attr({
					"width": new_width - border_w,
					"height": new_height - border_h
				});
		},
		
		highlight = function($thumb) {
			$thumbs.removeClass('selected');
			$thumb.addClass('selected');
		},
		
		slide = function(current) {
			var slide_to = parseInt(-w_w * current);
			$imagesContainer.stop().animate({
				left: slide_to + 'px'
			}, speed, easing);
			var i = 2;
			$backgrounds.each(function() {
				$(this).stop().animate({
					left	: slide_to/i + 'px'
				},speed, easingBg);
				i *= 2;
			});
		},
		touchSlide = function($image, offset) {
			if (touchOffset == undefined) {
				touchOffset = offset;
			}
			var directionOffset = touchOffset - offset;
			if (directionOffset) {
				var direction = next;
			} else {
				var direction = prev;
			}
			if (Math.abs(directionOffset) > 100) {
				touchOffset = undefined;
				direction();
			}
		},
		next = function() {
			++current;
			if(current >= total_images)
				current = 0;
			
			highlight($thumbs.eq(current));
			slide(current);
		},
		
		prev = function() {
			--current;
			if(current < 0)
				current = total_images - 1;
			
			highlight($thumbs.eq(current));
			slide(current);
			
		},
		cursorUpdate = function($image, event) {
			var imageWidth = parseFloat($image.css('width'),10);
			var x = event.pageX - $image.offset().left;
			if( x < (imageWidth/2))
				$image.addClass('cursor-left').removeClass('cursor-right');
			else
				$image.addClass('cursor-right').removeClass('cursor-left');
		},
		
		initGallery = function() {
			var $images = $imagesContainer.children();
			setWidths($images, total_images);
			$images.bind('mousemove',function(e) {
				var $this = $(this);
				cursorUpdate($this, e);
			}).bind('touchmove', function(e) {
				var $this = $(this);
				e.preventDefault();
				var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
				touchSlide($this, touch.pageX);
			}).bind('click', function(e) {
				var $this = $(this);
				cursorUpdate($this, e);
				if ($this.is('.cursor-left')) {
					prev();
				} else if ($this.is('.cursor-right')) {
					next();
				}
				cursorUpdate($this, e);
			});
			
			$thumbs.bind('click', function(e){
				e.preventDefault();
				var $thumb	= $(this);
				highlight($thumb);
				current = $thumbs.index($thumb);
				slide(current);
			});
			$(window).resize(function(){
				w_w = $(window).width();
				setWidths($images, total_images);
				slide(current);
			});
			highlight($thumbs.eq(current));
			$sliderWrapper.show();
			$container.show();
			navInit();
		},
		
		addImage = function($thumb) {
			var img = new Image();
			var $image = $(img);
			$image.load(function (){
				resizeImage($(this));
				++loaded;
				if (loaded == total_images) { // if all is loaded
					initGallery();
				}
			}).attr('src', ("img", $thumb).attr('href'));
			var $imageBox = $('<div class="image-box"></div>').append($image);
			$imagesContainer.append($('<div class="image-wrapper"></div>').append($imageBox));
		
		},
		
		setWidths = function($images, total_images) {
			var container_width = w_w * total_images;
			$sliderWrapper.width(container_width + 'px');
			$images.width(w_w + 'px');
			$backgrounds.each(function (i, bg) {
				bg.width(container_width + 'px');
			});
			
		},
		
		makeScrollable = function($wrapper, $cont, contPadding) {
			var divWidth = $wrapper.width();
			$wrapper.css({
				overflow: 'hidden'
			});
			var lastLi = $cont.find('li:last-child');
			$wrapper.scrollLeft(0);
			$wrapper.unbind('mousemove').bind('mousemove', function(e) {
				var ulWidth = lastLi[0].offsetLeft + lastLi.outerWidth() + contPadding;
				var left = (e.pageX - $wrapper.offset().left) * (ulWidth-divWidth) / divWidth;
				$wrapper.scrollLeft(left);
				
			});
		},
	
		navInit = function() {
			makeScrollable($thumbsWrapper,$thumbsContainer, 15);
		},
		clear = function() {
			$thumbs = [];
			loaded = 0;
			total_images = 0;
			current = 0;
			touchOffset = undefined;
		};
	
	$.fn.parallaxGallery = function(options) {
		clear();
		var opts = $.extend({}, $.fn.parallaxGallery.defaults, options);
		total_images = undefined;
		$thumbs = $(this);
		$container = $(opts.container);
		$thumbsWrapper = $("#gallery-thumbs-wrapper");
		$thumbsContainer = $("#gallery-thumbs-container");
		$sliderWrapper = $('<div id="gallery-slider-wrapper"></div>"');
		$imagesContainer = $('<div id="gallery-images-container"></div>"');
		$backgrounds = $();
		$(opts.backgrounds).each(function (i, value) {
			var $bg = $('<div class="gallery-bg"></div>').css({'background-image': 'url(' + value + ')'})
			$sliderWrapper.append($bg);
			$backgrounds.push($bg);
		});
		
		$sliderWrapper.append($imagesContainer);
		$container.append($sliderWrapper);
		speed = opts.speed;
		easing = opts.easing;
		easingBg = opts.easingBg;

		total_images = this.length;
		this.each(function() {
			var $thumb	= $(this);
			addImage($thumb);
		});
		return this;
	};
	
	$.fn.parallaxGallery.defaults = {
		container		: "#gallery-container",
		backgrounds 	: ['images/bg1.png', 'images/bg2.png'],
		speed			: 1000, //speed of each slide animation
		easing			: 'jswing', //easing effect for the slide animation
		easingBg		: 'jswing', //easing effect for the background animation
	};
})(jQuery);
