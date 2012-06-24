head.js('../scene.js',
	'../sprite.js',
	'../character.js',
	'../../F.core/F.js',
	'../../F.core/math.js',
	'../../F.core/states.js',
	'../../F.core/sprite.js',
	'../../F.core/combodec.js',
	'../../F.core/collision.js',
	'../../F.core/controller.js',
	'../../F.core/controller-recorder.js',
	'bandit.js',
	demo2
);

function demo2() {

//load CSS
F.css('../../F.core/style.css');

//set up controller-------------
var record=[
{"t":13,"k":"left","d":1},{"t":16,"k":"left","d":1},{"t":16,"k":"left","d":0},{"t":16,"k":"right","d":1},{"t":19,"k":"right","d":1},{"t":19,"k":"right","d":0},{"t":19,"k":"left","d":1},{"t":22,"k":"right","d":1},{"t":22,"k":"left","d":1},{"t":22,"k":"left","d":0},{"t":24,"k":"right","d":1},{"t":24,"k":"right","d":0},{"t":32,"k":"right","d":1},{"t":33,"k":"right","d":1},{"t":33,"k":"right","d":0},{"t":36,"k":"right","d":1},{"t":38,"k":"right","d":1},{"t":38,"k":"right","d":0},{"t":71,"k":"def","d":1},{"t":75,"k":"def","d":1},{"t":75,"k":"def","d":0},{"t":87,"k":"left","d":1},{"t":88,"k":"left","d":1},{"t":88,"k":"left","d":0},{"t":90,"k":"left","d":1},{"t":94,"k":"left","d":1},{"t":94,"k":"left","d":0},{"t":105,"k":"jump","d":1},{"t":108,"k":"att","d":1},{"t":110,"k":"jump","d":1},{"t":110,"k":"jump","d":0},{"t":114,"k":"att","d":1},{"t":114,"k":"att","d":0},{"t":127,"k":"left","d":1},{"t":131,"k":"left","d":1},{"t":131,"k":"left","d":0},{"t":136,"k":"jump","d":1},{"t":141,"k":"jump","d":1},{"t":141,"k":"jump","d":0},{"t":148,"k":"right","d":1},{"t":157,"k":"jump","d":1},{"t":160,"k":"jump","d":1},{"t":160,"k":"jump","d":0},{"t":169,"k":"jump","d":1},{"t":172,"k":"jump","d":1},{"t":172,"k":"jump","d":0},{"t":185,"k":"right","d":1},{"t":185,"k":"right","d":0},{"t":190,"k":"right","d":1},{"t":192,"k":"jump","d":1},{"t":196,"k":"jump","d":1},{"t":196,"k":"jump","d":0},{"t":201,"k":"right","d":1},{"t":201,"k":"right","d":0},{"t":203,"k":"left","d":1},{"t":207,"k":"jump","d":1},{"t":210,"k":"jump","d":1},{"t":210,"k":"jump","d":0},{"t":230,"k":"jump","d":1},{"t":233,"k":"jump","d":1},{"t":233,"k":"jump","d":0},{"t":239,"k":"left","d":1},{"t":239,"k":"left","d":0},{"t":239,"k":"right","d":1},{"t":248,"k":"right","d":1},{"t":248,"k":"right","d":0},{"t":250,"k":"jump","d":1},{"t":254,"k":"jump","d":1},{"t":254,"k":"jump","d":0},{"t":266,"k":"att","d":1},{"t":271,"k":"att","d":1},{"t":271,"k":"att","d":0},{"t":279,"k":"att","d":1},{"t":282,"k":"att","d":1},{"t":282,"k":"att","d":0},{"t":285,"k":"att","d":1},{"t":288,"k":"att","d":1},{"t":288,"k":"att","d":0},{"t":291,"k":"att","d":1},{"t":294,"k":"att","d":1},{"t":294,"k":"att","d":0},{"t":296,"k":"att","d":1},{"t":299,"k":"att","d":1},{"t":299,"k":"att","d":0}
];

var control_con =
{
	up:'i',down:'k',left:'j',right:'l',def:'h',jump:'y',att:'t'
}
var control_con2 =
{
	up:'d',down:'c',left:'x',right:'v',def:'s',jump:'w',att:'q'
}
var control = new F.controller(control_con);
var control2 = new F.controller(control_con2);
var control_play = new F.control_player(control_con, record);

/*var control_rec = new F.control_recorder(control_play);
document.getElementById('export').onclick=function()
{
	document.getElementById('log').value += control_rec.export();
} */

//set up scene------------------
var scene = new F.LF.scene();

//set up a character------------
var character = new F.LF.character( {controller: control, scene:scene} ); //choose from `control` and `control_play`
var character2 = new F.LF.character( {controller: control2, scene:scene} );
scene.add( character); character.set_pos(200,0,100);
scene.add( character2); character2.set_pos(100,0,100);

//---run time-------------------
var timer30 = setInterval(frame30,1000/31);
function frame30()
{
	control_play.frame();
	//control_rec.frame();
	
	character.frame();
	character2.frame();
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

};
