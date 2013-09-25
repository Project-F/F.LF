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
'LF/loader!packages','LF/match','LF/keychanger',
'LF/util','./buildinfo.js','F.core/css!LF/application.css'],
function(Fcontroller,Fsprite,Fsupport,
package,Match,Keychanger,
util,buildinfo){

	util.setup_resourcemap(package,Fsprite);

	var control_con1 =
	{
		up:'u',down:'m',left:'h',right:'k',def:',',jump:'i',att:'j'
	};
	var control_con2 =
	{
		up:'w',down:'x',left:'a',right:'d',def:'z',jump:'q',att:'s'
	};
	var control1 = new Fcontroller(control_con1);
	var control2 = new Fcontroller(control_con2);
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

	var maximized=undefined;
	function resizer(ratio)
	{
		if( maximized)
		{
			if( typeof ratio!=='number')
			{
				ratio = window.innerHeight/parseInt(window.getComputedStyle(util.container,null).getPropertyValue('height'));
				ratio = Math.floor(ratio*10)/10;
				console.log(ratio);
			}
			util.container.style[Fsupport.css2dtransform+'Origin']= '0 0';
			util.container.style[Fsupport.css2dtransform]= 'scale('+ratio+','+ratio+') ';
		}
	}
	if( window.location.href.match(/embed/))
		util.div('maximizeButton').onclick=function()
		{
			var link=document.createElement('a');
			link.href = 'demo4.html';
			link.target='_blank';
			link.click();
		}
	else
		util.div('maximizeButton').onclick=function()
		{
			if( Fsupport.css2dtransform)
			{
				if( !maximized)
				{
					if( maximized===undefined)
						window.addEventListener('resize', resizer, false);
					maximized=true;
					util.div('maximizeButton').firstChild.innerHTML='&#9724;';
					if( util.div('backgroundScroll'))
						util.div('backgroundScroll').style.display='none';
					resizer();
				}
				else
				{
					util.div('maximizeButton').firstChild.innerHTML='&#9723;';
					if( util.div('backgroundScroll'))
						util.div('backgroundScroll').style.display='';
					resizer(1);
					maximized=false;
				}
			}
		}

	util.div('footnote').innerHTML+='; '+
		(buildinfo.timestamp==='unbuilt'?'unbuilt demo':'built on: '+buildinfo.timestamp);

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
				id: 30,
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
