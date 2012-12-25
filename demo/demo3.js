//load F.core modules
requirejs.config({
	baseUrl: '../../',
	paths: {
		'loader_depend': 'LF/data/data',
		'data': 'LF/data'
	}
});

requirejs(['core/controller',
'LF/loader!data','LF/match'],
function(Fcontroller,
gamedata,Match){

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

	var match = new Match
	({
		stage: document.getElementById('stage'),
		state: null,
		config: null,
		data: gamedata
	});

	match.start
	({
		player:
		[
			{
				controller: control1,
				data: gamedata.object.character[0].data,
				id: gamedata.object.character[0].id,
				team: 1
			},
			{
				controller: control2,
				data: gamedata.object.character[0].data,
				id: gamedata.object.character[0].id,
				team: 2
			}
		],

		control: 'debug'
	});

});
