//character in F.LF
/*	config=
	{
		controller,
		scene //F.LF.scene object
	}
 */
/*
milestone reference:
http://home.i-cable.com/starskywong/en_progress1.html
 */

define(['LF/sprite','core/combodec','core/states'],
function ( sprite, Fcombodec, Fstates)
{

function character (config)
{
	//data file
	var dat = bandit;
	this.name=dat.bmp.name;
	this.type='character';
	this.uid; //unique id
	this.id=0; //character id
	var This=this;

	//---states-----------------------------------------------------
	this.hp=100;
	this.mp=100;
	this.bdefend=0;
	this.fall=0;

	//frame
	var framePN=0; //previous frame number
	var frameN=0; //current frame number
	var frame=dat.frame[0]; //current frame object
	var movability=1;

	//itr
	var arest=0;
	var vrest=[]; //a history of what have been hit by me recently
	var lasthit=-100; //time when last being hit
	var catching=0; //state 9: the object being caught by me now
		//OR state 10: the object catching me now

	//---configurations---------------------------------------------
	var log={enable: false};
	if( log.enable)
	{
		log=document.getElementById('log');
	}

	//combo list
	var combo_con = [
		{ name:'left', seq:['left']},
		{ name:'right', seq:['right']},
		{ name:'def', seq:['def']},
		{ name:'jump', seq:['jump']},
		{ name:'att', seq:['att']},
		{ name:'run', seq:['right','right']},
		{ name:'run', seq:['left','left']},
		{ name:'hit_Da', seq:['def','down','att']},
		{ name:'hit_Fa', seq:['def','left','att']},
		{ name:'hit_Fa', seq:['def','right','att']},
		{ name:'hit_Ua', seq:['def','up','att']},
		{ name:'hit_Dj', seq:['def','down','jump']},
		{ name:'hit_Fj', seq:['def','left','jump']},
		{ name:'hit_Fj', seq:['def','right','jump']},
		{ name:'hit_Uj', seq:['def','up','jump']},
		{ name:'hit_ja', seq:['def','jump','att']}
	];
	//combo detector config
	var dec_con =
	{
		rp: {up:99,down:99,left:99,right:99,def:99,jump:99,att:99}, //the same key must repeat no more than X times
		timeout:30, //time to clear buffer (approx. 1s in 30fps)
		comboout:8, //the max time interval(in frames) between keys to make a combo
		callback: combo_event, //callback function when combo detected
		no_repeat_key: true //eliminate repeated key strokes by browser
	}

	//---internal state machines------------------------------------

	function frame_transistor()
	{
		var wait=1; //when wait decreases to zero, a frame transition happens
		var next=999; //next frame
		var lock=0;
		var lockout=1; //when lockout equals 0, the lock will be reset automatically
		//frame transitions are caused differently: going to the next frame, a combo is pressed, being hit, or being burnt
		//  and they can all happen *at the same TU*, to determine which frame to go to,
		//  each cause is given an authority which is used to resolve frame transition conflicts.
		//  lock=0 means unlocked
		//  common authority values:
		//0-9: natural
		//     0: natural
		// 10: move,defend,jump,punch,catching,caught
		// 15: environmental interactions
		// 2x: interactions
		//    20: being punch
		//    25: hit by special attack
		// 3x: strong interactions
		//    30: in effect type 0
		//    35: fire, ice, blast

		this.frame=function(F,au)
		{
			this.set_next(F,au);
			this.set_wait(0,au);
		}

		this.set_wait=function(value,au,out)
		{
			if(!au) au=0; //authority
			if( au===99) au=lock; //au=99 means always has just enough authority
			if(!out) out=1; //lock timeout
			if( au >= lock)
			{
				lock=au;
				lockout=out;
				if( out===99) //out=99 means lock until frame transition
					lockout=wait;
				wait=value;
				if( wait<0) wait=0;
			}
		}

		this.inc_wait=function(inc,au,out) //increase wait by inc amount
		{
			if(!au) au=0;
			if( au===99) au=lock;
			if(!out) out=1;
			if( au >= lock)
			{
				lock=au;
				lockout=out;
				if( out===99)
					lockout=wait;
				wait+=inc;
				if( wait<0) wait=0;
			}
		}

		this.set_next=function(value,au,out)
		{
			if(!au) au=0;
			if( au===99) au=lock;
			if(!out) out=1;
			if( au >= lock)
			{
				lock=au;
				lockout=out;
				if( out===99)
					lockout=wait;
				next=value;
			}
		}

		this.next=function()
		{
			return next;
		}

		this.reset_lock=function(au)
		{
			if(!au) au=0;
			if( au===99) au=lock;
			if( au >= lock)
			{
				lock=0;
			}
		}

		this.trans=function()
		{
			var oldlock=lock;
			lockout--;
			if( lockout===0)
				lock=0; //reset transition lock

			if( wait===0)
			{
				if( next===0)
				{
					//do nothing
				}
				else
				{
					if( next===999)
						next=0;
					framePN=frameN;
					frameN=next;
						var tar=states[frame.state];
						if( tar) tar('frame_exit');

					//state transition
					var is_trans = frame.state !== dat.frame[next].state;
					if( is_trans)
					{
						var tar1=states[frame.state];
						if( tar1) tar1('state_exit');
					}

					frame=dat.frame[next];

					if( is_trans)
					{
						var old_switch_dir=switch_dir;
						switch_dir=states_switch_dir[frame.state];

						var tar2=states[frame.state];
						if( tar2) tar2('state_entry');

						if( switch_dir && !old_switch_dir)
						{
							if(con.state.left) switch_dir_fun('left');
							if(con.state.right) switch_dir_fun('right');
						}
					}

					frame_update();

					if( oldlock===10) //combo
						if( wait>0)
							wait-=1;
				}
			}
			else
				wait--;
		}
	}

	function switch_dir_fun(e)
	{
		if( dir==='left' && e==='right')
		{
			dir='right';
			sp.switch_lr('right');
		}
		else if( dir==='right' && e==='left')
		{
			dir='left';
			sp.switch_lr('left');
		}
	}

	function dirh()
	{
		return (dir==='left'?-1:1);
	}

	function dirv()
	{
		var d=0;
		if( con.state.up)   d-=1;
		if( con.state.down) d+=1;
		return d;
	}

	var effect_state_config=
	{
		event:
		{
			entry: 'vanish'
		},

		active:
		{
			event:
			{
				'TU': function()
				{
					if( effect.effect===0) //mechanical injury
					{
						if( effect.i===1)
							effect.i=-1;
						else
							effect.i=1;
						sp.set_xy({x:ps.x + 4*effect.i, y:ps.y+ps.z}); //defined oscillation amplitude for effect 0
					}
				},
				'entry': function()
				{
					movability=0;
				},
				'vanish': 'vanish'
			}
		},

		vanish:
		{
			event:
			{
				entry: function(S)
				{
					sp.set_xy({x:ps.x, y:ps.y+ps.z});
					S.event_delay('dvxyz',1,'TU');
				},
				'dvxyz': function()
				{
					ps.vx += effect.dvx;
					ps.vy += effect.dvy;
				},
				'new': 'active'
			}
		}
	}

	//---set up-----------------------------------------------------

	//frame transistor
	var trans = new frame_transistor();

	//sprite
	var sp = new sprite(dat.bmp, document.getElementById('stage'));

	//position, velocity, zz is zorder deviation
	var ps = {x:0, y:0, z:0, vx:0, vy:0, vz:0, zz:0};

	//direction switcher
	var dir='right';
	var switch_dir=true;

	//controller
	var con = config.controller;

	//combodec
	var dec = new Fcombodec(con, dec_con, combo_con);

	//scene object
	var scene = config.scene;

	//effect
	var effect=
	{
		i:0,
		state: new Fstates(effect_state_config),
		dvx:0, dvy:0,
		effect:0
	};

	//---the processing pipeline------------------------------------

	function frame_update() //generic update done at every frame
	{
		//show frame
		sp.show_pic(frame.pic);

		//velocity
		movability=1;
		ps.vx+= dirh() * frame.dvx;
		ps.vz+= dirv() * frame.dvz;
		ps.vy+= frame.dvy;

		//wait for next frame
		trans.set_wait(frame.wait,99);
		trans.set_next(frame.next,99);

		//state specific update
		var tar=states[frame.state];
		if( tar) tar('frame');
	}

	function state_update() //generic update done at every TU (30fps)
	{
		//state specific actions
		var tar=states[frame.state];
		if( tar) tar('TU'); //a TU event

		interaction();

		//position
		ps.x += ps.vx *movability;
		ps.z += ps.vz *movability;
		ps.y += ps.vy *movability;

		if( ps.y>0) ps.y=0; //never below the ground
		sp.set_xy({x:ps.x, y:ps.y+ps.z}); //projection onto screen
		sp.set_z(ps.z+ps.zz); //z ordering

		if( ps.y===0) //only on the ground
		{	//friction proportional to speed
			ps.vx *= 0.74; //defined coefficient of friction
			ps.vz *= 0.74;
			if( ps.vx>-1 && ps.vx<1) ps.vx=0; //defined minimum speed
			if( ps.vz>-1 && ps.vz<1) ps.vz=0;
		}

		if( ps.y<0) //gravity
			ps.vy+= 1.7; //defined gravity

		if( ps.y===0 && ps.vy>0)
		{
			ps.vy=0; //set to zero
			ps.vx*=0.34; //defined friction when fell onto ground
			ps.vz*=0.34;
		}
		else if( ps.y+ps.vy>=0 && ps.vy>0) //predict falling onto the ground
		{
			var tar=states[frame.state]; //state specific processing
			if( tar) var result=tar('fall_onto_ground');

			if( result !== undefined && result !== null)
				trans.frame(result, 15);
			else
			{
				switch (frameN)
				{
				case 212: //jumping
					trans.frame(215, 15); //crouch
					break;
				default:
					trans.frame(219, 15); //crouch2
				}
			}
		}

		//recovery
		lasthit--;
		if( lasthit<-3)
		{
			if( This.fall>0 && This.fall<10) This.fall=0;
			if( This.fall>0) This.fall-=1; //default fall recover constant
			if( This.bdefend>0) This.bdefend-=0.5; //default bdefend recover constant
		}

		//attack rest
		for( var I in vrest)
		{
			if( vrest[I] > 0)
				vrest[I]--;
		}
		if( arest > 0)
			arest--;
	}

	var states_switch_dir= //whether to allow switch dir in each state
	{
		'0': true,
		'1': true,
		'2': false,
		'3': false,
		'4': true,
		'5': true,
		'6': false,
		'7': true,
		'8': false,
		'9': false,
		'10':false,
		'11':false,
		'12':false,
		'13':true,
		'14':false,
		'15':false,
		'16':false
	};

	var states= //state specific processing to different events-----
	{
		'0':function(event,K) //standing
		{ switch (event) {
			case 'TU':
				var dx=0, dz=0; //to resolve key conflicts
				if( con.state.up)   dz -=1;
				if( con.state.down) dz +=1;
				if( con.state.left) dx -=1;
				if( con.state.right)dx +=1;
				if( dx || dz)
					trans.frame(5);
			break;

			case 'combo':
				switch(K)
				{
				case 'run':
					trans.frame(9, 10);
				break;
				case 'def':
					trans.frame(110, 10);
				break;
				case 'jump':
					trans.frame(210, 10);
				break;
				case 'att':
					var vol=make_volume(dat.frame[61].itr); //punch, frame 61
					if( vol.zwidth===0) vol.zwidth=12; //default zwidth for itr
					var hit= scene.query(vol,This);
					var to_punch=true;
					for( var t in hit)
					{
						if( hit[t].cur_state()===8 ||
						    hit[t].cur_state()===16
						  )
						{
							trans.frame(70, 10);
							to_punch=false;
							break;
						}
					}
					if( to_punch===true)
						trans.frame(Math.random()<0.5? 60:65, 10);
				break;
				}
			break;
		}},

		'1':function(event,K) //walking
		{ switch (event) {
			case 'TU':
				var dx=0;
				if( con.state.left) dx -=1;
				if( con.state.right)dx +=1;
				if( dx!==0)
					ps.vx=dirh()*(dat.bmp.walking_speed);
				ps.vz=dirv()*(dat.bmp.walking_speedz);
			break;

			case 'frame':
				fu.oscillate(5,8);
				var dx=0, dz=0; //to resolve key conflicts
				if( con.state.up)   dz -=1;
				if( con.state.down) dz +=1;
				if( con.state.left) dx -=1;
				if( con.state.right)dx +=1;
				if( !dx && !dz)
					trans.frame(999); //go back to standing
				trans.set_wait(dat.bmp.walking_frame_rate-1);
			break;

			case 'state_entry':
				trans.set_wait(0);
			break;

			case 'combo':
				//walking same as standing
				states['0'](event,K);
			break;
		}},

		'2':function(event,K) //running
		{ switch (event) {
			case 'TU':
				//to maintain the velocity against friction
				ps.vx= dirh() * dat.bmp.running_speed;
				ps.vz= dirv() * dat.bmp.running_speedz;
			break;

			case 'frame':
				fu.oscillate(9,11);
				trans.set_wait(dat.bmp.running_frame_rate);
			break;

			case 'combo':
				switch(K)
				{
				case 'left': case 'right':
					if(K!=dir)
					{
						trans.frame(218, 10);
					}
					break;
				case 'def':
					trans.frame(102, 10);
					break;
				case 'jump':
					trans.frame(213, 10);
					break;
				case 'att':
					trans.frame(85, 10);
					break;
				}
			break;
		}},

		'3':function(event,K) //punch, jump_attack, run_attack, ...
		{ switch (event) {
			case 'frame':
				if( frameN===81) //jump_attack
					trans.set_next(212); //back to jump
			break;
		}},

		'4':function(event,K) //jump
		{ switch (event) {
			case 'frame':
				if( frameN===212 && framePN===211)
				{	//start jumping
					var dx = 0;
					if( con.state.left)  dx-= 1;
					if( con.state.right) dx+= 1;
					ps.vx= dx * dat.bmp.jump_distance;
					ps.vz= dirv() * dat.bmp.jump_distancez;
					ps.vy= dat.bmp.jump_height; //upward force
				}
			break;

			case 'TU':
				if( frameN===212) //is jumping
				{
					if( con.state.att)
					{
						trans.frame(80, 10);
					}
				}
			break;
		}},

		'5':function(event,K) //dash
		{ switch (event) {
			case 'state_entry':
				ps.vx= dirh() * dat.bmp.dash_distance;
				ps.vz= dirv() * dat.bmp.dash_distancez;
				ps.vy= dat.bmp.dash_height;
			break;

			case 'combo':
				if( K==='att')
				{
					if( dirh()===(ps.vx>0?1:-1)) //only if not turning back
					{
						trans.frame(90, 10);
						switch_dir=false;
					}
				}
				if( K==='left' || K==='right')
				{
					if( K!=dir)
					{
						if( dirh()==(ps.vx>0?1:-1))
						{//turn back
							if( frameN===213) trans.frame(214, 0);
							if( frameN===216) trans.frame(217, 0);
						}
						else
						{//turn to front
							if( frameN===214) trans.frame(213, 0);
							if( frameN===217) trans.frame(216, 0);
						}
					}
				}
			break;
		}},

		'6':function(event,K) //rowing
		{ switch (event) {
		}},

		'7':function(event,K) //defending
		{ switch (event) {
			case 'frame':
				movability=0.2;
				if( frameN===111) trans.inc_wait(4);
			break;
		}},

		'8':function(event,K) //broken defend
		{ switch (event) {
			case 'frame':
				movability=0.1;
				if( frameN===112) trans.inc_wait(4);
			break;
		}},

		'9':function(event,K) //catching, throw lying man
		{ switch (event) {

			case 'state_exit':
				catching=0;
				ps.zz=0;
			break;

			case 'frame':
				states['9'].frameTU=true;
				catching.caught.b(make_point(frame.cpoint),frame.cpoint,dir);
			break;

			case 'TU':
			if( This.caught.cpointkind()===1 &&
				catching.caught.cpointkind()===2 )
			{	//really catching you
				if( states['9'].frameTU)
				{	states['9'].frameTU=false;
					//the immediate `TU` after `frame`. the reason for this is a synchronization issue

					//injury
					if( frame.cpoint.injury)
					{
						catching.hit(frame.cpoint,This,{x:ps.x,y:ps.y,z:ps.z});
						trans.inc_wait(1, 10, 99);
					}
					//cover
					var cover=0; //default cpoint cover
					if( frame.cpoint.cover) cover=frame.cpoint.cover;
					if( cover===0 || cover===10 )
						ps.zz=1;
					else
						ps.zz=-1;

					if( frame.cpoint.dircontrol===1)
					{
						if(con.state.left) switch_dir_fun('left');
						if(con.state.right) switch_dir_fun('right');
					}
				}
			}
			else
			{
				trans.frame(999,10);
			}
			break; //TU

			case 'combo':
			if( frameN===121)
			switch(K)
			{
				case 'att':
					if( (con.state.left||con.state.right) && frame.cpoint.taction)
					{
						var tac = frame.cpoint.taction;
						if( tac<0)
						{	//turn myself around
							switch_dir_fun(dir==='right'?'left':'right'); //toogle dir
							trans.frame(-tac, 10);
						}
						else
						{
							trans.frame(tac, 10);
						}
						var nextframe=dat.frame[trans.next()];
						catching.caught.throw(nextframe.cpoint);
					}
					else if(frame.cpoint.aaction)
						trans.frame(frame.cpoint.aaction, 10);
					else
						trans.frame(122, 10);
				break;
				case 'jump':
					if(frame.cpoint.jaction)
						trans.frame(frame.cpoint.jaction, 10);
				break;
			}
			break;
		}},

		'10':function(event,K) //being caught
		{ switch (event) {

			case 'state_exit':
				catching=0;
			break;

			case 'frame':
				states['10'].frameTU=true;
				trans.set_wait(99, 10, 99);
				movability=0; //never moves
			break;

			case 'TU':
				if( This.caught.cpointkind()===2 &&
				catching.caught.cpointkind()===1 )
				{	//really being caught
					if( states['10'].frameTU)
					{	states['10'].frameTU=false; //the immediate `TU` after `frame`

						var holdpoint=This.caught.b.holdpoint;
						var cpoint=This.caught.b.cpoint;
						var adir=This.caught.b.adir;

						if( cpoint.vaction)
							trans.frame(cpoint.vaction, 20);

						if( cpoint.throwvz !== -842150451)
						{
							var dvx=cpoint.throwvx, dvy=cpoint.throwvy, dvz=cpoint.throwvz;
							if( dvx !==0) ps.vx = (adir==='right'?1:-1)* dvx;
							if( dvy !==0) ps.vy = dvy;
							ps.x += ps.vx*2.5; //impulse
							ps.y += ps.vy*2;
							//if( dvz !==0) ps.vz = dvz;
						}
						else
						{
							if( cpoint.dircontrol===undefined)
							{
								if( cpoint.cover && cpoint.cover>=10)
									switch_dir_fun(adir); //follow dir of catcher
								else //default cover
									switch_dir_fun(adir==='left'?'right':'left'); //face the catcher

								coincideXZ(holdpoint,make_point(frame.cpoint));
							}
							else
							{
								coincideXY(holdpoint,make_point(frame.cpoint));
							}
						}
					}
				}
				else
				{
					trans.frame(212, 10);
				}
			break;
		}},

		'11':function(event,K) //injured
		{ switch (event) {
			case 'state_entry':
				trans.inc_wait(0, 20); //set lock only
			break;
			case 'frame':
				switch(frameN)
				{
					case 220: case 222: case 224: case 226:
						trans.inc_wait(2, 20, 99);
						movability=0; //cannot move
					break;
				}
			break;
		}},

		'12':function(event,K) //falling
		{ switch (event) {
			case 'frame':
				switch (frameN)
				{
					case 180:
						trans.set_next(181);
						break;
					case 181:
						trans.set_next(182);
						break;
					case 182:
						trans.set_next(183);
						break;
					//
					case 186:
						trans.set_next(187);
						break;
					case 187:
						trans.set_next(188);
						break;
					case 188:
						trans.set_next(189);
						break;
				}
			break;

			case 'fall_onto_ground':
				if( ps.vx*ps.vx + ps.vy*ps.vy > 200) //defined square of speed to bounce up again
				{
					ps.vy *= -0.4; //defined bounce up coefficient
					ps.vx *= 0.6;
					ps.vz *= 0.6;
					if( 180 <= frameN && frameN <= 185)
						return 185;
					if( 186 <= frameN && frameN <= 191)
						return 191;
				}
				else
				{
					if( 180 <= frameN && frameN <= 185)
						return 230; //next frame
					if( 186 <= frameN && frameN <= 191)
						return 231;
				}
				if( This.caught.throwinjury !==0)
				{
					This.health -= This.caught.throwinjury;
					This.caught.throwinjur = 0;
				}
			break;
		}},

		'14':function(event,K) //lying
		{ switch (event) {
			case 'state_entry':
				This.fall=0;
				This.bdefend=0;
			break;
		}},

		'15':function(event,K) //stop_running, crouch, crouch2, dash_attack
		{ switch (event) {

			case 'combo':
				if( frameN===215) //only after jumping
				{
					if( K==='def')
					{
						trans.frame(102, 10);
					}
					if( K==='jump')
					{
						if( con.state.left || con.state.right)
							trans.frame(213, 10);
						else
						{
							trans.inc_wait(2, 10, 99);
							trans.set_next(210, 10);
						}
					}
				}
			break;
		}},

		'16':function(event,K) //injured 2 (dance of pain)
		{ switch (event) {
		}},

		'x':function(event,K)
		{ switch (event) {
		}}
	}

	var fu= //frame related functions
	{
		da:{}, //data area
		oscillate:function(a,b) //oscillate between frame a and b
		{
			if( typeof fu.da.i==='undefined' || fu.da.i<a || fu.da.i>b)
			{
				fu.da.up=true;
				fu.da.i=a+1;
			}
			if( fu.da.i<b && fu.da.up)
				trans.set_next(fu.da.i++);
			else if( fu.da.i>a && !fu.da.up)
				trans.set_next(fu.da.i--);
			if( fu.da.i==b) fu.da.up=false;
			if( fu.da.i==a) fu.da.up=true;
		}
	}

	function interaction() //generic processing of frame interactions
	{
		if( frame.itr)
		{
			if( frame.itr instanceof Array)
				var ITR=frame.itr;
			else
				var ITR=[frame.itr];
		}
		else
			var ITR=[];

		/*某葉: 基本上會以先填入的itr為優先， 但在範圍重複、同effect的情況下的2組itr，
			攻擊時，會隨機指定其中一個itr的效果。
			（在範圍有部份重複或是完全重複的部份才有隨機效果。）*/
		/*TODO: */

		for( var i in ITR)
		{
			var itr=ITR[i];
			//first check for what I have hit
			var vol=make_volume(itr);
			if( vol.zwidth===0) vol.zwidth=12; //default zwidth for itr
			var hit= scene.query(vol,This);

			switch (itr.kind)
			{
			case 0: //normal attack
				for( var t in hit)
				{
					if( (itr.vrest && !vrest[ hit[t].uid ]) ||
					   (!itr.vrest && arest===0) )
					{
						hit[t].hit(itr,This,{x:ps.x,y:ps.y,z:ps.z}); //hit you!

						//rest: cannot attack you again for some time
						if( itr.arest)
							arest=itr.arest;
						else if( itr.vrest)
							vrest[ hit[t].uid ] = itr.vrest;
						else
							arest=7;

						if( frameN===61 || frameN===66) //if punch
							trans.inc_wait(3, 10); // stalls for 3 TU
						else if( frameN===72)
							trans.inc_wait(4, 10);

						//attack one enemy only
						if( itr.arest) break;
					}
				}
			break;

			case 1: //catch
				for( var t in hit)
				{
					if( hit[t].cur_state()===16) //you are in dance of pain!
					{
						var dir = hit[t].caught.a(itr,This,{x:ps.x,y:ps.y,z:ps.z});
						if( dir==='front')
							trans.frame(itr.catchingact[0], 10);
						else
							trans.frame(itr.catchingact[1], 10);
						catching=hit[t];
						break;
					}
				}
			break;

			}
		}
	}

	function combo_event(kobj)
	{
		var K=kobj.name;
		//combo event
		var tar=states[frame.state];
		if( tar) tar('combo',K);

		if( K=='left' || K=='right')
			if( switch_dir)
				switch_dir_fun(K);
	}

	function make_point(a)
	{
		if( a)
		{
			if( dir==='right')
				return {x:ps.x+a.x, y:ps.y+a.y, z:ps.z+a.y};
			else
				return {x:ps.x+sp.w-a.x, y:ps.y+a.y, z:ps.z+a.y};
		}
		else
		{
			alert('make point failed for frame '+frameN);
			return {x:ps.x, z:ps.z};
		}
	}

	function make_volume(O)
	{
		if( !O)
			return {
				x:ps.x, y:ps.y, z:ps.z,
				vx:0, vy:0, w:0, h:0, zwidth:0
			};

		var vx=O.x;
		if( dir==='left')
			vx=sp.w-O.x-O.w;

		return {x:ps.x, y:ps.y, z:ps.z,
			vx: vx,
			vy: O.y,
			w : O.w,
			h : O.h,
			zwidth: O.zwidth? O.zwidth:0
		};
	}

	function coincideXZ(a,b)
	{	//move myself *along xz* to coincide point a with point b
		//  such that point b is a point of myself
		var vx=a.x-b.x;
		var vz=a.z-b.z;
		ps.x+=vx;
		ps.z+=vz;
	}
	function coincideXY(a,b)
	{	//move myself *along xy* to coincide point a with point b
		//  such that point b is a point of myself
		var vx=a.x-b.x;
		var vy=a.y-b.y;
		ps.x+=vx;
		ps.y+=vy;
	}

	function logg(X)
	{
		if( log.enable)
		{
			log.value+= X;
			if( log.value.length>10000) log.value='';
			log.scrollTop+=20;
		}
	}

	//---external interface-----------------------------------------
	this.TU=function()
	{
		//fetch inputs
		con.fetch();

		//state
		state_update();

		//effect
		effect.state.event('TU');

		//combo detector
		dec.frame();
	}
	this.trans=function()
	{
		trans.trans();
	}
	this.set_pos=function(x,y,z)
	{
		ps.x=x; ps.y=y; ps.z=z;
	}
	this.cur_state=function()
	{
		return frame.state;
	}
	this.dirv=dirv;
	this.dirh=dirh;
	this.bdy=function() //return the array of bdy volume of the current frame
	{
		if( frame.bdy instanceof Array)
		{ //many bdy
			if( frame.bdy.length === 2)
			{ //unroll the loop
				return ([make_volume(frame.bdy[0]),
					make_volume(frame.bdy[1])
				]);
			}
			else if( frame.bdy.length === 3)
			{ //unroll the loop
				return ([make_volume(frame.bdy[0]),
					make_volume(frame.bdy[1]),
					make_volume(frame.bdy[2])
				]);
			}
			else
			{
				var B=[];
				for( var i in frame.bdy)
				{
					B.push( make_volume(frame.bdy[i]) );
				}
				return B;
			}
		}
		else
		{ //1 bdy only
			return ([make_volume(frame.bdy)]);
		}
	}
	this.hit=function(itr, att, attps) //I am being hit by attacker `att`!
	{
		lasthit=0;
		var This=this;

		if( frame.state===10) //being caught
		{
			if( catching.caught.cpointhurtable())
			{
				fall();
			}
			if( catching.caught.cpointhurtable()===0 && catching!==att)
			{	//I am unhurtable as defined by catcher,
				//and I am hit by attacker other than catcher
			}
			else
			{
				This.health -= Math.abs(itr.injury);
				if( itr.injury>0)
				{
					effect.state.event('new');
					effect.state.event_delay('vanish', 3, 'TU'); //default effect lasting duration
					var tar=(attps.x > ps.x)===(dir==='right') ? frame.cpoint.fronthurtact : frame.cpoint.backhurtact;
					if( itr.vaction)
						tar=itr.vaction;
					trans.frame(tar, 20);
				}
			}
		}
		else
		{
			//kind 0 itr
			//only type 0 effect
			effect.dvx = itr.dvx ? att.dirh()*itr.dvx:0;
			effect.dvy = itr.dvy ? itr.dvy:0;
			effect.effect = itr.effect? itr.effect:0; //default effect type

			if( frame.state===7 &&
			    (attps.x > ps.x)===(dir==='right')) //attacked in front
			{
				if( itr.injury)	This.health -= 0.1*itr.injury; //defined defend injury coefficient
				if( itr.bdefend) This.bdefend += itr.bdefend;
				if( This.bdefend>40) //defined defend break
				{
					trans.frame(112, 20);
				}
				else //an effective defence
				{
					trans.frame(111, 20);
				}
			}
			else
			{
				if( itr.injury)	This.health -= itr.injury; //injury
				This.bdefend = 45; //lose defend ability immediately
				fall();
			}

			//effect
			effect.state.event('new');
			var vanish=3; //default effect lasting duration
			switch( trans.next())
			{
				case 111: vanish=4; break;
				case 112: vanish=5; break;
			}
			effect.state.event_delay('vanish', vanish, 'TU');

			function fall()
			{
				if( itr.fall)	This.fall += itr.fall;
					else	This.fall += 20; //default fall
				var fall=This.fall;
				if ( 0<fall && fall<=20)
					trans.frame(220, 20);
				else if (20<fall && fall<=40 && ps.y<0)
					falldown();
				else if (20<fall && fall<=40)
					trans.frame(Math.random()<0.5? 222:224, 20);
				else if (40<fall && fall<=60)
					trans.frame(226, 20);
				else if (60<fall) //defined KO
					falldown();
			}

			function falldown()
			{
				This.fall=0;
				if( (attps.x > ps.x)===(dir==='right')) //attacked in front
					trans.frame(180, 20);
				else
					trans.frame(186, 20); //attacked in back

				if( !itr.dvy) effect.dvy = -6.9; //default dvy when falling
			}
		}
	}
	this.caught=
	{
		'a': function(itr, att, attps)
		{	//this is called when the catcher has an itr with kind: 1
			if( (attps.x > ps.x)===(dir==='right'))
				trans.frame(itr.caughtact[0], 20);
			else
				trans.frame(itr.caughtact[1], 20);
			This.fall=0;
			catching=att;

			return (attps.x > ps.x)===(dir==='right') ? 'front':'back';
		},
		'b': function(holdpoint,cpoint,adir)
		{	//this is called when the catcher has a cpoint with kind: 1
			This.caught.b.holdpoint=holdpoint;
			This.caught.b.cpoint=cpoint;
			This.caught.b.adir=adir;
			//store this info and process it at TU
		},
		'cpointkind': function()
		{
			return frame.cpoint ? frame.cpoint.kind:0;
		},
		'cpointhurtable': function()
		{
			if( frame.cpoint && frame.cpoint.hurtable)
				return frame.cpoint.hurtable;
			else
				return 0; //default hurtable
		},
		'throw': function(cpoint)
		{	//I am being thrown
			if( cpoint.vaction)
				trans.frame(cpoint.vaction, 20);
			else
				trans.frame(135, 20); //default frame being thrown
			This.caught.throwinjury=cpoint.throwinjury;
		}
	};
}

return character;
});
