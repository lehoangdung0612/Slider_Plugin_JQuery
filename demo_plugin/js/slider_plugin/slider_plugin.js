(function($) {
	function injectCSS(rule) {
		var div = $('head style');
		if (div.length == 0)
			$('head').append("<style>" + rule + "</style>");
		else
			$('head').append(div.append(rule));
	}

	injectCSS("#slider div.pager-wrapper div.pager-number { background-position: -5px -4px !important; }");
	injectCSS("#slider div.pager-wrapper div.pager-number.page-hover { background-position: -35px -4px !important; }");
	injectCSS("#slider div.pager-wrapper div.pager-number.page-active { background-position: -65px -4px !important; }");
	injectCSS("#slider div.pager-wrapper div.pager-number.page-down { background-position: -95px -4px !important; }");
	injectCSS("#slider div.navigation #next, #slider div.navigation #previous { background-position: -3px -33px !important; }");
	injectCSS("#slider div.navigation #next.hover, #slider div.navigation #previous.hover { background-position: -123px -33px !important; }");
	injectCSS("#slider div.navigation #next.down, #slider div.navigation #previous.down { background-position: -243px -33px !important; }");

	var scriptEls = document.getElementsByTagName( 'script' );
    var thisScriptEl = scriptEls[scriptEls.length - 1];
    var scriptPath = thisScriptEl.src;
    var scriptFolder = scriptPath.substr(0, scriptPath.lastIndexOf( '/' )+1 );

	$.fn.extend({
		slider: function(options) {
			var defaults = {
				timeTrans: 1000,
				interval: 5000,
				transition: 'fade',
				width: 970,
                height: 190,
			};

			return this.each(function(){
				//merge two options
				var _opts = $.extend(defaults, options);
				//declare private variables
				var _obj = $(this);
				var _ul = $(this).find('ul');
				var _pagers;

				_obj.append($("<div class='images-slider-wrapper'></div>").append(_ul));

				//get li children
				//set default index = 0
				var _slides = _ul.children();
				var _amount = _slides.length;
				var _iPicture = 0;
				var _trans = _opts.transition.toLowerCase();
				var _slideWidth = _opts.width;

				initStyle();
				addControl();
				addPaging();

				//run slider
				resetInterval();

				function initStyle() {
					_obj.css({
						'width': _opts.width,
						'height': _opts.height,
					    'overflow': 'hidden',
					    'position': 'relative',
					    'display': 'block',
					    'margin': 'auto',
					    'padding': 0,
					    '-webkit-user-select': 'none',
						'-moz-user-select': 'none',    
						'-ms-user-select': 'none',     
						'-o-user-select': 'none',
						'user-select': 'none', 
						'cursor': 'move',
					}); 

					_ul.css ({
						'list-style': 'none outside none',
					    'padding': 0,
					    'margin': 0,
					}); 

					_slides.css({
						'position': 'absolute',
					    'top': 0,
					    'left': 0,
					    'display': 'none',
					});

					_slides.first().css({
						'display': 'block',
					});
				}

				//add next button, previous button
				function addControl() {
					var navigation = $("<div class='navigation'></div>");
					next = $("<span id='next'></span>");
					previous = $("<span id='previous'></span>");
					navigation.append(next, previous);
					_obj.append(navigation);

                    navigation.css({
					    //'position': 'absolute',
                    });

                    navigation.find('span').css({
                    	'width': '55px',
                    	'height': '55px',
                    	'position': 'absolute',
                    	'top': _opts.height/2 - 55/2,
                    	'background': 'url(' + scriptFolder + '/imgs/a20.png) no-repeat',
                    	'display': 'none',
					    'cursor': 'pointer',
                    })
                    .mouseenter(function(){
                    	$(this).addClass('hover');
                    })
                    .mouseleave(function(){
                    	$(this).removeClass('hover');
                    	$(this).removeClass('down');
                    })
                    .mousedown(function(){
                    	$(this).addClass('down');
                    })
                    .mouseup(function(){
                    	$(this).removeClass('down');
                    });

					previous.css({
					    'left': 10,
                    });

                    next.css({
					    'right': 10,
                    	'transform': 'rotate(180deg)',
                    });

					_obj.hover(function() {
                        $(previous).show();
                        $(next).show();
                    }, function() {
                        $(previous).hide();
                        $(next).hide();
                    });

					next.click(function() {
						run(1);
						resetInterval();
					});
					previous.click(function () {
						run(-1);
						resetInterval();
					});					
				}

				//add page numbers
				function addPaging() {
				    var paging = $("<div class='pager-wrapper'></div>");
					for (var i = 0; i < _slides.length; i++)
					{
						paging.append("<div class='pager-number'><span>" + (i+1) + "</span></div>");
					}
					
					_obj.append(paging);
					_pagers = paging.children();

					paging.css({
					    'display': 'block',
                        'position': 'relative',
                        'margin': 'auto',
                        'text-align': 'center',
						'top': (_opts.height - 36),
					});

					_pagers.css({
					    'display': 'inline-block',
					    'position': 'relative',
					    'margin': '3px',
                        'width': '21px',
                        'height': '21px',
                        'line-height': '21px',
                        'text-align': 'center',
						'font-size': '13px',
						'font-weight': 'bold',
                        'color': 'white',
                        'background': 'url(' + scriptFolder + '/imgs/b03.png) no-repeat',
                        'cursor': 'pointer',
                        'overflow': 'hidden',
					});

					$(_pagers.first()).addClass('page-active');

					//process event click page number
					function mouseEnter() {
                        $(this).addClass('page-hover');
                    }

                    function mouseLeave() {
                    	if ($(this).index() == _iPicture) 
                        	$(this).addClass('page-active');
                        else 
                        	$(this).removeClass('page-hover');
                    }

					_pagers.hover(mouseEnter, mouseLeave).click(function() {
						var val = $(this).index();
						run(val - _iPicture);
						resetInterval();
					});

					_pagers.mousedown(function() {
                        $(this).addClass('page-down');
					});

					_pagers.mouseup(function() {
                        $(this).removeClass('page-down');
					});

				}

				//seed > 0 then right to left
				//seed < 0 the left to right
				function run(seed) {
					if (_iPicture >= _amount)
						_iPicture = 0;
					if (_iPicture < 0)
						_iPicture = _amount - 1;

					var nextIndex = (_iPicture + seed + _amount) % _amount;
					executeTransition(nextIndex, seed >= 1);
				}

				//prevent multi animations occur the same time
				var _completeAnimation = true;
				//index: index picture
				//rightToLeft: true to show direction right -> left
				function executeTransition(index, rightToLeft) {
					//if the index slide needed to trans = current index then return;
					if (_iPicture == index)
						return;

					switch(_trans) {
						case 'fade':
							$(_slides[_iPicture]).fadeOut(_opts.timeTrans);
							$(_slides[index]).fadeIn(_opts.timeTrans);
							break;
						default:
							if (!_completeAnimation)
								return;
							_completeAnimation = false;
							if (rightToLeft) {
									$(_slides[index]).css('left', _slideWidth);
									$(_slides[_iPicture]).animate({'left': -_slideWidth}, _opts.timeTrans);
									$(_slides[index]).animate({'left': 0}, _opts.timeTrans, function() { 
										_completeAnimation = true;
									}).show();
							}
							else {
									$(_slides[index]).css('left', -_slideWidth);
									$(_slides[_iPicture]).animate({'left': _slideWidth}, _opts.timeTrans);
									$(_slides[index]).animate({'left': 0}, _opts.timeTrans, function() { 
										_completeAnimation = true;
									}).show();
							}
					}

					//set active page-number
					$(_pagers[_iPicture]).removeClass('page-active');
					$(_pagers[index]).addClass('page-active');

					//set new current index
					_iPicture = index;
				}

				var _intervalID;
				function resetInterval() {
				  	if (_intervalID)	{ 
				  		clearInterval(_intervalID); 
				  	};
				  	_intervalID = setInterval(function() { run(1); }, _opts.interval);
				}
			});

		},
	});

})(jQuery);