/**	a LF2 character
	config=
	{
		controller,
		match,
		stage,
		scene,
		effects,
		team
	}
 */
/*
milestone reference:
http://home.i-cable.com/starskywong/en_progress1.html
 */

define(['LF/global','LF/sprite','LF/mechanics','core/util','core/combodec','core/states'],
function ( Global, Sprite, Mech, Futil, Fcombodec, Fstates)
{

function character (config,dat,thisID)
{
	this.type='character';
	/*DC*/this.name=dat.bmp.name;
	/*DC*/this.uid=-1; //unique id, set by scene
	/*DC*/this.id=thisID; //character id, specify tactical behavior. accept values from 0~99
	/*DC*/this.team=config.team;
	config.scene.add(this);

	var This=this;
	var GC=Global.gameplay;
	var scene = config.scene;
	var match = config.match;

	//---internal state machines------------------------------------
{
	function frame_transistor()
	{
		/*DC*/
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
					frame.PN=frame.N;
					frame.N=next;
						var tar=states[frame.D.state];
						if( tar) tar('frame_exit');

					//state transition
					var is_trans = frame.D.state !== dat.frame[next].state;
					if( is_trans)
					{
						var tar1=states[frame.D.state];
						if( tar1) tar1('state_exit');
					}

					frame.D=dat.frame[next];

					if( is_trans)
					{
						var old_switch_dir=switch_dir;
						switch_dir=states_switch_dir[frame.D.state];

						var tar2=states[frame.D.state];
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
		if( ps.dir==='left' && e==='right')
		{
			ps.dir='right';
			sp.switch_lr('right');
		}
		else if( ps.dir==='right' && e==='left')
		{
			ps.dir='left';
			sp.switch_lr('left');
		}
	}

	function dirh()
	{
		return (ps.dir==='left'?-1:1);
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
					if( IDprop(effect.id,'oscillate'))
					{
						if( effect.i===1)
							effect.i=-1;
						else
							effect.i=1;
						sp.set_xy({x:ps.sx + IDprop(effect.id,'oscillate')*effect.i, y:ps.sy+ps.sz});
					}
				},
				'entry': function()
				{	/*DC*/
					if( IDprop(effect.id,'cant_move'))
						frame.mobility=0;
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
					sp.set_xy({x:ps.sx, y:ps.sy+ps.sz});
					S.event_delay('dvxyz',1,'TU');
				},
				'dvxyz': function()
				{	/*DC*/
					ps.vx += effect.dvx;
					ps.vy += effect.dvy;
				},
				'new': 'active'
			}
		}
	}
}

	//---states-----------------------------------------------------
{
	/*DC*/var sp = new Sprite(dat.bmp, config.stage);

	/*DC*/var health=
	{
		hp: 100,
		mp: 100,
		bdefend: 0,
		fall: 0
	};

	/*DC*/var frame=
	{
		PN: 0, //previous frame number
		N: 0, //current frame number
		D: dat.frame[0], //current frame's data object
		mobility: 1
	};

	//the mechanics backend
	var mech = new Mech(this.id,frame,sp);
	/*DC*/var ps = mech.create_metric(); //position, velocity, and other physical properties

	/*DC*/var trans = new frame_transistor();

	/*DC*/var itr=
	{
		arest: 0,
		vrest: [], //a history of what have been hit by me recently
		lasthit: -100 //time when last being hit
	};

	/*DC*/var catching= 0; //state 9: the object being caught by me now
				//OR state 10: the object catching me now
	/*DC*/var hold=
	{
		obj: null, //the weapon being held by me
		 id: 0 //id of holding
	};

	/*DC*/var effect=
	{
		i: 0, //iteration variable
		state: new Fstates(effect_state_config),
		dvx: 0, dvy: 0,
		id: 0,
		M: config.effects
	};

	//direction switcher
	/*DC*/var switch_dir=true;

	//controller
	/*DC*/var con = config.controller;

	//combo detector config
	var dec_con =
	{
		timeout: Global.detector_config.timeout,
		comboout: Global.detector_config.comboout,
		no_repeat_key: Global.detector_config.no_repeat_key,
		callback: combo_event //callback function when combo detected
	}
	/*DC*/var combodec = new Fcombodec(con, dec_con, Global.combo_list);
}

	//---the processing pipeline------------------------------------

	function combo_event(kobj)
	{
		var K=kobj.name;
		//combo event
		var tar=states[frame.D.state];
		if( tar) tar('combo',K);

		if( K=='left' || K=='right')
			if( switch_dir)
				switch_dir_fun(K);
	}

	function frame_update() //generic update done at every frame
	{
		//show frame
		sp.show_pic(frame.D.pic);

		//velocity
		frame.mobility=1;
		ps.vx+= dirh() * frame.D.dvx;
		ps.vz+= dirv() * frame.D.dvz;
		ps.vy+= frame.D.dvy;

		//wait for next frame
		trans.set_wait(frame.D.wait,99);
		trans.set_next(frame.D.next,99);

		//state specific update
		var tar=states[frame.D.state];
		if( tar) tar('frame');
	}

	function state_update() //generic update done at every TU (30fps)
	{
		//state specific actions
		var tar=states[frame.D.state];
		if( tar) tar('TU'); //a TU event

		interaction();

		//dynamics: position, friction, gravity
		mech.dynamics(); //any further change in position will not be updated on screen until next TU
		wpoint(); //my holding weapon following my change

		if( ps.y===0 && ps.vy>0) //fell onto ground
		{
			ps.vy=0; //set to zero
			ps.vx *= GC.friction.fell.factor;
			ps.vz *= GC.friction.fell.factor;
		}
		else if( ps.y+ps.vy>=0 && ps.vy>0) //predict falling onto the ground
		{
			var tar=states[frame.D.state]; //state specific processing
			if( tar) var result=tar('fall_onto_ground');

			if( result !== undefined && result !== null)
				trans.frame(result, 15);
			else
			{
				switch (frame.N)
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
		itr.lasthit--;
		if( itr.lasthit<-3)
		{
			if( health.fall>0 && health.fall<10) health.fall=0;
			if( health.fall>0) health.fall += GC.recover.fall;
			if( health.bdefend>0) health.bdefend += GC.recover.bdefend;
		}

		//attack rest
		for( var I in itr.vrest)
		{	//watch out that itr.vrest might grow very big
			if( itr.vrest[I] > 0)
				itr.vrest[I]--;
		}
		if( itr.arest > 0)
			itr.arest--;
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
					if( hold.obj)
					{
						var dx = 0;
						if( con.state.left)  dx-= 1;
						if( con.state.right) dx+= 1;

						if( IDprop(hold.id,'just_throw'))
						{
							trans.frame(45, 10); //throw weapon
							return ;
						}
						else if ( dx && IDprop(hold.id,'stand_throw'))
						{
							trans.frame(45, 10); //throw weapon
							return ;
						}
						else if( IDprop(hold.id,'attackable')) //light weapon attack
						{
							trans.frame(match.random()<0.5? 20:25, 10);
							return ;
						}
					}
					//
					var vol=mech.volume(dat.frame[72].itr); //super punch, frame 72
					if( vol.zwidth===0) vol.zwidth = GC.default.itr.zwidth;
					var hit= scene.query(vol, This, {itr:6, not_team:This.team});
					for( var t in hit)
					{	//if someone is in my hitting scoope who has itr kind:6
						trans.frame(70, 10); //I 'll use super punch!
						var vrest=hit[t].itr().vrest;
						if( vrest)
						{
							if( vrest===1)
								; //do nothing
							else
								itr.vrest[ hit[t].uid ] = vrest;
						}
						return;
					}
					//
					trans.frame(match.random()<0.5? 60:65, 10);
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
					if(K!=ps.dir)
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
					if( hold.obj) //light weapon attack
					{
						var dx = 0;
						if( con.state.left)  dx-= 1;
						if( con.state.right) dx+= 1;
						if( dx && IDprop(hold.id,'run_throw'))
						{
							trans.frame(45, 10); //throw weapon
							return ;
						}
						else if( IDprop(hold.id,'attackable'))
						{
							trans.frame(35, 10);
							return ;
						}
					}
					trans.frame(85, 10);
				break;
				}
			break;
		}},

		'3':function(event,K) //punch, jump_attack, run_attack, ...
		{ switch (event) {
			case 'frame':
				if( frame.N===81 || frame.N===33) //jump_attack or jump_weapon_atck
					trans.set_next(212); //back to jump
			break;
		}},

		'4':function(event,K) //jump
		{ switch (event) {
			case 'frame':
				if( frame.N===212 && frame.PN===211)
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
				if( frame.N===212) //is jumping
				{
					if( con.state.att)
					{
						if( hold.obj)
						{
							var dx = 0;
							if( con.state.left)  dx-= 1;
							if( con.state.right) dx+= 1;
							if( dx && IDprop(hold.id,'jump_throw'))
								trans.frame(52, 10); //sky light weapon throw
							else if( IDprop(hold.id,'attackable'))
								trans.frame(30, 10); //light weapon attack
						}
						else
							trans.frame(80, 10); //jump attack
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
						if( hold.obj && IDprop(hold.id,'attackable')) //light weapon attack
							trans.frame(40, 10);
						else
							trans.frame(90, 10);
						switch_dir=false;
					}
				}
				if( K==='left' || K==='right')
				{
					if( K!=ps.dir)
					{
						if( dirh()==(ps.vx>0?1:-1))
						{//turn back
							if( frame.N===213) trans.frame(214, 0);
							if( frame.N===216) trans.frame(217, 0);
						}
						else
						{//turn to front
							if( frame.N===214) trans.frame(213, 0);
							if( frame.N===217) trans.frame(216, 0);
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
				frame.mobility=0.2;
				if( frame.N===111) trans.inc_wait(4);
			break;
		}},

		'8':function(event,K) //broken defend
		{ switch (event) {
			case 'frame':
				frame.mobility=0.1;
				if( frame.N===112) trans.inc_wait(4);
			break;
		}},

		'9':function(event,K) //catching, throw lying man
		{ switch (event) {

			case 'state_exit':
				catching=0;
				ps.zz=0;
			break;

			case 'frame':
				/*DC*/states['9'].frameTU=true;
				catching.caught.b(mech.make_point(frame.D.cpoint),
						frame.D.cpoint,ps.dir);
			break;

			case 'TU':
			if( This.caught.cpointkind()===1 &&
				catching.caught.cpointkind()===2 )
			{	//really catching you
				if( states['9'].frameTU)
				{	states['9'].frameTU=false;
					//the immediate `TU` after `frame`. the reason for this is a synchronization issue

					//injury
					if( frame.D.cpoint.injury)
					{
						catching.hit(frame.D.cpoint,This,{x:ps.x,y:ps.y,z:ps.z});
						trans.inc_wait(1, 10, 99);
					}
					//cover
					var cover = GC.default.cpoint.cover;
					if( frame.D.cpoint.cover) cover=frame.D.cpoint.cover;
					if( cover===0 || cover===10 )
						ps.zz=1;
					else
						ps.zz=-1;

					if( frame.D.cpoint.dircontrol===1)
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
			if( frame.N===121)
			switch(K)
			{
				case 'att':
					var dx = 0;
					if( con.state.left)  dx-= 1;
					if( con.state.right) dx+= 1;
					if( dx && frame.D.cpoint.taction)
					{
						var tac = frame.D.cpoint.taction;
						if( tac<0)
						{	//turn myself around
							switch_dir_fun(ps.dir==='right'?'left':'right'); //toogle dir
							trans.frame(-tac, 10);
						}
						else
						{
							trans.frame(tac, 10);
						}
						var nextframe=dat.frame[trans.next()];
						catching.caught.throw(nextframe.cpoint, dirv());
					}
					else if(frame.D.cpoint.aaction)
						trans.frame(frame.D.cpoint.aaction, 10);
					else
						trans.frame(122, 10);
				break;
				case 'jump':
					if(frame.D.cpoint.jaction)
						trans.frame(frame.D.cpoint.jaction, 10);
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
				/*DC*/states['10'].frameTU=true;
				trans.set_wait(99, 10, 99);
				frame.mobility=0; //never moves
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

						if( cpoint.throwvz !== GC.unspecified)
						{	//I am being thrown!
							var dvx=cpoint.throwvx, dvy=cpoint.throwvy, dvz=cpoint.throwvz;
							if( dvx !==0) ps.vx = (adir==='right'?1:-1)* dvx;
							if( dvy !==0) ps.vy = dvy;
							if( dvz !==0) ps.vz = dvz * This.caught.throwz;

							//impulse
							mech.set_pos(
								ps.x + ps.vx*2.5,
								ps.y + ps.vy*2,
								ps.z + ps.vz );
						}
						else
						{
							if( cpoint.dircontrol===undefined)
							{
								if( cpoint.cover && cpoint.cover>=10)
									switch_dir_fun(adir); //follow dir of catcher
								else //default cpoint cover
									switch_dir_fun(adir==='left'?'right':'left'); //face the catcher

								mech.coincideXZ(holdpoint,mech.make_point(frame.D.cpoint));
							}
							else
							{
								mech.coincideXY(holdpoint,mech.make_point(frame.D.cpoint));
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
				switch(frame.N)
				{
					case 220: case 222: case 224: case 226:
						trans.inc_wait(2, 20, 99);
						frame.mobility=0; //cannot move
					break;
				}
			break;
		}},

		'12':function(event,K) //falling
		{ switch (event) {
			case 'frame':
				switch (frame.N)
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
				if( ps.vx*ps.vx + ps.vy*ps.vy > GC.bounceup.limit)
				{
					ps.vy *= GC.bounceup.factor.y;
					ps.vx *= GC.bounceup.factor.x;
					ps.vz *= GC.bounceup.factor.z;
					if( 180 <= frame.N && frame.N <= 185)
						return 185;
					if( 186 <= frame.N && frame.N <= 191)
						return 191;
				}
				else
				{
					if( 180 <= frame.N && frame.N <= 185)
						return 230; //next frame
					if( 186 <= frame.N && frame.N <= 191)
						return 231;
				}
				if( This.caught.throwinjury !==0)
				{
					health.hp -= This.caught.throwinjury;
					This.caught.throwinjur = 0;
				}
			break;
		}},

		'14':function(event,K) //lying
		{ switch (event) {
			case 'state_entry':
				health.fall=0;
				health.bdefend=0;
			break;
		}},

		'15':function(event,K) //stop_running, crouch, crouch2, dash_attack
		{ switch (event) {

			case 'combo':
				if( frame.N===215) //only after jumping
				{
					if( K==='def')
					{
						trans.frame(102, 10);
					}
					if( K==='jump')
					{
						var dx = 0;
						if( con.state.left)  dx-= 1;
						if( con.state.right) dx+= 1;
						if( dx)
						{
							trans.frame(213, 10);
							switch_dir_fun(dx===1?'right':'left');
						}
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
		var ITR_LIST=Futil.make_array(frame.D.itr);

		/*TODO: */
		/*某葉: 基本上會以先填入的itr為優先， 但在範圍重複、同effect的情況下的2組itr，
			攻擊時，會隨機指定其中一個itr的效果。
			（在範圍有部份重複或是完全重複的部份才有隨機效果。）*/

		for( var i in ITR_LIST)
		{
			var ITR=ITR_LIST[i]; //the itr tag in data
			//first check for what I have got into intersect with
			var vol=mech.volume(ITR);
			if( vol.zwidth===0) vol.zwidth = GC.default.itr.zwidth;
			var hit= scene.query(vol, This, {body:0});

			switch (ITR.kind)
			{
			case 0: //normal attack
				for( var t in hit)
				{
					if( hit[t].team !== This.team) //only attack other teams
					if( update_rest(hit[t].uid)) //important! this must be the last if clause
					{
						if( hit[t].hit(ITR,This,{x:ps.x,y:ps.y,z:ps.z}))
						{	//hit you!

							//stalls
							if( frame.N===72)
								trans.inc_wait(4, 10);
							else
								trans.inc_wait(GC.default.itr.hit_stall, 10);

							//attack one enemy only
							if( ITR.arest) break;
						}
					}
				}
			break;

			case 1: //catch
				for( var t in hit)
				{
					if( hit[t].team !== This.team) //only attack other teams
					if( hit[t].type==='character') //only catch characters
					if( hit[t].cur_state()===16) //you are in dance of pain!
					if( update_rest(hit[t].uid)) //important! to be the last
					{
						var dir = hit[t].caught.a(ITR,This,{x:ps.x,y:ps.y,z:ps.z});
						if( dir==='front')
							trans.frame(ITR.catchingact[0], 10);
						else
							trans.frame(ITR.catchingact[1], 10);
						catching=hit[t];
						break;
					}
				}
			break;

			case 2: //pick weapon
				for( var t in hit)
				{
					if( hit[t].type==='lightweapon')
					if( hit[t].pick(This))
					{
						update_rest(hit[t].uid);
						trans.frame(115, 10);
						hold.obj = hit[t];
						hold.obj.team = This.team;
						hold.id= hold.obj.id;
						break;
					}
				}
			break;
			}
		}

		function update_rest(uid)
		{
			if( (ITR.vrest && !itr.vrest[ uid ]) ||
			   (!ITR.vrest && itr.arest===0) )
			{
				//rest: cannot interact again for some time
				if( ITR.arest)
					itr.arest=ITR.arest;
				else if( ITR.vrest && ITR.vrest!==1)
					itr.vrest[ uid ] = ITR.vrest;
				else
					itr.arest = GC.default.character.arest;

				return true;
			}
			else
				return false;
		}
	}

	function wpoint()
	{
		if( hold.obj)
		if( frame.D.wpoint)
		{
			var act = hold.obj.act(frame.D.wpoint, mech.make_point(frame.D.wpoint), ps, itr, This);
			if( act.thrown)
			{
				hold.obj=null;
				hold.id=0;
			}
			if( act.hit!==null && act.hit!==undefined)
			{
				//update vrest
				itr.vrest[ act.hit ] = act.rest;
				//stalls
				trans.inc_wait(GC.default.itr.hit_stall, 10);
			}
		}
	}

	function drop_weapon(dvx,dvy)
	{
		if( hold.obj)
		{
			hold.obj.drop(dvx,dvy);
			hold.obj=null;
			hold.id=0;
		}
	}

	function IDprop(id,prop)
	{
		if( Global.id[id])
			return Global.id[id][prop];
		return null;
	}

	//----internal helpers------------------------------------------

	function get_itr(kind)
	{
		var frameD = frame.D;
		var volume = function ()
		{
			return mech.volume;
		}

		if(!frameD.itr)
			return [];

		if( frameD.itr instanceof Array)
		{	//many itr
			var B=[];
			for( var i in frameD.itr)
			{
				if( frameD.itr[i].kind===kind)
				{
					var voll=volume(frameD.itr[i]);
					voll.kind=frameD.itr[i].kind;
					B.push(voll);
				}
			}
			return B;
		}
		else
		{	//1 itr only
			if( frameD.itr.kind===kind)
			{
				var voll=volume(frameD.itr);
				voll.kind=frameD.itr.kind;
				return [voll];
			}
			else
				return [];
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
		combodec.frame();
	}
	this.trans=function()
	{
		trans.trans();
	}
	this.set_pos=function(x,y,z)
	{
		mech.set_pos(x,y,z);
	}
	this.bdy=function()
	{
		return mech.body();
	}

	//---inter living objects protocal------------------------------
	this.cur_state=function()
	{
		return frame.D.state;
	}
	this.dirv=dirv;
	this.dirh=dirh;
	this.itr=get_itr;
	this.hit=function(ITR, att, attps) //I am being hit by attacker `att`!
	{
		var accepthit=false;

		if( frame.D.state===10) //being caught
		{
			if( catching.caught.cpointhurtable())
			{
				itr.lasthit=0; accepthit=true;
				fall();
			}
			if( catching.caught.cpointhurtable()===0 && catching!==att)
			{	//I am unhurtable as defined by catcher,
				//and I am hit by attacker other than catcher
			}
			else
			{
				itr.lasthit=0; accepthit=true;
				health.hp -= Math.abs(ITR.injury);
				if( ITR.injury>0)
				{
					effect.state.event('new');
					effect.state.event_delay('vanish', GC.default.effect.duration, 'TU');
					var tar=(attps.x > ps.x)===(ps.dir==='right') ? frame.D.cpoint.fronthurtact : frame.D.cpoint.backhurtact;
					if( ITR.vaction)
						tar=ITR.vaction;
					trans.frame(tar, 20);
				}
			}
		}
		else if( frame.D.state===14)
		{
			//lying
		}
		else
		{
			itr.lasthit=0; accepthit=true;
			//kind 0 ITR
			//only type 0 effect
			effect.dvx = ITR.dvx ? att.dirh()*ITR.dvx:0;
			effect.dvy = ITR.dvy ? ITR.dvy:0;
			effect.id = ITR.effect ? ITR.effect : GC.default.effect.num;
			effect.id += GC.effect.num_to_id; //important! convert num to id

			if( frame.D.state===7 &&
			    (attps.x > ps.x)===(ps.dir==='right')) //attacked in front
			{
				if( ITR.injury)	health.hp -= GC.defend.injury.factor * ITR.injury;
				if( ITR.bdefend) health.bdefend += ITR.bdefend;
				if( health.bdefend > GC.defend.break)
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
				if( ITR.injury)	health.hp -= ITR.injury; //injury
				health.bdefend = 45; //lose defend ability immediately
				fall();
			}

			//effect
			effect.state.event('new');
			var vanish = GC.default.effect.duration;
			switch( trans.next())
			{
				case 111: vanish=4; break;
				case 112: vanish=5; break;
			}
			effect.state.event_delay('vanish', vanish, 'TU');
			effect.M.create({x:ps.x, y:ps.sy+sp.h/2, z:ps.z}, effect.id, health.fall>0?1:2);

			function fall()
			{
				if( ITR.fall)	health.fall += ITR.fall;
					else	health.fall += GC.default.fall.value;
				var fall=health.fall;
				if ( 0<fall && fall<=20)
					trans.frame(220, 20);
				else if (20<fall && fall<=40 && ps.y<0)
					falldown();
				else if (20<fall && fall<=40)
					trans.frame(match.random()<0.5? 222:224, 20);
				else if (40<fall && fall<=60)
					trans.frame(226, 20);
				else if (GC.fall.KO<fall)
					falldown();
			}

			function falldown()
			{
				health.fall=0;
				if( (attps.x > ps.x)===(ps.dir==='right')) //attacked in front
					trans.frame(180, 20);
				else
					trans.frame(186, 20); //attacked in back

				if( !ITR.dvy) effect.dvy = GC.default.fall.dvy;
				if( IDprop(effect.id,'drop_weapon'))
					drop_weapon(effect.dvx,effect.dvy);
			}
		}
		return accepthit;
	}
	this.caught=
	{
		'a': function(ITR, att, attps)
		{	//this is called when the catcher has an ITR with kind: 1
			if( (attps.x > ps.x)===(ps.dir==='right'))
				trans.frame(ITR.caughtact[0], 20);
			else
				trans.frame(ITR.caughtact[1], 20);
			health.fall=0;
			catching=att;
			drop_weapon();

			return (attps.x > ps.x)===(ps.dir==='right') ? 'front':'back';
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
			return frame.D.cpoint ? frame.D.cpoint.kind:0;
		},
		'cpointhurtable': function()
		{
			if( frame.D.cpoint && frame.D.cpoint.hurtable)
				return frame.D.cpoint.hurtable;
			else
				return GC.default.hurtable;
		},
		'throw': function(cpoint,throwz)
		{	//I am being thrown
			if( cpoint.vaction)
				trans.frame(cpoint.vaction, 20);
			else
				trans.frame(GC.default.throw.frame, 20);
			This.caught.throwinjury=cpoint.throwinjury;
			This.caught.throwz=throwz;
		}
	};
}

return character;
});
