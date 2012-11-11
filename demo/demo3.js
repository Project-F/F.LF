//load F.core modules
requirejs.config({
	baseUrl: '../../',
	paths: {
		'data': 'LF/data'
	}
});

requirejs(['LF/loader!data/data'],function(gamedata){
	console.log( gamedata);
});
