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

requirejs(['F.core/controller','F.core/sprite',
'LF/loader!packages','LF/match','LF/keychanger',
'./buildinfo.js'],
function(Fcontroller,Fsprite,
package,Match,Keychanger,
buildinfo){

	if( package.resourcemap)
	{
		var resmap = [
			package.resourcemap, //package-defined resourcemap
			{	//default resourcemap
				get: function(res)
				{
					return package.location+res;
				}
			}
		];
		Fsprite.masterconfig_set('resourcemap',resmap);
	}
	else
		Fsprite.masterconfig_set('baseUrl',package.location);

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

	var keychanger = document.getElementById('keychanger');
	keychanger.style.display='none';
	Keychanger(keychanger, [control1, control2]);
	keychanger.style.backgroundColor='#FFF';
	keychanger.style.display='';

	document.getElementById('footnote').innerHTML+=
		'; '+(buildinfo.timestamp==='unbuilt'?'unbuilt demo':'built on: '+buildinfo.timestamp);

	var match = new Match
	({
		stage: document.getElementById('stage'),
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
				data: package.data.object[0].data,
				id: package.data.object[0].id,
				team: 1
			},
			{
				controller: control2,
				data: package.data.object[1].data,
				id: package.data.object[1].id,
				team: 2
			}
		],

		control: 'debug'
	});

});
