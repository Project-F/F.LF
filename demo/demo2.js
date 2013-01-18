requirejs.config({
	baseUrl: '../../'
});

/* if( window.location.href.indexOf('//c9.io') !== -1)
	requirejs.config({
		baseUrl: '../../../',
		paths: {
			'core':'f_core/workspace',
			'LF':'f_lf/workspace'
		}
	}); */

requirejs(['F.core/controller','F.core/controller-recorder',
'LF/scene','LF/character','LF/lightweapon','LF/keychanger','LF/effects',
'LF/data/bandit','LF/data/weapon0','LF/data/effect0'],
function(Fcontroller, Fcr,
Scene, Character, Lightweapon, Keychanger, Effects,
bandit, weapon0, effect0)
{
	demo2();

	function demo2() {

	//set up controller-------------
	var record=[
	{"t":13,"k":"left","d":1},{"t":16,"k":"left","d":1},{"t":16,"k":"left","d":0},{"t":16,"k":"right","d":1},{"t":19,"k":"right","d":1},{"t":19,"k":"right","d":0},{"t":19,"k":"left","d":1},{"t":22,"k":"right","d":1},{"t":22,"k":"left","d":1},{"t":22,"k":"left","d":0},{"t":24,"k":"right","d":1},{"t":24,"k":"right","d":0},{"t":32,"k":"right","d":1},{"t":33,"k":"right","d":1},{"t":33,"k":"right","d":0},{"t":36,"k":"right","d":1},{"t":38,"k":"right","d":1},{"t":38,"k":"right","d":0},{"t":71,"k":"def","d":1},{"t":75,"k":"def","d":1},{"t":75,"k":"def","d":0},{"t":87,"k":"left","d":1},{"t":88,"k":"left","d":1},{"t":88,"k":"left","d":0},{"t":90,"k":"left","d":1},{"t":94,"k":"left","d":1},{"t":94,"k":"left","d":0},{"t":105,"k":"jump","d":1},{"t":108,"k":"att","d":1},{"t":110,"k":"jump","d":1},{"t":110,"k":"jump","d":0},{"t":114,"k":"att","d":1},{"t":114,"k":"att","d":0},{"t":127,"k":"left","d":1},{"t":131,"k":"left","d":1},{"t":131,"k":"left","d":0},{"t":136,"k":"jump","d":1},{"t":141,"k":"jump","d":1},{"t":141,"k":"jump","d":0},{"t":148,"k":"right","d":1},{"t":157,"k":"jump","d":1},{"t":160,"k":"jump","d":1},{"t":160,"k":"jump","d":0},{"t":169,"k":"jump","d":1},{"t":172,"k":"jump","d":1},{"t":172,"k":"jump","d":0},{"t":185,"k":"right","d":1},{"t":185,"k":"right","d":0},{"t":190,"k":"right","d":1},{"t":192,"k":"jump","d":1},{"t":196,"k":"jump","d":1},{"t":196,"k":"jump","d":0},{"t":201,"k":"right","d":1},{"t":201,"k":"right","d":0},{"t":203,"k":"left","d":1},{"t":207,"k":"jump","d":1},{"t":210,"k":"jump","d":1},{"t":210,"k":"jump","d":0},{"t":230,"k":"jump","d":1},{"t":233,"k":"jump","d":1},{"t":233,"k":"jump","d":0},{"t":239,"k":"left","d":1},{"t":239,"k":"left","d":0},{"t":239,"k":"right","d":1},{"t":248,"k":"right","d":1},{"t":248,"k":"right","d":0},{"t":250,"k":"jump","d":1},{"t":254,"k":"jump","d":1},{"t":254,"k":"jump","d":0},{"t":266,"k":"att","d":1},{"t":271,"k":"att","d":1},{"t":271,"k":"att","d":0},{"t":279,"k":"att","d":1},{"t":282,"k":"att","d":1},{"t":282,"k":"att","d":0},{"t":285,"k":"att","d":1},{"t":288,"k":"att","d":1},{"t":288,"k":"att","d":0},{"t":291,"k":"att","d":1},{"t":294,"k":"att","d":1},{"t":294,"k":"att","d":0},{"t":296,"k":"att","d":1},{"t":299,"k":"att","d":1},{"t":299,"k":"att","d":0}
	];

	var control_con =
	{
		up:'u',down:'m',left:'h',right:'k',def:',',jump:'i',att:'j'
	};
	var control_con2 =
	{
		up:'w',down:'x',left:'a',right:'d',def:'z',jump:'q',att:'s'
	};
	var control = new Fcontroller(control_con);
	var control2 = new Fcontroller(control_con2);
	var control_play = new Fcr.control_player(control_con, record);
	control.sync=true;
	control2.sync=true;

	/* var control_rec = new Fcr.control_recorder(control_play);
	document.getElementById('export').onclick=function()
	{
		document.getElementById('log').value += control_rec.export_str();
	} */

	//user interface----------------
	document.getElementById('speed').onclick=function()
	{
		if( slow_motion===false)
		{
			this.innerHTML='normal';
			slow_motion=true;
		}
		else
		{
			this.innerHTML='slow motion';
			slow_motion=false;
		}
	}

	var keychanger = document.getElementById('keychanger');
	keychanger.style.display='none';
	Keychanger(keychanger, [control, control2]);
	keychanger.style.backgroundColor='#FFF';
	//keychanger.style.display='';

	//set up scene------------------
	var scene = new Scene();
	var stage = document.getElementById('stage');

	//effects-----------------------
	var effects = new Effects( {init_size:10, stage:stage}, [effect0], [300]);

	//set up a character------------
	var char_config=
	{
		stage: stage,
		scene: scene,
		effects: effects,
		controller: null
	};
	char_config.controller= control; //choose from `control` and `control_play`
	char_config.team = 1;
	var character1 = new Character( char_config, bandit, 0);
	char_config.controller= control2;
	char_config.team = 2;
	var character2 = new Character( char_config, bandit, 0);
	character1.set_pos(400,0,200);
	character2.set_pos(300,0,200);

	var weapon1 = new Lightweapon( {stage:stage,scene:scene}, weapon0, 100);
	weapon1.set_pos(100,-200,200);

	//---run time-------------------
	var timer30 = setInterval(frame30,1000/30.5);
	var counter=0;
	var slow_motion=false;
	function frame30()
	{
		if( counter++===14)
			counter=0;
		if( slow_motion && counter!==0) return;

		control_play.frame();
		//control_rec.frame();

		character1.trans();
		character2.trans();
		weapon1.trans();

		character1.TU();
		character2.TU();
		weapon1.TU();
		effects.TU();

		calculate_fps(1);
	}

	var fps=document.getElementById('fps');
	function calculate_fps(mul)
	{
		if(!this.t) this.t=0;
		var ot=this.time;
		this.time = new Date().getTime();
		var diff = this.time-ot;
		fps.value = Math.round(1000/diff*mul)+'fps - '+(this.t++)%99;
	}

	}
});
