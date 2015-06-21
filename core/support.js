define(function()
{
	var support = {};
	/*\
	 * support
	 * test for browser support of certain technologies, most code is adapted from other places.
	 * including
	 * - [http://davidwalsh.name/vendor-prefix](http://davidwalsh.name/vendor-prefix)
	 * - [https://gist.github.com/3626934](https://gist.github.com/3626934)
	 * - [https://gist.github.com/1579671](https://gist.github.com/3626934)
	 * [example](../sample/support.html)
	 # <iframe src="../sample/support.html" width="800" height="200"></iframe>
	\*/
	/*\
	 * support.browser
	 - (number) browser name
	 [ property ]
	\*/
	/*\
	 * support.browser_name
	 - (number) browser name
	 [ property ]
	\*/
	/*\
	 * support.browser_version
	 - (number) browser version string
	 [ property ]
	\*/
	/*\
	 * support.mobile
	 - (string) mobile device name, undefined if not on a mobile device
	 [ property ]
	\*/
	/*\
	 * support.prefix
	 - (string) browser prefix
	 [ property ]
	\*/
	/*\
	 * support.prefix_dom
	 - (string) browser prefix for DOM
	 [ property ]
	\*/
	/*\
	 * support.prefix_css
	 - (string) browser prefix for css
	 [ property ]
	\*/
	/*\
	 * support.prefix_js
	 - (string) browser prefix for js
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
	 | if( support.css3dtransform)
	 | 	this.el.style[support.css3dtransform]= 'translate3d('+P.x+'px,'+P.y+'px, 0px) ';
	\*/
	/*\
	 * support.localStorage
	 - (object) similar functionality as `window.localStorage`
	 * if `window.localStorage` is not supported, will create a shim that emulates `window.localStorage` using cookie. the methods `clear`, `getItem`, `key`, `removeItem`, `setItem` and property `length` are available, but the dot or array notation does not work. for example, the following does **not** work
	 | window.localStorage.someProperty = 2;
	 | window.localStorage['someProperty'] = 2;
	 * instead, use the following:
	 | support.localStorage.setItem('someProperty', 2);
	 * Ideally, all HTML5 browsers should support localStorage. The only problem is localStorage does not work in IE10 in protected mode for offline files.
	 [ property ]
	\*/
	/*\
	 * support.sessionStorage
	 - (object) similar functionality as `window.sessionStorage`
	 [ property ]
	\*/

	//test for browser and device
	(function(){		
		var N= navigator.appName, ua= navigator.userAgent, tem;
		var M= ua.match(/(opera|chrome|safari|firefox|msie)\/?\s*(\.?\d+(\.\d+)*)/i);
		if(M && (tem= ua.match(/version\/([\.\d]+)/i))!= null) M[2]= tem[1];
		M= M? [M[1], M[2]]: [N, navigator.appVersion,'-?'];
		support.browser = M[0];
		support.browser_name = M[0];
		support.browser_version = M[1];
		var mobile = /iPad|iPod|iPhone|Android|webOS|IEMobile/i.exec(navigator.userAgent.toLowerCase());
		support.mobile= mobile?mobile[0]:undefined;
		//[--adapted from http://davidwalsh.name/vendor-prefix
		var styles = window.getComputedStyle(document.documentElement, ''),
			pre = (Array.prototype.slice
				.call(styles)
				.join('') 
				.match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o'])
				)[1],
			dom = ('WebKit|Moz|MS|O').match(new RegExp('(' + pre + ')', 'i'))[1];
		support.prefix = dom;
		support.prefix_dom = dom;
		support.prefix_css = '-'+pre+'-';
		support.prefix_js = pre.toLowerCase();
		//--]
	}());

	//test for css 2d transform support
	//[--adapted from https://gist.github.com/3626934
	(function(){

		var el = document.createElement('p'), t, has3d;
		var transforms = {
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
				//if( str===window.getComputedStyle(el).getPropertyValue( transforms[t] ))
				if( window.getComputedStyle(el).getPropertyValue( transforms[t] ).indexOf('matrix3d')===0)
					support.css3dtransform= t;
			}
		}

		el.parentNode.removeChild(el);
	}());
	//--] end

	/// because IE9/10 has no localstorage on local file
	// Storage polyfill by Remy Sharp
	// [--
	// https://github.com/inexorabletash/polyfill/blob/master/storage.js
	// https://gist.github.com/350433
	// Tweaks by Joshua Bell (inexorabletash@gmail.com)
	if (!window.localStorage || !window.sessionStorage) (function() {

		var Storage = function(type) {
			function createCookie(name, value, days) {
				var date, expires;

				if (days) {
					date = new Date();
					date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
					expires = "; expires=" + date.toGMTString();
				} else {
					expires = "";
				}
				document.cookie = name + "=" + value + expires + "; path=/";
			}

			function readCookie(name) {
				var nameEQ = name + "=",
					ca = document.cookie.split(';'),
					i, c;

				for (i = 0; i < ca.length; i++) {
					c = ca[i];
					while (c.charAt(0) == ' ') {
						c = c.substring(1, c.length);
					}

					if (c.indexOf(nameEQ) == 0) {
						return c.substring(nameEQ.length, c.length);
					}
				}
				return null;
			}

			function setData(data) {
				data = JSON.stringify(data);
				if (type == 'session') {
					window.name = data;
				} else {
					createCookie('localStorage', data, 365);
				}
			}

			function clearData() {
				if (type == 'session') {
					window.name = '';
				} else {
					createCookie('localStorage', '', 365);
				}
			}

			function getData() {
				var data = type == 'session' ? window.name : readCookie('localStorage');
				return data ? JSON.parse(data) : {};
			}


			// initialise if there's already data
			var data = getData();

			function numKeys() {
				var n = 0;
				for (var k in data) {
					if (data.hasOwnProperty(k)) {
						n += 1;
					}
				}
				return n;
			}

			return {
				clear: function() {
					data = {};
					clearData();
					this.length = numKeys();
				},
				getItem: function(key) {
					key = encodeURIComponent(key);
					return data[key] === undefined ? null : data[key];
				},
				key: function(i) {
					// not perfect, but works
					var ctr = 0;
					for (var k in data) {
						if (ctr == i) return decodeURIComponent(k);
						else ctr++;
					}
					return null;
				},
				removeItem: function(key) {
					key = encodeURIComponent(key);
					delete data[key];
					setData(data);
					this.length = numKeys();
				},
				setItem: function(key, value) {
					key = encodeURIComponent(key);
					data[key] = String(value);
					setData(data);
					this.length = numKeys();
				},
				length: 0
			};
		};

		if (!window.localStorage) support.localStorage = new Storage('local');
		if (!window.sessionStorage) support.sessionStorage = new Storage('session');

	}());
	else
	{
		support.localStorage = window.localStorage;
		support.sessionStorage = window.sessionStorage;
	}
	//--]

	/// because IE9 has no classList
	//classList shim by eligrey
	/*! @source http://purl.eligrey.com/github/classList.js/blob/master/classList.js*/
	if("document" in self&&!("classList" in document.createElement("_")&&"classList" in document.createElementNS("http://www.w3.org/2000/svg","svg"))){(function(j){"use strict";if(!("Element" in j)){return}var a="classList",f="prototype",m=j.Element[f],b=Object,k=String[f].trim||function(){return this.replace(/^\s+|\s+$/g,"")},c=Array[f].indexOf||function(q){var p=0,o=this.length;for(;p<o;p++){if(p in this&&this[p]===q){return p}}return -1},n=function(o,p){this.name=o;this.code=DOMException[o];this.message=p},g=function(p,o){if(o===""){throw new n("SYNTAX_ERR","An invalid or illegal string was specified")}if(/\s/.test(o)){throw new n("INVALID_CHARACTER_ERR","String contains an invalid character")}return c.call(p,o)},d=function(s){var r=k.call(s.getAttribute("class")),q=r?r.split(/\s+/):[],p=0,o=q.length;for(;p<o;p++){this.push(q[p])}this._updateClassName=function(){s.setAttribute("class",this.toString())}},e=d[f]=[],i=function(){return new d(this)};n[f]=Error[f];e.item=function(o){return this[o]||null};e.contains=function(o){o+="";return g(this,o)!==-1};e.add=function(){var s=arguments,r=0,p=s.length,q,o=false;do{q=s[r]+"";if(g(this,q)===-1){this.push(q);o=true}}while(++r<p);if(o){this._updateClassName()}};e.remove=function(){var t=arguments,s=0,p=t.length,r,o=false;do{r=t[s]+"";var q=g(this,r);if(q!==-1){this.splice(q,1);o=true}}while(++s<p);if(o){this._updateClassName()}};e.toggle=function(p,q){p+="";var o=this.contains(p),r=o?q!==true&&"remove":q!==false&&"add";if(r){this[r](p)}return !o};e.toString=function(){return this.join(" ")};if(b.defineProperty){var l={get:i,enumerable:true,configurable:true};try{b.defineProperty(m,a,l)}catch(h){if(h.number===-2146823252){l.enumerable=false;b.defineProperty(m,a,l)}}}else{if(b[f].__defineGetter__){m.__defineGetter__(a,i)}}}(self))};

	return support;
});
