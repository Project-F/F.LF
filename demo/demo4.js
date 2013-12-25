requirejs.config(
{
	baseUrl: '../../',
	paths:
	{
	},
	config:
	{
	}
});

requirejs(['F.core/controller','F.core/sprite','F.core/support',
'LF/loader!packages','LF/match','LF/keychanger','LF/touchcontroller',
'LF/util','LF/global','F.core/css!LF/application.css'],
function(Fcontroller,Fsprite,Fsupport,
package,Match,Keychanger,touchcontroller,
util,global){

	if (typeof console === "undefined"){
		console={};
		console.log = function(){
			return;
		}
	}

	console.log(util.div('projectFmessage').innerHTML);

	//feature check
	if( !Fsupport.css2dtransform && !Fsupport.css3dtransform)
	{
		var mess = util.div('errorMessage');
		mess.innerHTML=
			'Sorry, your browser does not support CSS transform.<br>'+
			'Please update to a latest HTML5 browser.';
		return;
	}

	//analytics
	if( window.location.href.indexOf('http')===0)
	{
		(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
		(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
		m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
		})(window,document,'script','http://www.google-analytics.com/analytics.js','ga');
		ga('create', 'UA-37320960-5', 'tyt2y3.github.io');
		ga('send', 'pageview');
	}

	//
	// UI window
	//
	var UI_state=
	{
		maximized:undefined,
		wide:false
	};
	function resizer(ratio)
	{
		if( UI_state.maximized)
		{
			if( typeof ratio!=='number')
			{
				var ratioh = window.innerHeight/parseInt(window.getComputedStyle(util.container,null).getPropertyValue('height')),
					ratiow = window.innerWidth/parseInt(window.getComputedStyle(util.container,null).getPropertyValue('width'));
				ratio = ratioh<ratiow? ratioh:ratiow;
				ratio = Math.floor(ratio*100)/100;
			}
			util.container.style[Fsupport.css2dtransform+'Origin']= '0 0';
			util.container.style[Fsupport.css2dtransform]= 'scale('+ratio+','+ratio+') ';
		}
	}
	util.div('maximizeButton').onclick=function()
	{
		if( Fsupport.css2dtransform)
		{
			if( !UI_state.maximized)
			{
				if( UI_state.maximized===undefined)
					window.addEventListener('resize', resizer, false);
				UI_state.maximized=true;
				this.firstChild.innerHTML='&#9724;';
				if( util.div('backgroundScroll'))
					util.div('backgroundScroll').style.display='none';
				document.body.style.background='#888';
				resizer();
			}
			else
			{
				this.firstChild.innerHTML='&#9723;';
				if( util.div('backgroundScroll'))
					util.div('backgroundScroll').style.display='';
				document.body.style.background='';
				resizer(1);
				UI_state.maximized=false;
			}
		}
	}
	util.div('wideWindowButton').style.display='none';
	util.div('wideWindowButton').onclick=function()
	{
		if( !UI_state.wide)
		{
			UI_state.wide=true;
			util.div().classList.add('wideWindow');
			this.firstChild.innerHTML='&#8622;';
		}
		else
		{
			UI_state.wide=false;
			util.div().classList.remove('wideWindow');
			this.firstChild.innerHTML='&#8596;';
		}
		resizer();
	}

	//process parameters
	var param = util.location_parameters();
	if( param)
	for( var i=0; i<param.length; i++)
	{
		switch(param[i][0])
		{
			case 'embed':
				util.div('maximizeButton').onclick=function()
				{
					var link=document.createElement('a');
					link.href = 'demo4.html?max';
					link.target='_blank';
					link.style.display='none';
					var body = document.getElementsByTagName('body')[0];
					body.appendChild(link);
					link.click();
				}
			break;
			case 'max':
				util.div('maximizeButton').onclick();
			break;
		}
	}

	if( window.innerWidth<global.application.window.width ||
		window.innerHeight<global.application.window.height )
	{
		util.div('maximizeButton').onclick();
		if( window.innerWidth/window.innerHeight > 5/3)
			util.div('wideWindowButton').onclick();
	}

	requirejs(['./buildinfo.js'],function(buildinfo){
		util.div('footnote').innerHTML+=
			(buildinfo.timestamp==='unbuilt'?'unbuilt demo':'built on: '+buildinfo.timestamp);
	});

	//
	// save settings
	//
	var control_con1 =
	{
		up:'u',down:'m',left:'h',right:'k',def:',',jump:'i',att:'j'
	};
	var control_con2 =
	{
		up:'w',down:'x',left:'a',right:'d',def:'z',jump:'q',att:'s'
	};
	if( Fsupport.localStorage)
	{
		window.addEventListener('beforeunload',function(){
			var obj =
			{
				controller:
				[
					control1.config, control2.config
				]
			}
			Fsupport.localStorage.setItem('F.LF/settings',JSON.stringify(obj));
		},false);

		if( Fsupport.localStorage.getItem('F.LF/settings'))
		{
			var obj = JSON.parse(Fsupport.localStorage.getItem('F.LF/settings'));
			if( obj.controller[0])
				control_con1 = obj.controller[0];
			if( obj.controller[1])
				control_con2 = obj.controller[1];
		}
	}

	//
	// F.LF stuff
	//
	var support_touch = 'ontouchstart' in window || navigator.msMaxTouchPoints;
	util.setup_resourcemap(package,Fsprite);

	var control1 = new Fcontroller(control_con1);
	var control2;
	if( !support_touch)
		control2 = new Fcontroller(control_con2);
	else
		control2 = new touchcontroller();
	control1.sync=true;
	control2.sync=true;

	var keychanger = util.div('keychanger');
	keychanger.style.display='none';
	Keychanger(keychanger, [control1, control2]);
	keychanger.style.backgroundColor='#FFF';
	util.div('keychangerButton').onclick=function()
	{
		keychanger.style.display= keychanger.style.display===''?'none':'';
	}

	var match = new Match
	({
		stage: util.div('floor'),
		state: null,
		config: null,
		package: package
	});

	match.create
	({
		player:
		[
			{
				controller: control1,
				id: 11,
				team: 1
			},
			{
				controller: control2,
				id: 1,
				team: 2
			}
		],
		control: 'debug',
		set:
		{
			weapon: true
		},
		background: {id:1}
	});

});
