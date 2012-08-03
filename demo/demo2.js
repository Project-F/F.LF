(function ()
{
	//to load required files
	
	//get base path
	var f_core_path;
	var str=window.location.href;
	if( str.indexOf('http://c9.io') !== -1)
		f_core_path = '../../../f_core/workspace/'; //cloud9 relative path
	else
		f_core_path = '../../F.core/'; //local path
	
	//laod scripts
	head.js('../scene.js',
		'../sprite.js',
		'../character.js',
		f_core_path+'F.js',
		f_core_path+'math.js',
		f_core_path+'states.js',
		f_core_path+'sprite.js',
		f_core_path+'combodec.js',
		f_core_path+'collision.js',
		f_core_path+'controller.js',
		f_core_path+'controller-recorder.js',
		'bandit.js',
		callback
	);
	
	function callback()
	{
		F.css(f_core_path+'style.css'); //load CSS
		demo2();
	}
}());

function demo2() {

//set up controller-------------
var record=[
{"t":13,"k":"left","d":1},{"t":16,"k":"left","d":1},{"t":16,"k":"left","d":0},{"t":16,"k":"right","d":1},{"t":19,"k":"right","d":1},{"t":19,"k":"right","d":0},{"t":19,"k":"left","d":1},{"t":22,"k":"right","d":1},{"t":22,"k":"left","d":1},{"t":22,"k":"left","d":0},{"t":24,"k":"right","d":1},{"t":24,"k":"right","d":0},{"t":32,"k":"right","d":1},{"t":33,"k":"right","d":1},{"t":33,"k":"right","d":0},{"t":36,"k":"right","d":1},{"t":38,"k":"right","d":1},{"t":38,"k":"right","d":0},{"t":71,"k":"def","d":1},{"t":75,"k":"def","d":1},{"t":75,"k":"def","d":0},{"t":87,"k":"left","d":1},{"t":88,"k":"left","d":1},{"t":88,"k":"left","d":0},{"t":90,"k":"left","d":1},{"t":94,"k":"left","d":1},{"t":94,"k":"left","d":0},{"t":105,"k":"jump","d":1},{"t":108,"k":"att","d":1},{"t":110,"k":"jump","d":1},{"t":110,"k":"jump","d":0},{"t":114,"k":"att","d":1},{"t":114,"k":"att","d":0},{"t":127,"k":"left","d":1},{"t":131,"k":"left","d":1},{"t":131,"k":"left","d":0},{"t":136,"k":"jump","d":1},{"t":141,"k":"jump","d":1},{"t":141,"k":"jump","d":0},{"t":148,"k":"right","d":1},{"t":157,"k":"jump","d":1},{"t":160,"k":"jump","d":1},{"t":160,"k":"jump","d":0},{"t":169,"k":"jump","d":1},{"t":172,"k":"jump","d":1},{"t":172,"k":"jump","d":0},{"t":185,"k":"right","d":1},{"t":185,"k":"right","d":0},{"t":190,"k":"right","d":1},{"t":192,"k":"jump","d":1},{"t":196,"k":"jump","d":1},{"t":196,"k":"jump","d":0},{"t":201,"k":"right","d":1},{"t":201,"k":"right","d":0},{"t":203,"k":"left","d":1},{"t":207,"k":"jump","d":1},{"t":210,"k":"jump","d":1},{"t":210,"k":"jump","d":0},{"t":230,"k":"jump","d":1},{"t":233,"k":"jump","d":1},{"t":233,"k":"jump","d":0},{"t":239,"k":"left","d":1},{"t":239,"k":"left","d":0},{"t":239,"k":"right","d":1},{"t":248,"k":"right","d":1},{"t":248,"k":"right","d":0},{"t":250,"k":"jump","d":1},{"t":254,"k":"jump","d":1},{"t":254,"k":"jump","d":0},{"t":266,"k":"att","d":1},{"t":271,"k":"att","d":1},{"t":271,"k":"att","d":0},{"t":279,"k":"att","d":1},{"t":282,"k":"att","d":1},{"t":282,"k":"att","d":0},{"t":285,"k":"att","d":1},{"t":288,"k":"att","d":1},{"t":288,"k":"att","d":0},{"t":291,"k":"att","d":1},{"t":294,"k":"att","d":1},{"t":294,"k":"att","d":0},{"t":296,"k":"att","d":1},{"t":299,"k":"att","d":1},{"t":299,"k":"att","d":0}
];

var control_con =
{
	up:'i',down:'k',left:'j',right:'l',def:'h',jump:'y',att:'t'
};
var control_con2 =
{
	up:'w',down:'x',left:'a',right:'d',def:'`',jump:'q',att:'s'
};
var control = new F.controller(control_con);
var control2 = new F.controller(control_con2);
var control_play = new F.control_player(control_con, record);

/*var control_rec = new F.control_recorder(control_play);
document.getElementById('export').onclick=function()
{
	document.getElementById('log').value += control_rec.export_str();
} */

//set up scene------------------
var scene = new F.LF.scene();

//set up a character------------
var character = new F.LF.character( {controller: control, scene:scene} ); //choose from `control` and `control_play`
var character2 = new F.LF.character( {controller: control2, scene:scene} );
scene.add( character); character.set_pos(500,0,100);
scene.add( character2); character2.set_pos(400,0,100);

//---run time-------------------
var timer30 = setInterval(frame30,1000/1);
function frame30()
{
	control_play.frame();
	//control_rec.frame();
	
	character.TU();
	character2.TU();
	calculate_fps(1);
}

var fps=document.getElementById('fps');
function calculate_fps(mul)
{
	var ot=this.time;
	this.time = new Date().getTime();
	var diff = this.time-ot;
	fps.value = Math.round(1000/diff*mul)+'fps';
}

}
