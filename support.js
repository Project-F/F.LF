define(function()
{
	var support = {};
	/*\
	 * support
	 * test for browser support of certain technologies, most code is adapted from other places.
	 * including
	 * - [Crafty/extensions.js](https://github.com/craftyjs/Crafty/blob/master/src/extensions.js)
	 * - [https://gist.github.com/3626934](https://gist.github.com/3626934)
	 * - [https://gist.github.com/1579671](https://gist.github.com/3626934)
	 * [example](../sample/support.html)
	 # <iframe src="../sample/support.html" width="800" height="200"></iframe>
	\*/
	/*\
	 * support.mobile
	 - (string) mobile device name
	 [ property ]
	\*/
	/*\
	 * support.prefix
	 - (string) browser prefix
	 [ property ]
	\*/
	/*\
	 * support.version
	 - (number) browser major version
	 [ property ]
	\*/
	/*\
	 * support.css2dtransform
	 - (string) if supported, style property name with correct prefix
	 [ property ]
	 * you can do something like
	 | if( support.css2dtransform)
	 |		element.style[support.css2dtransform]= 'translate('+P.x+'px,'+P.y+'px) ';
	\*/
	/*\
	 * support.css3dtransform
	 - (string) if supported, style property name with correct prefix
	 [ property ]
	\*/

	//test for browser and device
	//[--adapted from Crafty engine
	//	https://github.com/craftyjs/Crafty/blob/master/src/extensions.js
	(function(){		
		var N= navigator.appName, ua= navigator.userAgent, tem;
		var M= ua.match(/(opera|chrome|safari|firefox|msie)\/?\s*(\.?\d+(\.\d+)*)/i);
		if(M && (tem= ua.match(/version\/([\.\d]+)/i))!= null) M[2]= tem[1];
		M= M? [M[1], M[2]]: [N, navigator.appVersion,'-?'];
		support.browser = M;
		var ua = navigator.userAgent.toLowerCase();
		var match = /(webkit)[ \/]([\w.]+)/.exec(ua) ||
					/(o)pera(?:.*version)?[ \/]([\w.]+)/.exec(ua) ||
					/(ms)ie ([\w.]+)/.exec(ua) ||
					/(moz)illa(?:.*? rv:([\w.]+))?/.exec(ua) || [];
		var mobile = /iPad|iPod|iPhone|Android|webOS|IEMobile/i.exec(ua);
		support.mobile= mobile?mobile[0]:undefined;
		support.prefix = (match[1] || match[0]);

		if (support.prefix === "moz") support.prefix = "Moz";
		if (support.prefix === "o") support.prefix = "O";

		if (match[2]) {
			//support.versionName = match[2];
			support.version = +(match[2].split("."))[0];
		}
	}());
	//--] end

	//test for css 2d transform support
	//[--adapted from https://gist.github.com/3626934
	(function(){
		support.css2dtransform=undefined;
		support.css3dtransform=undefined;

		var el = document.createElement('p'), t, has3d,
		transforms = {
			'WebkitTransform':'-webkit-transform',
			'OTransform':'-o-transform',
			'MSTransform':'-ms-transform',
			'MozTransform':'-moz-transform',
			'transform':'transform'
		};

		/* Add it to the body to get the computed style.*/
		document.getElementsByTagName('body')[0].appendChild(el);

		for(t in transforms)
		{
			if( el.style[t] !== undefined )
			{
				var str;
				str = 'matrix(1, 0, 0, 1, 0, 0)';
				el.style[t] = str;
				if( str===window.getComputedStyle(el).getPropertyValue( transforms[t] ))
					support.css2dtransform= t;

				str = 'matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1)'
				el.style[t] = str;
				if( str===window.getComputedStyle(el).getPropertyValue( transforms[t] ))
					support.css3dtransform= t;
			}
		}

		el.parentNode.removeChild(el);
	}());
	//--] end
	
	//support requestAnimationFrame
	//[--adapted from https://gist.github.com/1579671
	// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
	// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

	// requestAnimationFrame shim by Erik Möller
	// fixes from Paul Irish and Tino Zijdel
	(function() {
		var lastTime = 0;
		var vendors = ['ms', 'moz', 'webkit', 'o'];
		for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
			window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
			window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
			|| window[vendors[x]+'CancelRequestAnimationFrame'];
		}

		if (!window.requestAnimationFrame)
			window.requestAnimationFrame = function(callback, element) {
				var currTime = new Date().getTime();
				var timeToCall = Math.max(0, 16 - (currTime - lastTime));
				var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
					timeToCall);
				lastTime = currTime + timeToCall;
				return id;
			};

		if (!window.cancelAnimationFrame)
			window.cancelAnimationFrame = function(id) {
			clearTimeout(id);
			};
	}());
	//--] end

	return support;
});
