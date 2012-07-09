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
	
	//---hack-------------------------------------------------------
	//some hacking over the original data to make compatible bahavior
	
	//---status-----------------------------------------------------
	this.hp=100;
	this.mp=100;
	this.bdefend=0;
	this.fall=0;
	
	//the state variable
	var state=0;
	var wait=1; //when wait decreases to zero, a frame transition happens
	var next=999; //next frame
	
	//frame
	var framePN=0; //previous frame number
	var frameN=0; //current frame number
	var frame=dat.frame[0]; //current frame object
	
	//itr
	var arest=[]; //a history of what have been hit by me recently
	
	//effect
	var effect={enable:false, i:0};
		//effect=
		//{
		//	dvx, dvy,
		//	effect,
		//	duration,
		//	i
		//}
	
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
	
	//---internal functions-----------------------------------------
	
	function frame_update() //generic update done at every frame
	{
		//show frame
		sp.show_pic(frame.pic);
		
		//velocity
		ps.vx+= dirh() * frame.dvx;
		ps.vz+= dirv() * frame.dvz;
		ps.vy+= frame.dvy;
		
		//wait for next frame
		wait=frame.wait;
		next=frame.next;
		
		//set state
		if(state !== frame.state)
			state = frame.state;
		
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
			ps.vx *= 0.74; //magic number
			ps.vz *= 0.74;
			if( ps.vx>-1 && ps.vx<1) ps.vx=0; //magic number
			if( ps.vz>-1 && ps.vz<1) ps.vz=0;
		}
		
		if( ps.y<0) //gravity
			ps.vy+= 1.7; //magic number
		
		if( ps.y===0 && ps.vy>0)
		{ //falling onto the ground
			var tar=states[frame.state]; //state specific actions
			if( tar) var result=tar('fall_onto_ground');
			
			if( result !== undefined && result !== null)
				frame_trans(result);
			else
			{
				switch (frameN)
				{
				case 212: //jumping
					frame_trans(215); //crouch
					break;
				default:
					frame_trans(219); //crouch2
				}
			}
			
			ps.vy=0; //set to zero
			ps.vx*=0.34; //magic number
			ps.vz*=0.34;
		}
		
		//recovery
		if( This.fall>0) This.fall--;
		if( This.bdefend>0) This.bdefend--;
	}
	
	var states= //state specific update every TU
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
			
			case 'frame':
			break;
			
			case 'combo':
				switch(K)
				{
				case 'run':
					switch_dir=false;
					ce.frame_trans(9);
				break;
				case 'def':
					ce.frame_trans(110);
				break;
				case 'jump':
					ce.frame_trans(210);
				break;
				case 'att':
					ce.frame_trans(Math.random()<0.5? 60:65);
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
				wait=dat.bmp.walking_frame_rate;
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
				wait=dat.bmp.running_frame_rate;
			break;
			
			case 'combo':
				switch(K)
				{
				case 'left': case 'right':
					if(K!=dir)
					{
						ce.frame_trans(218);
					}
					break;
				case 'def':
					ce.frame_trans(102);
					break;
				case 'jump':
					switch_dir=true;
					ce.goto_dash();
					break;
				case 'att':
					ce.frame_trans(85);
					break;
				}
			break;
		}},
		
		'3':function(event,K) //punch, jump_attack, run_attack, ...
		{ switch (event) {
			case 'frame':
				if( frameN===81) //jump_attack
					next=212; //back to jump
				
				var itr = frame.itr;
				if( itr)
				if( itr.kind===0)
				{
					var vol=make_volume(itr);
					if( vol.zwidth===0) vol.zwidth=12; //magic number
					var hit= scene.query(vol,This);
					for( var t in hit)
					{
						if( arest[ hit[t].id ]===undefined || arest[ hit[t].id ] <= 0)
							hit[t].hit(itr,This); //hit you!
						
						//rest: cannot attack you again for some time
						if( itr.arest) var rest=itr.arest;
						if( itr.vrest) var rest=itr.vrest;
						arest[ hit[t].id ] = rest;
						
						//attack one enemy only
						if( itr.arest) break; //TODO: attack the closest
					}
				}
			break;
			
			case 'frame_exit':
				if( frameN===0) //going back to standing
				{
					switch_dir=true;
				}
				else if( frameN===212) //going back to jump
				{
					switch_dir=true;
					if(con.state.left) switch_dir_fun('left');
					if(con.state.right) switch_dir_fun('right');
				}
			break;
		}},
		
		'4':function(event,K) //jump
		{ switch (event) {
			case 'TU':
				if( frameN===212) //is jumping
				{
					if( con.state.att)
					{
						switch_dir=false;
						frame_trans(80);
					}
				}
			break;
			
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
			
			case 'combo':
			break;
		}},
		
		'5':function(event,K) //dash
		{ switch (event) {
			case 'combo':
				if( K==='att')
				{
					if( dirh()==(ps.vx>0?1:-1)) //only if not turning back
					{
						switch_dir=false;
						ce.frame_trans(90);
					}
				}
				if( K==='left' || K==='right')
				{
					if( K!=dir)
					{
						if( dirh()==(ps.vx>0?1:-1))
						{//turn back
							if( frameN===213) ce.frame_trans(214);
							if( frameN===216) ce.frame_trans(217);
						}
						else
						{//turn to front
							if( frameN===214) ce.frame_trans(213);
							if( frameN===217) ce.frame_trans(216);
						}
					}
				}
			break;
		}},
		
		'12':function(event,K) //falling
		{ switch (event) {
			case 'TU':
			break;
			
			case 'frame':
				switch (frameN)
				{
					case 180:
						next=181;
						break;
					case 181:
						next=182;
						break;
					case 182:
						next=183;
						break;
					//
					case 186:
						next=187;
						break;
					case 187:
						next=188;
						break;
					case 188:
						next=189;
						break;
				}
			break;
			
			case 'fall_onto_ground':
				if( frameN >= 180 && frameN <= 185)
					return 230;
				if( frameN >= 186 && frameN <= 191)
					return 231;
			break;
			
			case 'combo':
			break;
			
			case 'frame_exit':
				ps.vx += effect.dvx;
				ps.vy += effect.dvy;
				effect.dvx=0;
				effect.dvy=0;
			break;
		}},
		
		'15':function(event,K) //stop_running, crouch, crouch2, dash_attack
		{ switch (event) {

			case 'combo':
				if( frameN===215) //only after jumping
				{
					if( K==='def')
					{
						switch_dir=false;
						ce.frame_trans(102);
					}
					if( K==='jump')
					{
						if( con.state.left || con.state.right)
							ce.goto_dash();
						else
						{
							wait+=2;
							next=210;
						}
					}
				}
			break;
			
			case 'frame_exit':
				if( frameN===0) //going back to standing
				{
					if( switch_dir===false)
					{
						switch_dir=true; //re-enable switch dir
						if(con.state.left) switch_dir_fun('left');
						if(con.state.right) switch_dir_fun('right');
					}
				}
			break;
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
				next=fu.da.i++;
			else if( fu.da.i>a && !fu.da.up)
				next=fu.da.i--;
			if( fu.da.i==b) fu.da.up=false;
			if( fu.da.i==a) fu.da.up=true;
		}
	}
	
	var ce= //combo event related functions
	{
		'goto_dash':function()
		{
			ce.frame_trans(213);
			ps.vx= dirh() * dat.bmp.dash_distance;
			ps.vz= dirv() * dat.bmp.dash_distancez;
			ps.vy= dat.bmp.dash_height;
		},
		'frame_trans':function(F)
		{ //frame transitions triggered by combo events will have 1 less wait
			frame_trans(F);
			wait--;
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
	
	function frame_trans(F)
	{
		if( F===0)
		{
			//do nothing
		}
		else
		{
			if( F===999)
				F=0;
			framePN=frameN;
			frameN=F;
				var tar=states[frame.state];
				if( tar) tar('frame_exit');
			frame=dat.frame[F];
			frame_update();
		}
	}
	
	function make_volume(O)
	{
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
	
	function make_effect()
	{
		if( effect.effect===0)
		{
			if( effect.i>=-1 && effect.i<=1)
			{
				sp.set_xy({x:ps.x + 2.5*effect.i, y:ps.y+ps.z}); //magic number
				effect.i++;
				if( effect.i>1)
					effect.i=-1;
			}
			else
				effect.i=-1;
		}
		if( effect.duration===0)
		{
			sp.set_xy({x:ps.x, y:ps.y+ps.z});
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
	this.frame=function()
	{
		state_update();
		dec.frame();
		
		//wait
		if( wait===0)
			frame_trans(next);
		else
			wait--;
		
		//effect
		if( effect.duration>=0)
			make_effect();
		effect.duration--;
		
		//arest (attack rest)
		for( var I in arest)
		{
			if( arest[I] > 0)
				arest[I]--;
		}
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
	this.hit=function(itr, att) //I am being hit by attacker `att`!
	{
		//only kind: 0 itr
		
		//numerical updates
		if( itr.injury)	this.health -= itr.injury;
		if( itr.fall)	this.fall += itr.fall;
			else	this.fall += 20; //magic number
		if( itr.bdefend)this.bdefend += itr.bdefend;
		
		//effect
		effect.dvx = itr.dvx ? att.dirh()*itr.dvx:0;
		effect.dvy = itr.dvy ? itr.dvy:0;
		effect.effect = itr.effect? itr.effect:0; //magic number
		effect.duration = 3;
		
		//fall
		var fall=this.fall;
		if ( 0<fall && fall<=20)
			next=(220);
		else if (20<fall && fall<=40)
			next=(Math.random()<0.5? 222:224);
		else if (40<fall && fall<=60)
			next=(226);
		else if (60<fall)
		{
			if( (att.ps.x > ps.x)===(dir==='right')) //attacked in front
				next=(180);
			else
				next=(186); //attacked in back
			
			if( !itr.dvy) effect.dvy = -6; //magic number
		}
		wait=0;
	}
}

} //#endif
