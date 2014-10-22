(function($,undefined){
	/**
	*
	*	MUI Components
	*	@author Tim Wu
	*	
	*/
	$.mui = $.mui || {}; /* global object */
	if (!$.mui) return;
	/* =====================================
	*
	*	UI components start
	*	@Name: Slider
	*	@Usage: Auto-initialize DOM into slider
	*
	* ====================================== */
	$.extend($.mui,{
		/* Slider Default Settings */
		slider: {
			inits: 0, 					/* primary ID */
			items: 1, 					/* how many items in a group */
			moveby: 1, 					/* how many groups in a move */
			speed: 500,					/* sliding speed */
			width: 1200,				/* default slider width */
			height: 300,				/* default slider height */
			item_margin: 0,  			/* distance between each group */
			duration: 3000, 			/* sliding duration/gap */
			direction: 'h', 			/* [h, v] */
			nav: 'dots', 				/* [thumb, dots, false] */
			navcontrol: true, 			/* show/hide back, forward button */
			theme : 'a', 				/* default theme */
			navcontrolimage: { 			/* back, forward image */
				back : '',
				forward: ''
			},
			fullwidth: false,
			navposleft : 0,
			navposRange : 0,
			lang: {
				forward: '下一张',
				back: '上一张'
			}
		}
	});
	/*
	*
	*	initialization function
	*
	*/
	$.fn.mui_slider = function(params){
		var obj = params.obj || this;
		if (obj == undefined) return; /* 无效参数 */
		/* initialization */
		$(obj).find('[slider]').each(function(i,dom){
			var $slider = $(dom) || undefined;
			if ($slider == undefined) return;/* 无效 */
			if (!$slider.attr('slider-inited')) {
				/* 此slider未初始化 */
				$slider.attr({
					'slider-inited':true,
					'slider-index':$.mui.slider.inits
				}).unbind().mui_slider_create();   /* 开始初始化 */
				/* add up index */
				$.mui.slider.inits++;
			}
		});
		/* execute callbacks */
		if ($.type(params.callback == 'function')) {
			try {
				params.callback();
			}catch(e) {
				console.log(e);
			}
		}
		return obj;
	}
	/* child DOM function */
	$.fn.mui_slider_create = function(){
		var o = {
			obj : $(this)
		};
		if (o.obj.length == 0) return; /* 无效参数 */
		/* override/init default settings */
		o.theme = o.obj.attr('slider') || $.mui.slider.theme; 
		o.width = parseInt(o.obj.attr('slider-width')) || $.mui.slider.width;
		o.height = parseInt(o.obj.attr('slider-height')) || $.mui.slider.height;
		o.items = parseInt(o.obj.attr('slider-items')) || $.mui.slider.items;
		o.moveby = parseInt(o.obj.attr('slider-moveby')) || $.mui.slider.moveby;
		o.direction = o.obj.attr('slider-direction') || $.mui.slider.direction;
		o.item_margin = parseInt(o.obj.attr('slider-item-margin')) || $.mui.slider.item_margin;
		o.speed = parseInt(o.obj.attr('slider-speed')) || $.mui.slider.speed;
		o.duration = parseInt(o.obj.attr('slider-duration')) || $.mui.slider.duration;
		o.nav = o.obj.attr('slider-nav') || $.mui.slider.nav;
		o.navcontrol = o.obj.attr('slider-navcontrol') || $.mui.slider.navcontrol;
		o.fullwidth = o.obj.attr('slider-fullwidth') || $.mui.slider.fullwidth;
		o.navcontrolimage = $.mui.slider.navcontrolimage;
		if (o.obj.attr('slider-navcontrolimage')) {
			eval("o.navcontrolimage = " + o.obj.attr('slider-navcontrolimage'));
		}
		o.navposleft =  parseInt(o.obj.attr('slider-navposleft')) || $.mui.slider.navposleft;
		o.navposRange = parseInt(o.obj.attr('slider-navposRange')) || $.mui.slider.navposRange;
		o.lang = $.mui.slider.lang;
		if (o.obj.attr('slider-lang')) {
			eval("o.lang = " + o.obj.attr('slider-lang'));
		}
		o.intervalEvent = undefined;
		o.clickEvent = undefined;
		o.intervalCallback = undefined;
		o.clickCallback = undefined;
		o.timeoutEvent = undefined;
		/* finish settings */

		/* DOM & CSS start */
		/* 最外层 wrapper */
		o.group_width = o.width;
		o.item_width = o.group_width / o.items;
		o.total_items = o.obj.children('div').length;
		o.total_groups = o.total_items / o.items;

		o.obj.addClass('mui-slider-content').css({
			'width' : o.total_groups * o.group_width + 'px'
		});
		o.obj.wrap('<div class="mui-slider-wrapper '+o.theme+ ' ' + o.direction +'">');

		o.outer = o.obj.parent('.mui-slider-wrapper');
		o.outer.css({
			'height' : o.height + 'px',
			'width' : o.width + 'px'
		});
		/* 分组 */
		if (o.total_items%o.items != 0) {
			console.log('can not cut into groups , add more items');
			return;
		} /* can not cut into groups , add more items */

		o.obj.children('div').each(function(i,item){
			/* tag */
			$(item).attr('slider-item-index',i).addClass('mui-slider-item').css({
				'width' : o.item_width,
				'height' : o.height
			});
		});
		/* grouping */
		var cur = 0;
		for (var i = 0; i < o.total_groups; i++) {
			o.obj.find('.mui-slider-item').slice(cur, cur+o.items).wrapAll('<div class="mui-slider-group" group-index="'+i+'"></div>');
			cur += o.items;
		};
		/* captions */
		o.obj.find('.mui-slider-item').find('[caption]').addClass('mui-slider-caption');
		o.obj.find('.mui-slider-item').each(function(i,dom){
			var image = $(dom).children('a').attr('src');
			$(dom).children('a').addClass('mui-slider-item-image').css({
				'background' : 'url('+ image +') top center no-repeat',
				'height' : o.height + 'px',
				'width' : o.item_width + 'px'
			});
		});
		/* navcontrol */
		if (o.navcontrol) {
			/* defaults */
			o.navposleft =  parseInt(o.obj.attr('slider-navposleft')) || $.mui.slider.navposleft;
			o.navposRange = parseInt(o.obj.attr('slider-navposRange')) || o.group_width;
			o.outer.append('<div class="mui-slider-navcontrol-back" to-group="'+(o.total_groups-1)+'"></div>').append('<div class="mui-slider-navcontrol-forward" to-group="1"></div>');
			/* pos */
			o.outer.find('.mui-slider-navcontrol-back').css({
				left: o.navposleft + 'px',
				top: ((o.height/2) - (o.outer.find('.mui-slider-navcontrol-back').outerHeight(true)/2)) + 'px'
			});
			o.outer.find('.mui-slider-navcontrol-forward').css({
				left: (o.navposleft + o.navposRange - o.outer.find('.mui-slider-navcontrol-forward').outerWidth(true)) + 'px',
				top: ((o.height/2) - (o.outer.find('.mui-slider-navcontrol-forward').outerHeight(true)/2)) + 'px'
			});
		}
		/* nav */
		if (o.nav) {
			if (o.nav == 'thumb') {
			}
			if (o.nav == 'dots') {
				var dotsDom = '<div class="mui-slider-dots-wrapper">';
				for (var i = 0; i < o.total_groups; i++) {
					dotsDom += '<div class="mui-slider-dots-item" to-group="'+i+'"></div>';
				}
				dotsDom += '</div>';
				o.outer.append(dotsDom);
				/* pos */
				o.outer.find('.mui-slider-dots-wrapper').css({
					bottom: '10px',
					left: ((o.navposleft+(o.navposRange/2)) - (o.outer.find('.mui-slider-dots-wrapper').outerWidth(true)/2)) + 'px'
				});
			}			
		}
		if (o.fullwidth) {
			o.outer.css({
				'overflow' : 'visible'
			});
		}
		/* DOM & CSS end */
		/* bind events */
		o.obj.mui_slider_events(o);
		return o.obj;
	}
	/* child EVETNS & CALLBACKS function */
	$.fn.mui_slider_events = function(o){
		o.obj.data({
			slideInterval : function(fn){
				if (o.intervalEvent == undefined) {
					var currentSlide = 0;						
					var slideMax = o.total_groups - 1;
					var slideMin = 0;
					o.intervalEvent = setInterval(function(){
						/* sliding */
						var slideBaseRange = o.group_width;
						o.obj.animate({
							left : '-' + currentSlide*slideBaseRange + 'px'
						},o.speed);
						/* update index */
						o.obj.data('updateStatus')(currentSlide);
						if ( (currentSlide+1) == o.total_groups) {
							/* last */
							currentSlide = 0;
						} else {
							currentSlide += 1;					
						}
					},o.duration);
					/* callbacks */
					try{fn(o);}catch(e){console.log(e);}
				}
			},
			slide: function(trigger_obj,fn){
				clearInterval(o.intervalEvent);
				o.intervalEvent = undefined; 
				clearTimeout(o.timeoutEvent);
				o.timeoutEvent = undefined;
				var to_group = parseInt(trigger_obj.attr('to-group'));
				/* slide it */
				var slideBaseRange = o.group_width;
				o.obj.animate({
					left : '-' + to_group*slideBaseRange + 'px'
				},o.speed);
				/* update index if it is nav control */
				o.obj.data('updateStatus')(to_group);
				/* re-init interval event */
				o.timeoutEvent = setTimeout(function(){
					o.obj.data('slideInterval')(function(){console.log('im in timeout');})
				}
					,5000);
				/* callbacks */
				try{fn(o);}catch(e){console.log(e);}
			},
			updateStatus : function(to_group){
				/* attr */
				var backTrigger = o.outer.find('.mui-slider-navcontrol-back');
				var forwardTrigger = o.outer.find('.mui-slider-navcontrol-forward');
				var newBack = to_group - 1;
				var newForward = to_group + 1;
				if (newBack < 0) {
					newBack = o.total_groups - 1;
				}
				if (newForward == o.total_groups) {
					newForward = 0;
				}
				backTrigger.attr('to-group',newBack);
				forwardTrigger.attr('to-group',newForward);
				/* lookings */
				o.outer.find('.mui-slider-dots-item').css({
					'backgroundColor' : '#000'
				}).each(function(i,dot){
					if ($(dot).attr('to-group') == to_group) {
						$(dot).css({
							'backgroundColor' : '#0082f0'
						});
					}
				});
			}
		});
		o.obj.data('slideInterval')(function(){console.log('im callback interval');});
		/* user click */
		var slideTrigger = o.outer.find('[to-group]');		
		slideTrigger.click(function(e){
			o.obj.data('slide')($(this),function(){console.log('im callback click slide');});
		});



		return o.obj;
	}
	/*
	*
	*	MUI execution
	*
	*/
	$(document).ready(function() {
		/* slider */
		if ($.type($(this).mui_slider) == 'function') {
			try{$(this).mui_slider({
				callback: function(){
					console.log('im done after everything');
				}
			});}catch(e){console.log(e);}
		}
	});






})(jQuery)