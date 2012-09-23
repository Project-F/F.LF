//character in F.LF
/*	config=
	{
		controller,
		scene //F.LF.scene object
	}
 */
/*
reference:
-milestone
http://home.i-cable.com/starskywong/en_progress1.html
-interaction
http://lf-empire.de/en/lf2-empire/data-changing/frame-elements/174-itr-interaction
-effects
http://www.lf-empire.de/en/lf2-empire/data-changing/reference-pages/181-effects
 */

if( typeof F=='undefined') F=new Object();
if( typeof F.LF=='undefined') F.LF=new Object();
if( typeof F.LF.character=='undefined') //#ifndef
{

F.LF.character = function(config)
{
	//data file
	var dat = bandit;
	this.name=dat.bmp.name;
	this.type='character';
	var This=this;
	
	//---status-----------------------------------------------------
	this.hp=100;
	this.mp=100;
	this.bdefend=0;
	this.fall=0;
	
	//the state variable
	var _wait=1; //when wait decreases to zero, a frame transition happens
	var _next=999; //next frame
	var _lock=0;
	//frame transitions are caused differently: going to the next frame, a combo is pressed, being hit, or being burnt
	//  and they can all happen *at the same TU*, to determine which frame to go to,
	//  each cause is given an authority which is used to resolve frame transition conflicts.
	//  _lock=0 means unlocked
	//  common authority values:
	//0-9: natural
	//     0: natural
	// 1x: combo
	//    10: move,defend,jump,punch
	//    15: special move
	// 2x: interactions
	//    20: being punch
	//    25: hit by special attack
	// 3x: strong interactions
	//    30: environmental
	//    35: fire, ice, blast
	
	//frame
	var framePN=0; //previous frame number
	var frameN=0; //current frame number
	var frame=dat.frame[0]; //current frame object
	
	//itr
	var arest=[]; //a history of what have been hit by me recently
	
	//---configurations---------------------------------------------
	var log={enable: false};
	if( log.enable)
	{
		log=document.getElementById('log');
		log.enable=true;
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
	var switch_dir=true;
	
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
						if( effect.i>=-1 && effect.i<=1)
						{
							sp.set_xy({x:ps.x + 2.5*effect.i, y:ps.y+ps.z}); //defined oscillation amplitude for effect 0
							effect.i++;
							if( effect.i>1)
								effect.i=-1;
						}
						else
							effect.i=-1;
					}
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
	
	//sprite
	var sp = new F.LF.sprite(dat.bmp, document.getElementById('stage'));
	
	//position, velocity
	var ps = this.ps = {x:0, y:0, z:0, vx:0, vy:0, vz:0};
	
	//direction switcher
	var dir='right';
	
	//controller
	var con = config.controller;
	if( log.enable)
		var pri_con = new F.controller({log:'g'});
	
	//combodec
	var dec = new F.combodec(con, dec_con, combo_con);
	
	//scene object
	var scene = config.scene;
	
	//effect
	var effect=
	{
		i:0,
		state: new F.states(effect_state_config),
		dvx:0, dvy:0,
		effect:0
	};
	
	//---the processing pipeline------------------------------------
	
	function frame_update() //generic update done at every frame
	{
		//show frame
		sp.show_pic(frame.pic);
		
		//velocity
		ps.vx+= dirh() * frame.dvx;
		ps.vz+= dirv() * frame.dvz;
		ps.vy+= frame.dvy;
		
		//wait for next frame
		set_wait(frame.wait,0);
		set_next(frame.next,0);
		
		//state specific update
		var tar=states[frame.state];
		if( tar) tar('frame');
	}
	
	function state_update() //generic update done at every TU (30fps)
	{
		//state specific actions
		var tar=states[frame.state];
		if( tar) tar('TU'); //a TU event
		
		//position
		ps.x += ps.vx;
		ps.z += ps.vz;
		ps.y += ps.vy;
		if( ps.y>0) ps.y=0; //never below the ground
		sp.set_xy({x:ps.x, y:ps.y+ps.z}); //projection onto screen
		sp.set_z(ps.z); //z ordering
		
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
				frame_trans(result, 30);
			else
			{
				switch (frameN)
				{
				case 212: //jumping
					frame_trans(215, 30); //crouch
					break;
				default:
					frame_trans(219, 30); //crouch2
				}
			}
		}
		
		//recovery
		if( This.fall>0) This.fall-=0.5; //default fall recover constant
		if( This.bdefend>0) This.bdefend-=1; //default bdefend recover constant
		
		//arest (attack rest)
		for( var I in arest)
		{
			if( arest[I] > 0)
				arest[I]--;
		}
	}
	
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
					frame_trans(5);
			break;
			
			case 'combo':
				switch(K)
				{
				case 'run':
					frame_trans(9, 10);
				break;
				case 'def':
					frame_trans(110, 10);
				break;
				case 'jump':
					frame_trans(210, 10);
				break;
				case 'att':
					var vol=make_volume(dat.frame[61].itr); //punch, frame 61
					if( vol.zwidth===0) vol.zwidth=12; //default zwidth for itr
					var hit= scene.query(vol,This);
					var to_punch=true;
					for( var t in hit)
					{
						if( hit[t].cur_state()===16)
						{
							frame_trans(70, 10);
							to_punch=false;
							break;
						}
					}
					if( to_punch===true)
						frame_trans(Math.random()<0.5? 60:65, 10);
				break;
				}
			break;
		}},
		
		'1':function(event,K) //walking
		{ switch (event) {
			case 'TU':
				if(con.state.up)    ps.z-=dat.bmp.walking_speedz;
				if(con.state.down)  ps.z+=dat.bmp.walking_speedz;
				if(con.state.left)  ps.x-=dat.bmp.walking_speed;
				if(con.state.right) ps.x+=dat.bmp.walking_speed;
				
				var dx=0, dz=0; //to resolve key conflicts
				if( con.state.up)   dz -=1;
				if( con.state.down) dz +=1;
				if( con.state.left) dx -=1;
				if( con.state.right)dx +=1;
				if( !dx && !dz)
					frame_trans(999); //go back to standing
			break;
			
			case 'frame':
				fu.oscillate(5,8);
				set_wait(dat.bmp.walking_frame_rate);
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
				set_wait(dat.bmp.running_frame_rate);
			break;
			
			case 'state_entry':
				switch_dir=false;
			break;
			
			case 'combo':
				switch(K)
				{
				case 'left': case 'right':
					if(K!=dir)
					{
						frame_trans(218, 10);
					}
					break;
				case 'def':
					frame_trans(102, 10);
					break;
				case 'jump':
					frame_trans(213, 10);
					break;
				case 'att':
					frame_trans(85, 10);
					break;
				}
			break;
		}},
		
		'3':function(event,K) //punch, jump_attack, run_attack, ...
		{ switch (event) {
			case 'frame':
				if( frameN===81) //jump_attack
					set_next(212); //back to jump
			break;
			
			case 'TU':
				interaction();
			break;
			
			case 'state_entry':
				switch_dir=false;
			break;
			case 'state_exit':
				switch_dir=true;
				if(con.state.left) switch_dir_fun('left');
				if(con.state.right) switch_dir_fun('right');
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
						frame_trans(80, 10);
					}
				}
			break;
		}},
		
		'5':function(event,K) //dash
		{ switch (event) {
			case 'state_entry':
				switch_dir=true;
				ps.vx= dirh() * dat.bmp.dash_distance;
				ps.vz= dirv() * dat.bmp.dash_distancez;
				ps.vy= dat.bmp.dash_height;
			break;
			
			case 'combo':
				if( K==='att')
				{
					if( dirh()==(ps.vx>0?1:-1)) //only if not turning back
					{
						frame_trans(90, 10);
					}
				}
				if( K==='left' || K==='right')
				{
					if( K!=dir)
					{
						if( dirh()==(ps.vx>0?1:-1))
						{//turn back
							if( frameN===213) frame_trans(214, 0);
							if( frameN===216) frame_trans(217, 0);
						}
						else
						{//turn to front
							if( frameN===214) frame_trans(213, 0);
							if( frameN===217) frame_trans(216, 0);
						}
					}
				}
			break;
		}},
		
		'6':function(event,K) //rowing
		{ switch (event) {
			case 'state_entry':
				switch_dir=false;
			break;
			case 'state_exit':
				switch_dir=true;
			break;
		}},
		
		'7':function(event,K) //defending
		{ switch (event) {
			case 'state_entry':
				switch_dir=false;
			break;
			case 'state_exit':
				switch_dir=true;
			break;
			case 'frame':
				if( frameN===111) set_wait(_wait+4);
			break;
		}},
		
		'8':function(event,K) //broken defend
		{ switch (event) {
			case 'frame':
				if( frameN===112) set_wait(_wait+4);
			break;
		}},
		
		'11':function(event,K) //injured
		{ switch (event) {
			case 'frame':
				switch(frameN)
				{
					case 220: case 222: case 226:
						set_wait(_wait+2);
					break;
				}
			break;
		}},
		
		'12':function(event,K) //falling
		{ switch (event) {
			case 'state_entry':
				switch_dir=false;
			break;
			
			case 'frame':
				switch (frameN)
				{
					case 180:
						set_next(181);
						break;
					case 181:
						set_next(182);
						break;
					case 182:
						set_next(183);
						break;
					//
					case 186:
						set_next(187);
						break;
					case 187:
						set_next(188);
						break;
					case 188:
						set_next(189);
						break;
				}
			break;
			
			case 'fall_onto_ground':
				if( ps.vx*ps.vx + ps.vy*ps.vy > 200) //defined square of speed to bounce up again
				{
					ps.vy *= -0.4; //defined bounce up coefficient
					if( 180 <= frameN && frameN <= 184)
						return 185;
					if( 186 <= frameN && frameN <= 190)
						return 191;
				}
				if( 180 <= frameN && frameN <= 185)
					return 230; //next frame
				if( 186 <= frameN && frameN <= 191)
					return 231;
			break;
			
			case 'combo':
			break;
		}},
		
		'14':function(event,K) //lying
		{ switch (event) {
			case 'state_exit':
				This.fall=0;
				This.bdefend=0;
				switch_dir=true;
			break;
		}},
		
		'15':function(event,K) //stop_running, crouch, crouch2, dash_attack
		{ switch (event) {
			case 'TU':
				interaction();
			break;
			
			case 'combo':
				if( frameN===215) //only after jumping
				{
					if( K==='def')
					{
						frame_trans(102, 10);
					}
					if( K==='jump')
					{
						if( con.state.left || con.state.right)
							frame_trans(213, 10);
						else
						{
							set_wait(_wait+2, 10);
							set_next(210, 10);
						}
					}
				}
			break;
			
			case 'state_entry':
				switch_dir=false;
			break;
			case 'state_exit':
				switch_dir=true; //re-enable switch dir
				if(con.state.left) switch_dir_fun('left');
				if(con.state.right) switch_dir_fun('right');
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
				set_next(fu.da.i++);
			else if( fu.da.i>a && !fu.da.up)
				set_next(fu.da.i--);
			if( fu.da.i==b) fu.da.up=false;
			if( fu.da.i==a) fu.da.up=true;
		}
	}
	
	function interaction() //generic processing of frame interactions
	{
		var itr=frame.itr;
		if( itr)
		if( itr.kind===0)
		{
			var vol=make_volume(itr);
			if( vol.zwidth===0) vol.zwidth=12; //default zwidth for itr
			var hit= scene.query(vol,This);
			for( var t in hit)
			{
				if( !arest[ hit[t].id ])
				{
					hit[t].hit(itr,This); //hit you!
					
					//rest: cannot attack you again for some time
					if( itr.arest) var rest=itr.arest;
					if( itr.vrest) var rest=itr.vrest;
					if( rest===undefined) var rest=7;
					arest[ hit[t].id ] = rest;
					
					if( frameN===61 || frameN===66) //if punch
						set_wait(_wait+3, 10); // stalls for 3 TU
					else if( frameN===72)
						set_wait(_wait+4, 10);
					
					//attack one enemy only //TODO: attack the closest
					//by sorting the hit array according to distance
					if( itr.arest) break;
				}
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
	
	function frame_trans(F,au)
	{
		set_next(F,au);
		set_wait(0,au);
	}
	
	function set_wait(value,au)
	{
		if(!au) au=0; //authority
		if( au >= _lock)
		{
			_lock=au;
			_wait=value;
		}
	}
	
	function set_next(value,au)
	{
		if(!au) au=0; //authority
		if( au >= _lock)
		{
			_lock=au;
			_next=value;
		}
	}
	
	function make_volume(O)
	{
		if( !O)
			return {
				x:ps.x, y:ps.y, z:ps.z,
				vx:0, vy:0, w:0, h:0, zwidth:0
			};
		
		if( dir==='right')
		{
			return {x:ps.x, y:ps.y, z:ps.z,
				vx: O.x,
				vy: O.y,
				w : O.w,
				h : O.h,
				zwidth: O.zwidth? O.zwidth:0
			}
		}
		else
		{
			var vx = sp.w-O.x-O.w;
			return {x:ps.x+vx, y:ps.y, z:ps.z,
				vx: vx,
				vy: O.y,
				w : O.w,
				h : O.h,
				zwidth: O.zwidth? O.zwidth:0
			}
		}
	}

	function logg(X)
	{
		if( log.enable)
		{
			if( pri_con.state.log)
			{
				log.value+= X;
				if( log.value.length>10000) log.value='';
				log.scrollTop+=20;
			}
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
		var oldlock=_lock;
		_lock=0; //reset transition lock
		
		if( _wait===0)
		{
			if( _next===0)
			{
				//do nothing
			}
			else
			{
				if( _next===999)
					_next=0;
				framePN=frameN;
				frameN=_next;
					var tar=states[frame.state];
					if( tar) tar('frame_exit');
				
				if(frame.state !== dat.frame[_next].state)
				{ //state transition
					var tar1=states[frame.state];
					if( tar1) tar1('state_exit');
					var tar2=states[dat.frame[_next].state];
					if( tar2) tar2('state_entry');
				}
				
				frame=dat.frame[_next];
				frame_update();
				
				if( oldlock===10) //combo
					if( _wait>0)
						_wait-=1;
			}
		}
		else
			_wait--;
	}
	this.set_pos=function(x,y,z)
	{
		ps.x=x; ps.y=y; ps.z=z;
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
	this.cur_state=function()
	{
		return frame.state;
	}
	this.hit=function(itr, att) //I am being hit by attacker `att`!
	{
		//kind 0 itr
		//only type 0 effect
		effect.dvx = itr.dvx ? att.dirh()*itr.dvx:0;
		effect.dvy = itr.dvy ? itr.dvy:0;
		effect.effect = itr.effect? itr.effect:0; //default effect type
		
		//injury
		if( itr.injury)	this.health -= itr.injury;
		
		if( frame.state===7 &&
		    (att.ps.x > ps.x)===(dir==='right')) //attacked in front
		{
			if( itr.bdefend) this.bdefend += itr.bdefend;
			if( this.bdefend>40) //defined defend break
			{
				frame_trans(112, 20);
			}
			else //an effective defence
			{
				frame_trans(111, 20);
			}
		}
		else
		{
			if( itr.fall)	this.fall += itr.fall;
				else	this.fall += 20; //default fall
			this.bdefend = 45; //lose defend ability immediately
			
			//fall
			var fall=this.fall;
			if ( 0<fall && fall<=20)
				frame_trans(220, 20);
			else if (20<fall && fall<=40)
				frame_trans(Math.random()<0.5? 222:224, 20);
			else if (40<fall && fall<60)
				frame_trans(226, 20);
			else if (60<=fall) //defined KO
			{
				if( (att.ps.x > ps.x)===(dir==='right')) //attacked in front
					frame_trans(180, 20);
				else
					frame_trans(186, 20); //attacked in back
				
				if( !itr.dvy) effect.dvy = -6.9; //default dvy when falling
			}
		}
		
		//effect
		effect.state.event('new');
		var vanish=3;
		switch( _next)
		{
			case 111: vanish=4; break;
			case 112: vanish=5; break;
		}
		effect.state.event_delay('vanish', vanish, 'TU');
	}
}

} //#endif
