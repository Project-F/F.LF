/*\
 * livingobject
 * 
 * a base class for all living objects
\*/
define(['LF/global','data/specification','LF/sprite','LF/mechanics','F.core/combodec'],
function ( Global, Spec, Sprite, Mech, Fcombodec)
{
	var GC=Global.gameplay;

	/*\
	 * livingobject
	 [ class ]
	 | config=
	 | {
	 | controller, (characters only)
	 | match,
	 | stage,
	 | scene,
	 | effects,
	 | team
	 | }
	\*/
	function livingobject(config,data,thisID)
	{
		if( !config)
			return;

		var $=this;

		//identity
		$.type='livingobject';
		$.name=data.bmp.name;
		$.uid=-1; //unique id, set by scene
		$.id=thisID; //character id, specify tactical behavior. accept values from 0~99
		$.data=data;
		$.team=config.team;
		$.states = null;
		$.states_switch_dir = null;

		//construction
		$.match=config.match;
		$.scene=config.scene;
		$.visualeffect=config.effects;

		$.sp = new Sprite(data.bmp, config.stage);
		$.health=
		{
			hp: 100,
			mp: 100,
			bdefend: 0,
			fall: 0
		};
		$.frame=
		{
			PN: 0, //previous frame number
			N: 0, //current frame number
			D: data.frame[0], //current frame's data object
			mobility: 1,
			ani: //animation sequence
			{
				i:0, up:true
			}
		};
		$.mech = new Mech($);
		$.ps = $.mech.create_metric(); //position, velocity, and other physical properties
		$.trans = new frame_transistor($);
		$.itr=
		{
			vrest: [], //a history of what have been hit by me recently
			lasthit: -100 //time when last being hit
		};
		$.effect=
		{
			i: 0,
			dvx: 0, dvy: 0,
			oscillate: 0,
			stuck: false, //when an object is said to be 'stuck', there is not state and frame update
			timeout: 0
		};
		$.catching= 0; //state 9: the object being caught by me now
					//OR state 10: the object catching me now
		$.hold=
		{
			obj: null, //something that I can hold or can hold me
			id: 0 //id of holding
		};
		$.switch_dir=true; //direction switcher
		$.con = config.controller;
		if( $.con)
		{
			function combo_event(kobj)
			{
				var K=kobj.name;
				//combo event
				var tar=$.states[$.frame.D.state];
				if( tar) tar.call($,'combo',K);

				if( K==='left' || K==='right')
					if( $.switch_dir)
						$.switch_dir_fun(K);
			}
			var dec_con = //combo detector
			{
				timeout: Global.detector_config.timeout,
				comboout: Global.detector_config.comboout,
				no_repeat_key: Global.detector_config.no_repeat_key,
				callback: combo_event //callback function when combo detected
			}
			$.combodec = new Fcombodec($.con, dec_con, Global.combo_list);
		}
	}

	//setup for a match
	livingobject.prototype.setup = function()
	{
		var $=this;
		$.state_update('setup');
		$.scene.add($);
	}

	//update done at every frame
	livingobject.prototype.frame_update = function()
	{
		var $=this;
		//show frame
		$.sp.show_pic($.frame.D.pic);

		//velocity
		$.frame.mobility=1;
		$.ps.vx+= $.dirh() * $.frame.D.dvx;
		if( $.frame.D.dvz) //heavyweapon does not have dvz
			$.ps.vz+= $.dirv() * $.frame.D.dvz;
		$.ps.vy+= $.frame.D.dvy;

		//wait for next frame
		$.trans.set_wait($.frame.D.wait,99);
		$.trans.set_next($.frame.D.next,99);

		//state generic then specific update
		$.state_update('frame');
	}

	//update done at every TU (30fps)
	livingobject.prototype.TU_update = function()
	{
		var $=this;

		if( !$.effect.stuck)
			$.state_update('TU');

		//effect
		if( $.effect.oscillate)
		{
			if( $.effect.i===1)
				$.effect.i=-1;
			else
				$.effect.i=1;
			$.sp.set_xy({x:$.ps.sx + $.effect.oscillate*$.effect.i, y:$.ps.sy+$.ps.sz});
		}
		if( $.effect.timeout===0)
		{
			$.effect.oscillate = 0;
			$.effect.stuck = false;
			$.sp.set_xy({x:$.ps.sx, y:$.ps.sy+$.ps.sz});
		}
		else if( $.effect.timeout===-1)
		{
			$.ps.vx = $.effect.dvx;
			$.ps.vy = $.effect.dvy;
			$.effect.dvx=0;
			$.effect.dvy=0;
		}
		$.effect.timeout--;

		//recovery
		$.itr.lasthit--;
		if( $.itr.lasthit<-3)
		{
			if( $.health.fall>0 && $.health.fall<10) $.health.fall=0;
			if( $.health.fall>0) $.health.fall += GC.recover.fall;
			if( $.health.bdefend>0) $.health.bdefend += GC.recover.bdefend;
		}

		//attack rest
		for( var I in $.itr.vrest)
		{	//watch out that itr.vrest might grow very big
			if( $.itr.vrest[I] > 0)
				$.itr.vrest[I]--;
		}
		if( $.itr.arest > 0)
			$.itr.arest--;
	}

	livingobject.prototype.state_update=function(event)
	{
		var $=this;
		var tar1=$.states['generic'];
		if( tar1) var res1=tar1.call($,event);
		//
		var tar2=$.states[$.frame.D.state];
		if( tar2) var res2=tar2.call($,event);
		//
		return res1 || res2;
	}

	livingobject.prototype.TU=function()
	{
		var $=this;

		//fetch inputs
		if( $.con)
			$.con.fetch();

		//state
		$.TU_update();

		//combo detector
		if( $.con)
			$.combodec.frame();
	}

	livingobject.prototype.transit=function()
	{
		if( !this.effect.stuck)
			this.trans.trans();
	}

	livingobject.prototype.set_pos=function(x,y,z)
	{
		this.mech.set_pos(x,y,z);
	}

	//return the body volume for collision detection
	//  all other volumes e.g. itr should start with prefix vol_
	livingobject.prototype.vol_body=function() 
	{
		return this.mech.body();
	}

	livingobject.prototype.cur_state=function()
	{
		return this.frame.D.state;
	}

	livingobject.prototype.effect_id=function(num)
	{
		return num+GC.effect.num_to_id;
	}

	livingobject.prototype.effect_create=function(num,duration)
	{
		var $=this;
		if( num!==null && num!==undefined)
		{
			var efid= num+GC.effect.num_to_id;
			if( $.proper(efid,'oscillate'))
				$.effect.oscillate=$.proper(efid,'oscillate');
			if( $.proper(efid,'cant_move'))
				$.frame.mobility=0;
		}
		$.effect.timeout=duration;
	}

	livingobject.prototype.visualeffect_create=function(num, rect, righttip, variant)
	{
		var $=this;
		var efid= num+GC.effect.num_to_id;
		var pos=
		{
			x: rect.x+ rect.vx+ (righttip?rect.w:0),
			y: rect.y+ rect.vy+ rect.h/2,
			z: rect.z>$.ps.z ? rect.z:$.ps.z
		}
		$.visualeffect.create(pos,efid,variant);
	}

	//animate back and forth between frame a and b
	livingobject.prototype.frame_ani_oscillate=function(a,b)
	{
		var $=this;
		var $f=$.frame;
		if( $f.ani.i<a || $f.ani.i>b)
		{
			$f.ani.up=true;
			$f.ani.i=a+1;
		}
		if( $f.ani.i<b && $f.ani.up)
			$.trans.set_next($f.ani.i++);
		else if( $f.ani.i>a && !$f.ani.up)
			$.trans.set_next($f.ani.i--);
		if( $f.ani.i==b) $f.ani.up=false;
		if( $f.ani.i==a) $f.ani.up=true;
	}

	livingobject.prototype.frame_ani_sequence=function(a,b)
	{
		var $=this;
		var $f=$.frame;
		if( $f.ani.i<a || $f.ani.i>b)
		{
			$f.ani.i=a+1;
		}
		trans.set_next($f.ani.i++);
		if( $f.ani.i > b)
			$f.ani.i=a;
	}

	livingobject.prototype.itr_rest_update=function(uid,ITR)
	{
		var $=this;
		var newrest;
		//rest: cannot interact again for some time
		if( ITR.arest)
			newrest = ITR.arest;
		else if( ITR.vrest)
			newrest = ITR.vrest;
		else
			newrest = GC.default.character.arest;
		$.itr.vrest[uid] = newrest;
		//console.log('update vrest['+uid+'] of '+$.id+' to '+newrest);
	}

	livingobject.prototype.itr_rest_test=function(uid,ITR)
	{
		var $=this;
		//console.log('vrest['+uid+'] of '+$.id+' is '+$.itr.vrest[uid]);
		if( !$.itr.vrest[uid])
			return true;
	}

	livingobject.prototype.switch_dir_fun = function(e)
	{
		var $=this;
		if( $.ps.dir==='left' && e==='right')
		{
			$.ps.dir='right';
			$.sp.switch_lr('right');
		}
		else if( $.ps.dir==='right' && e==='left')
		{
			$.ps.dir='left';
			$.sp.switch_lr('left');
		}
	}

	livingobject.prototype.dirh = function()
	{
		var $=this;
		return ($.ps.dir==='left'?-1:1);
	}

	livingobject.prototype.dirv = function()
	{
		var $=this;
		var d=0;
		if( $.con)
		{
			if( $.con.state.up)   d-=1;
			if( $.con.state.down) d+=1;
		}
		return d;
	}

	livingobject.prototype.proper = function(id,prop)
	{
		var $=this;
		if( arguments.length===1)
		{
			prop=id;
			id=$.id;
		}
		if( Spec[id])
			return Spec[id][prop];
		return null;
	}

	function frame_transistor($)
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
					$.frame.PN=$.frame.N;
					$.frame.N=next;
					$.state_update('frame_exit');

					//state transition
					var is_trans = $.frame.D.state !== $.data.frame[next].state;
					if( is_trans)
						$.state_update('state_exit');

					$.frame.D=$.data.frame[next];

					if( is_trans)
					{
						var old_switch_dir=$.switch_dir;
						if( $.states_switch_dir && $.states_switch_dir[$.frame.D.state] !== undefined)
							$.switch_dir=$.states_switch_dir[$.frame.D.state];
						else
							$.switch_dir=false;

						$.state_update('state_entry');

						if( $.switch_dir && !old_switch_dir)
						{
							if( $.con)
							{
								if($.con.state.left) $.switch_dir_fun('left');
								if($.con.state.right) $.switch_dir_fun('right');
							}
						}
					}

					$.frame_update();

					if( oldlock===10) //combo
						if( wait>0)
							wait-=1;
				}
			}
			else
				wait--;
		}
	} // frame_transistor

	return livingobject;
});
