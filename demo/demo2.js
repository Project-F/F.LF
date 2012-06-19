head.js('../character.js',
	'../../F.core/F.js',
	'../../F.core/math.js',
	'../../F.core/states.js',
	'../../F.core/sprite.js',
	'../../F.core/combodec.js',
	'../../F.core/controller.js',
	'bandit.js',
	demo2
);

function demo2() {

//load CSS
F.css('../../F.core/style.css');

//set up controller-------------
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

//controller recorder and player
var con_rec=
{
	key: function(k,down)
	{
		this.rec.push({t:this.time, k:k, d:down});
	},
	frame: function()
	{
		this.time+=1;
		if( this.time===300)
		{
			var log=document.getElementById('log');
			log.value+= '[\n';
			for( var i=0; i<this.rec.length; i++)
			{
				if( i!==0)
					log.value+= ',';
				log.value+= JSON.stringify(this.rec[i]);
			}
			log.value+= '\n]';
			this.rec=[];
			this.time=0;
		}
	},
	time: 0,
	rec: []
}
function control_player(control_con)
{
	var rec=[
{"t":13,"k":"left","d":1},{"t":16,"k":"left","d":1},{"t":16,"k":"left","d":0},{"t":16,"k":"right","d":1},{"t":19,"k":"right","d":1},{"t":19,"k":"right","d":0},{"t":19,"k":"left","d":1},{"t":22,"k":"right","d":1},{"t":22,"k":"left","d":1},{"t":22,"k":"left","d":0},{"t":24,"k":"right","d":1},{"t":24,"k":"right","d":0},{"t":32,"k":"right","d":1},{"t":33,"k":"right","d":1},{"t":33,"k":"right","d":0},{"t":36,"k":"right","d":1},{"t":38,"k":"right","d":1},{"t":38,"k":"right","d":0},{"t":71,"k":"def","d":1},{"t":75,"k":"def","d":1},{"t":75,"k":"def","d":0},{"t":87,"k":"left","d":1},{"t":88,"k":"left","d":1},{"t":88,"k":"left","d":0},{"t":90,"k":"left","d":1},{"t":94,"k":"left","d":1},{"t":94,"k":"left","d":0},{"t":105,"k":"jump","d":1},{"t":108,"k":"att","d":1},{"t":110,"k":"jump","d":1},{"t":110,"k":"jump","d":0},{"t":114,"k":"att","d":1},{"t":114,"k":"att","d":0},{"t":127,"k":"left","d":1},{"t":131,"k":"left","d":1},{"t":131,"k":"left","d":0},{"t":136,"k":"jump","d":1},{"t":141,"k":"jump","d":1},{"t":141,"k":"jump","d":0},{"t":148,"k":"right","d":1},{"t":157,"k":"jump","d":1},{"t":160,"k":"jump","d":1},{"t":160,"k":"jump","d":0},{"t":169,"k":"jump","d":1},{"t":172,"k":"jump","d":1},{"t":172,"k":"jump","d":0},{"t":185,"k":"right","d":1},{"t":185,"k":"right","d":0},{"t":190,"k":"right","d":1},{"t":192,"k":"jump","d":1},{"t":196,"k":"jump","d":1},{"t":196,"k":"jump","d":0},{"t":201,"k":"right","d":1},{"t":201,"k":"right","d":0},{"t":203,"k":"left","d":1},{"t":207,"k":"jump","d":1},{"t":210,"k":"jump","d":1},{"t":210,"k":"jump","d":0},{"t":230,"k":"jump","d":1},{"t":233,"k":"jump","d":1},{"t":233,"k":"jump","d":0},{"t":239,"k":"left","d":1},{"t":239,"k":"left","d":0},{"t":239,"k":"right","d":1},{"t":248,"k":"right","d":1},{"t":248,"k":"right","d":0},{"t":250,"k":"jump","d":1},{"t":254,"k":"jump","d":1},{"t":254,"k":"jump","d":0},{"t":266,"k":"att","d":1},{"t":271,"k":"att","d":1},{"t":271,"k":"att","d":0},{"t":279,"k":"att","d":1},{"t":282,"k":"att","d":1},{"t":282,"k":"att","d":0},{"t":285,"k":"att","d":1},{"t":288,"k":"att","d":1},{"t":288,"k":"att","d":0},{"t":291,"k":"att","d":1},{"t":294,"k":"att","d":1},{"t":294,"k":"att","d":0},{"t":296,"k":"att","d":1},{"t":299,"k":"att","d":1},{"t":299,"k":"att","d":0},{"t":2,"k":"att","d":1},{"t":5,"k":"att","d":1},{"t":5,"k":"att","d":0},{"t":7,"k":"att","d":1},{"t":10,"k":"att","d":1},{"t":10,"k":"att","d":0},{"t":17,"k":"jump","d":1},{"t":20,"k":"jump","d":1},{"t":20,"k":"jump","d":0},{"t":20,"k":"att","d":1},{"t":25,"k":"att","d":1},{"t":25,"k":"att","d":0}
];
	var I=0;
	var time=0;
	this.state= F.extend_object({},control_con);
	for ( var j in this.state)
		this.state[j]=0;
	this.child= [];
	
	this.frame= function()
	{
		for (; time===rec[I].t; I++)
		{
			for( var i in this.child)
				this.child[i].key(rec[I].k, rec[I].d);
			this.state[rec[I].k] = rec[I].d;
			
			if( I===rec.length-1)
				I=0;
		}
		time++;
	}
};
var control_play = new control_player(control_con);

//set up a character------------
//control.child.push(con_rec); //record control
var character = new F.LF.character(control); //choose from `control` and `control_play`
var character2 = new F.LF.character(control2);
character.set_pos(100,0,100);
character2.set_pos(500,0,100);

//---run time-------------------
var timer30 = setInterval(frame30,1000/31);
function frame30()
{
	control_play.frame();
	
	character.frame();
	character2.frame();
	calculate_fps(1);
	
	//con_rec.frame();
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
