requirejs.config({
	baseUrl: '../../../../'
});
requirejs(['core/math','core/controller','./character.js'], function(A,B,C)
{
	demo1(A,B,C);
});

function demo1(Fmath,Fcontroller,Character) {

//---configurations--------------
var state_con =
{
	event:
	{
		entry: 'standing' //initial state
	},

	standing:
	{
		event:
		{
			'run':'running',
			'jump':'start_jumping',
			'att':'punch',

			'4fps': function(S)
			{
				S.C.next_frame(this.name);
			},
			'30fps': function(S)
			{
				var ns=null;
				if( S.C.con.state.up || S.C.con.state.down || S.C.con.state.left || S.C.con.state.right) //if any directional key is pressed
					ns='walking';
				if( S.C.con.state.left && S.C.con.state.right && !S.C.con.state.up && !S.C.con.state.down ) //if key conflict
					ns=null;
				if( S.C.con.state.up && S.C.con.state.down && !S.C.con.state.left && !S.C.con.state.right ) //if another key conflict
					ns=null;
				return ns;
			},
			entry: function(S,event,from)
			{
				if( from.name!='walking') //if it is not entering from walking
					S.C.next_frame(this.name);
			},
		},
	},

	walking:
	{
		event:
		{
			'run':'running',
			'jump':'start_jumping',
			'att':'punch',

			'8fps': function(S)
			{
				S.C.next_frame(this.name);
			},
			'30fps': function(S)
			{
				var data=this.data;
				if(S.C.con.state.up)    S.C.sp.z-=data.speedz;
				if(S.C.con.state.down)  S.C.sp.z+=data.speedz;
				if(S.C.con.state.left)  S.C.sp.x-=data.speed;
				if(S.C.con.state.right) S.C.sp.x+=data.speed;
				S.C.move(this); //update position

				if (
				(!S.C.con.state.up && !S.C.con.state.down && !S.C.con.state.left && !S.C.con.state.right) //if all directional keys are released
				|| //or
				( S.C.con.state.left && S.C.con.state.right && !S.C.con.state.up && !S.C.con.state.down ) //if key conflict
				|| //or
				( S.C.con.state.up && S.C.con.state.down && !S.C.con.state.left && !S.C.con.state.right ) //another key conflict
				)
					return 'standing';
			},
		},
		data:
		{
			speed: 4,
			speedz: 2,
		}
	},

	running:
	{
		event:
		{
			'def':  'rowing',
			'jump': 'dash_normal',
			'att': 'run_attack',
			'left_pressed': function(S)
			{
				if( S.C.dir.cur_name=='right')
					return 'stop_running';
			},
			'right_pressed': function(S)
			{
				if( S.C.dir.cur_name=='left')
					return 'stop_running';
			},
			'10fps': function(S)
			{
				S.C.next_frame(this.name);
			},
			'30fps': function(S)
			{
				var data=this.data;
				switch(S.C.dir.cur_name)
				{
				case 'left':  S.C.sp.x-=data.speed; break;
				case 'right': S.C.sp.x+=data.speed; break;
				}
				if(S.C.con.state.up)   S.C.sp.z-=data.speedz;
				if(S.C.con.state.down) S.C.sp.z+=data.speedz;

				S.C.move(this); //update position
			},
			entry: function(S)
			{
				S.C.switch_dir(false);
			},
		},
		data:
		{
			speed: 8,
			speedz: 1.3,
		},
	},

	stop_running:
	{
		event:
		{
			entry: function(S)
			{
				S.C.set_frame(0,this.name);
				S.C.next('end',this.data.wait);
			},
			'end': 'standing',
			exit: function(S)
			{
				S.C.dec.seq.push('_'); //insert an interrupt to prevent a new run event
				S.C.switch_dir(true);
			},
			'30fps': function(S)
			{
				S.C.move(this);
			},
		},
		data:
		{
			dvx: 4,
			wait: 7, //delay for 7 frames, i.e. 7/30 second
		},
	},

	start_jumping:
	{
		event:
		{
			'8fps': function(S)
			{
				S.C.next_frame(this.name);
			},
			entry: function(S)
			{
				S.C.set_frame(0,this.name);
				S.C.next('end',this.data.wait);
			},
			'end': 'jump_normal',
			exit: function(S,E,target)
			{
				var That=target.superstate;
				That.data.movex=0;	That.data.movez=0;
				if(S.C.con.state.up)    That.data.movez -=1;
				if(S.C.con.state.down)  That.data.movez +=1;
				if(S.C.con.state.left)  That.data.movex -=1;
				if(S.C.con.state.right) That.data.movex +=1;
			},
		},
		data:
		{
			wait: 4, //time before leaving the ground
		},
	},

	jumping:
	{
		event:
		{
			'30fps': function(S)
			{
				var data=this.data;
				var I=data.counter++;

				var P=Fmath.bezier2_step(data.parabola[0],data.parabola[1],data.parabola[2],
						I,data.step); //get a step from the jump parabola
				S.C.sp.y = P.y; // the parabola is upward along the y axis
				S.C.sp.x+= data.speed * this.data.movex; //movement
				S.C.sp.z+= data.speedz* this.data.movez;
				S.C.move(this);

				if( I==data.step) //touching the ground
					return 'stop_jumping';
			},
			entry: function(S)
			{
				var data=this.data;
				data.counter=0;
			},
		},
		data:
		{
			parabola:
			{
			        0:{x:0,y:0}, 1:{x:0,y:-170}, 2:{x:0,y:0}
			}, //                1:     y:total_jump_height*-2
			   //the jumping parabola is approximated by a degree 2 bezier curve,
			   //  to visualize this, use tools/parabola_planner.html
			   //  note that only the upward component of the parabola is used

			step: 22, //the jumping parabola is subdivided into 'step' no. of segments for animation,
				  //  each frame advances one step. the more the no. of steps, the longer the time in air

			speed: 7,
			speedz: 3,
		},

		jump_normal:
		{
			event:
			{
				entry: function(S)
				{
					S.C.next('entered',1);
				},
				'entered': function(S)
				{
					if( S.C.con.state.att)
						return 'jump_attack';
					S.C.set_frame(0,this.name);
				},
				'att': 'jump_attack',
			},
		},

		jump_attack:
		{
			event:
			{
				entry: function(S)
				{
					S.C.switch_dir(false);
					S.C.set_frame(0,this.name);
					S.C.next('punch',this.data.wait);
				},
				'punch': function(S)
				{
					S.C.set_frame(1,this.name);
					S.C.next('finish',this.data.last);
				},
				'finish': function(S)
				{
					S.C.set_frame(0,this.name);
					S.C.next('end',1);
				},
				'end': 'jump_normal',
				exit: function(S)
				{
					S.C.switch_dir(true);
				},
			},
			data:
			{
				wait: 2,
				last: 12,
			},
		},
	},

	stop_jumping:
	{
		event:
		{
			'def': function(S)
			{
				if( this.data.target.name==='jumping')
					return 'rowing';
			},
			'jump': function(S)
			{
				if( this.data.target.name==='jumping')
				{	//only if the previous states is jumping
					if( S.C.con.state.left || S.C.con.state.right)
						return 'dash_normal';
					else
						return 'start_jumping';
				}
			},
			entry: function(S,event,target)
			{
				S.C.set_frame(0,this.name);
				this.data.target=target.superstate;
				S.C.next('last',this.data.wait);
			},
			'last': function(S)
			{
				var That=this.data.target;
				S.C.sp.x+= this.data.speed * That.data.movex; //movement
				S.C.sp.z+= this.data.speedz* That.data.movez;
				S.C.move(this);
				S.C.next('end',this.data.last);
			},
			'end': 'standing',
		},
		data:
		{
			speed: 6,
			speedz: 2,
			wait: 3,
			last: 2,
		},
	},

	rowing:
	{
		event:
		{
			'8fps': function(S)
			{
				S.C.next_frame(this.name);
			},
			'30fps': function(S)
			{
				var data=this.data;
				S.C.move(this);

				if( data.counter == data.rowing_length)
					return 'standing';
				data.counter++;
			},

			entry: function(S)
			{
				S.C.next_frame(this.name);
				this.data.counter=0;
				S.C.switch_dir(false);
			},
			exit: function(S)
			{
				S.C.switch_dir(true);
			},
		},
		data:
		{
			dvx: 7,
			rowing_length: 18, //in terms of no. of frames
		},
	},

	dashing:
	{
		event:
		{
			'30fps': function(S)
			{
				var data=this.data;
				var I=data.counter++;

				var P=Fmath.bezier2_step(data.parabola[0],data.parabola[1],data.parabola[2], I,data.step);
				S.C.sp.y = P.y;
				switch(data.dir)
				{
				case 'left':  S.C.sp.x = data.initx-P.x; break;
				case 'right': S.C.sp.x = data.initx+P.x; break;
				}
				S.C.sp.z+= data.speedz * data.movez;
				S.C.move(this);

				if( I>=Math.floor(data.step/2)+1)
					S.consult('late');
				if( I==data.step)
					return 'stop_jumping';
			},

			entry: function(S)
			{
				var data=this.data;
				data.counter= 0;
				data.initx= S.C.sp.x;
				data.dir= S.C.dir.cur_name;
				data.movex= data.dir=='left'?-1:1;
				data.movez=0;
				if(S.C.con.state.up)    data.movez =-1;
				if(S.C.con.state.down)  data.movez =+1;
			},
		},
		data:
		{
			parabola:
			{
			        0:{x:0,y:0}, 1:{x:100,y:-70}, 2:{x:200,y:0}
			},

			step: 14,
			speedz: 3.75,
		},

		dash_normal:
		{
			event:
			{
				'att': function(S)
				{
					if( S.C.dir.cur_name==this.superstate.data.dir) //only when not turned back
						return 'dash_attack';
				},
				'left_pressed': function(S)
				{
					var F = this.superstate.data.dir=='right'? 1:0; //frame 1 is turning back in air
					S.C.set_frame(F,this.name);
				},
				'right_pressed': function(S)
				{
					var F = this.superstate.data.dir=='left'? 1:0;
					S.C.set_frame(F,this.name);
				},
				entry: function(S)
				{
					S.C.set_frame(0,this.name);
					S.C.switch_dir(true);
				},
				late: function(S)
				{
					S.C.set_frame(S.C.ani.dash_normal.I,'dash_normal_late');
				},
			},
		},

		dash_attack:
		{
			event:
			{
				entry: function(S)
				{
					S.C.set_frame(0,this.name);
					S.C.switch_dir(false);
					S.C.next('punch',this.data.punch_time);
				},
				'punch': function(S)
				{
					S.C.next_frame(this.name);
				},
				exit: function(S)
				{
					S.C.dec.seq.push('_');
					S.C.switch_dir(true);
				},
			},
			data:
			{
				punch_time: 4,
			},
		},
	},

	punch:
	{
		event:
		{
			entry: function(S)
			{
				var data=this.data;
				var type=Math.floor(this.data.max_state*Math.random());
				S.C.set_frame(type * data.frame_per_state, this.name);
				S.C.next('punch',data.wait);
			},
			'punch': function(S)
			{
				var data=this.data;
				S.C.next_frame(this.name);
				S.C.move(this);
				S.C.next('punch_end',data.last);
			},
			'punch_end':'standing',
		},
		data:
		{
			max_state: 2, //includes left and right punch
			frame_per_state: 2, //always 2
			wait: 2, //time before making a punch
			last: 4, //time a punch lasts
			dvx: 3,
		},
	},

	run_attack:
	{
		event:
		{
			entry: function(S)
			{
				S.C.set_frame(0,this.name);
				S.C.next('punch',this.data.wait);
			},
			'punch': function(S)
			{
				S.C.set_frame(1,this.name);
				S.C.next('finish',this.data.last);
			},
			'finish': function(S)
			{
				S.C.set_frame(2,this.name);
				S.C.next('end',this.data.finish);
			},
			'end': 'standing',
			exit: function(S)
			{
				S.C.dec.seq.push('_');
				S.C.switch_dir(true);
			},
			'30fps': function(S)
			{
				S.C.move(this);
			},
		},
		data:
		{
			wait: 6,
			last: 4,
			finish: 4,  //the finishing moment of the punch
			dvx: 1,
		},
	}
}

var L=80; //width, height of a frame

var sp_con= //sprite config
{
	canvas: document.getElementById('canvas'),
	wh: {x:L,y:L},
	img:
	{
		'l':'bandit_l.png',
		'r':'bandit_r.png',
	}
}

var ani_con= //animator set config
{
	base:
	{
		w:L, h:L,    //width, height of a frame
		tar:null,    //target F.sprite, object not exist yet, specify later
	},

	standing:
	{
		x:0,  y:0,   //top left margin of the frames
		gx:4, gy:1,  //define a gx*gy grid of frames
	},
	walking:
	{
		x:L*4,y:0,   //top left margin of the frames
		gx:4, gy:1,  //define a gx*gy grid of frames
		ani:         //animation sequence.
		   [0,1,2,3,2,1]//custom frame sequence (count from 0)
	},
	running:
	{
		x:0,  y:L*2,
		gx:3, gy:1,
		ani: [0,1,2,1]
	},
	stop_running:
	{
		x:L*4, y:L*11,
		gx:1,  gy:1
	},
	run_attack:
	{
		x:L*2, y:L*10,
		gx:3,  gy:1
	},
	jump_normal:
	{
		x:L*2, y:L*6,
		gx:1,  gy:1
	},
	start_jumping:
	{
		x:L*0, y:L*6,
		gx:2,  gy:1
	},
	stop_jumping:
	{
		x:L*0, y:L*6,
		gx:2,  gy:1
	},
	jump_attack:
	{
		x:L*4, y:L*1,
		gx:2,  gy:1
	},
	rowing:
	{
		x:L*8, y:L*4,
		gx:2,  gy:2,
		ani: [3,2,1]
	},
	dash_normal:
	{
		x:L*3, y:L*6,
		gx:2,  gy:1
	},
	dash_normal_late:
	{
		x:L*2, y:L*11,
		gx:2,  gy:1
	},
	dash_attack:
	{
		x:L*6, y:L*10,
		gx:2,  gy:1
	},
	punch:
	{
		x:0,   y:L,
		gx:4,  gy:1
	},
	heavy_obj_walk:
	{
		x:L*3,y:L*2,
		gx:4,gy:1,
		ani: [0,1,2,3,2,1]
	},
	heavy_obj_run:
	{
		x:L*5,y:L*12,
		gx:3,gy:1
	},
	normal_weapon_atck:
	{
		x:L*0,y:L*7,
		gx:8,gy:1
	},
	jump_weapon_atck:
	{
		x:L*0,y:L*8,
		gx:4,gy:1
	},
	run_weapon_atck:
	{
		x:L*4,y:L*8,
		gx:3,gy:1
	},
	light_weapon_thw:
	{
		x:L*4,y:L*9,
		gx:3,gy:1
	},
	heavy_weapon_thw:
	{
		x:L*7,y:L*2,
		gx:2,gy:1
	},
	sky_lgt_wp_thw: //sky light weapon throw
	{
		x:L*7,y:L*9,
		gx:3,gy:1
	},
	weapon_drink:
	{
		x:L*2,y:L*13,
		gx:3,gy:1,
		ani: [0,1,2,1]
	},
	super_punch:
	{
		x:L*2, y:L*10,
		gx:3,  gy:1
	},
	back_row:
	{
		x:L*5,y:L*6,
		gx:2,gy:1
	},
	forward_row:
	{
		x:L*6,y:L*11,
		gx:3,gy:1
	},
	defend:
	{
		x:L*6,y:L*5,
		gx:2,gy:1
	},
	broken_defend:
	{
		x:L*6,y:L*4,
		gx:3,gy:1
	},
	picking_light:
	{
		x:L*6,y:L*3,
		gx:1,gy:1
	},
	picking_heavy:
	{
		x:L*6,y:L*3,
		gx:1,gy:1
	},
	catching:
	{
		x:L*0,y:L*5,
		gx:2,gy:1
	},
	catch_attack:
	{
		x:L*1,y:L*5,
		gx:2,gy:1
	},
	caught:
	{
		x:L*3,y:L*5,
		gx:3,gy:1
	},
	backward_fall:
	{
		x:L*0,y:L*3,
		gx:6,gy:1
	},
	forward_fall:
	{
		x:L*0,y:L*4,
		gx:6,gy:1
	},
	ice:
	{
		x:L*5,y:L*10,
		gx:1,gy:2
	},
	fire:
	{
		x:L*0,y:L*10,
		gx:2,gy:2
	},
	pain1:
	{
		x:L*0,y:L*12,
		gx:3,gy:1
	},
	pain2:
	{
		x:L*3,y:L*12,
		gx:2,gy:1
	},
	pain3:
	{
		x:L*0,y:L*13,
		gx:2,gy:1
	}
}

var combo_con = [
	{ name:'run', seq:['right','right']},
	{ name:'run', seq:['left','left']},
];

//set up controller-------------
var control_con =
{
	up:'i',down:'k',left:'j',right:'l',def:'h',jump:'y',att:'t'
}
var control = new Fcontroller(control_con);

var control_con1 =
{
	up:'f',down:'v',left:'c',right:'b',def:'x',jump:'s',att:'a'
}
var control1 = new Fcontroller(control_con1);

//set up a character------------
var cha_con =
{
	sp: sp_con,
	ani: ani_con,
	state: state_con,
	con: control,
	combo: combo_con
}
var character = new Character(cha_con);

var cha_con1 =
{
	sp: sp_con,
	ani: ani_con,
	state: state_con,
	con: control1, //all config are the same except the controller
	combo: combo_con
}
var character1 = new Character(cha_con1);

//---run time-------------------
var timer4 = setInterval(frame4,1000/4);
function frame4()
{
	character.frame('4fps');
	character1.frame('4fps');
}
var timer8 = setInterval(frame8,1000/8);
function frame8()
{
	character.frame('8fps');
	character1.frame('8fps');
}
var timer10 = setInterval(frame10,1000/10);
function frame10()
{
	character.frame('10fps');
	character1.frame('10fps');
}
var timer30 = setInterval(frame30,1000/31);
function frame30()
{
	character.frame('30fps');
	character1.frame('30fps');
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

//---methods-for-state-editor-------
//   must have these functions for use in the state editor
function execute(text)
{
	eval(text);
}
function pause()
{
	clearInterval(timer4);
	clearInterval(timer8);
	clearInterval(timer10);
	clearInterval(timer30);
}
function resume()
{
	timer4 = setInterval(frame4,1000/4);
	timer8 = setInterval(frame8,1000/8);
	timer10 = setInterval(frame10,1000/10);
	timer30 = setInterval(frame30,1000/31);
}
edit_controller= //global variable
{
	pause: pause,
	resume: resume,
	execute: execute,
};

if( typeof loaded_callback=='function')
	loaded_callback();
//---
};
