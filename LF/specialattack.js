/*\
 * special attack
\*/

define(['LF/livingobject','LF/global','core/util'],
function(livingobject, Global, Futil)
{
var GC=Global.gameplay;

	/*\
	 * specialattack
	 [ class ]
	\*/
	var states=
	{
		'generic':function(event,K)
		{	var $=this;
			switch (event) {

			case 'TU':
				$.interaction();
				$.mech.dynamics();
				//	<YinYin> hit_a is the amount of hp that will be taken from a type 3 object they start with 500hp like characters it can only be reset with F7 or negative hits - once the hp reaches 0 the type 3 object will go to frame noted in hit_d - also kind 9 itrs (john shield) deplete hp instantly.
				if( $.frame.D.hit_a)
					$.health.hp -= $.frame.D.hit_a;
			break;

			case 'frame':
				if( $.frame.D.opoint)
					$.match.create_object($.frame.D.opoint, $);
				if( $.frame.D.sound)
					$.match.sound.play($.frame.D.sound);
			break;

			case 'frame_force':
			case 'TU_force':
				if( $.frame.D.hit_j)
				{
					var dvz = $.frame.D.hit_j - 50;
					$.ps.vz = dvz;
				}
			break;

			case 'leaving':
				if( $.bg.leaving($, 200)) //only when leaving far
					$.trans.frame(1000); //destroy
			break;
			
			case 'hit':
			case 'hit_others':
				$.match.sound.play($.data.bmp.weapon_broken_sound);
			break;

			case 'die':
				$.trans.frame($.frame.D.hit_d);
			break;

			}
			$.states['300X'].call($, event, K);
		},

		/*	State 300X - Ball States
			descriptions taken from
			http://lf-empire.de/lf2-empire/data-changing/reference-pages/182-states?showall=&start=29
		*/
		'300X':function(event,K)
		{	var $=this;
			switch (event) {
			case 'TU':
				/*	<zort> chasing ball seeks for 72 frames, not counting just after (quantify?) it's launched or deflected. Internally, LF2 keeps a variable keeping track of how long the ball has left to seek, which starts at 500 and decreases by 7 every frame until it reaches 0. while seeking, its maximum x speed is 14, and its x acceleration is 0.7; it can climb or descend, by 1 px/frame; and its maximum z speed is 2.2, with z acceleration .4. when out of seeking juice, its speed is 17. the -7 in the chasing algorithm comes from hit_a: 7.
				*/
				if( $.frame.D.hit_Fa===1 ||
					$.frame.D.hit_Fa===2)
				if( $.health.hp>0)
				{
					$.chase_target();
					var T = $.chasing.target;
					var dx = T.ps.x - $.ps.x,
						dy = T.ps.y - $.ps.y,
						dz = T.ps.z - $.ps.z;
					if( $.ps.vx*(dx>=0?1:-1) < 14)
						$.ps.vx += (dx>=0?1:-1) * 0.7;
					if( $.ps.vz*(dz>=0?1:-1) < 2.2)
						$.ps.vz += (dz>=0?1:-1) * 0.4;
					//$.ps.vy = (dy>=0?1:-1) * 1.0;
					$.switch_dir($.ps.vx>=0?'right':'left');
				}
				if( $.frame.D.hit_Fa===10)
				{
					$.ps.vx = ($.ps.vx>0?1:-1) * 17;
					$.ps.vz = 0;
				}
			break;
		}},

		/*	<zort> you know that when you shoot a ball between john shields it eventually goes out the bottom? that's because when a projectile is spawned it's .3 pixels or whatever below its creator and whenever it bounces off a shield it respawns.
		*/

		//	State 3000 - Ball Flying is the standard state for attacks.  If the ball hits other attacks with this state, it'll go to the hitting frame (10). If it is hit by another ball or a character, it'll go to the the hit frame (20) or rebounding frame (30).
		'3000':function(event, ITR, att, attps, rect)
		{	var $=this;
			switch (event) {

			case 'hit_others':
				if( ITR.effect===3 && att.type==='specialattack' && att.state()===3000 && att.frame.D.itr.effect!==3)
					//freeze ball hit another non freeze ball
					return;
				if( ITR.effect!==3 && att.type==='specialattack' && att.frame.D.itr.effect===3)
				{	//non freeze ball hit another freeze ball
					$.ps.vx = 0;
					$.trans.frame(1000);
					$.match.create_object({kind: 1, x: 41, y: 50, action: 0, dvx: 0, dvy: 0, oid: 209, facing: 0}, att);
					return true;
				}
				$.ps.vx = 0;
				$.trans.frame(10);
			break;

			case 'hit': //hit by others
				if( $.frame.D.itr.kind===14) //ice column
				{
					$.trans.set_wait(0,20); //go to break frame
					return true;
				}
				if( att.team===$.team && att.ps.dir===$.ps.dir)
					//can only attack objects of same team if head on collide
					return false;
				if( $.frame.D.itr.effect===3 && att.type==='specialattack' && att.state()===3000 && att.frame.D.itr.effect!==3)
					//freeze ball hit by non freeze ball
					return true;
				if( att.type==='specialattack')
				{
					if( $.frame.D.itr.effect!==3 && ITR.effect===3)
					{	//non freeze ball hit by freeze ball
						$.ps.vx = 0;
						$.trans.frame(1000);
						$.match.create_object({kind: 1, x: 41, y: 50, action: 0, dvx: 0, dvy: 0, oid: 209, facing: 0}, att);
						return true;
					}
					if( ITR.kind===0)
					{
						$.ps.vx = 0;
						$.trans.frame(20);
						return true;
					}
				}
				if( ITR.kind===0 ||
					ITR.kind===9) //itr:kind:9 can deflect all balls
				{
					$.ps.vx = 0;
					$.team = att.team;
					$.trans.frame(30); //rebound
					$.trans.trans(); $.TU_update(); $.trans.trans(); $.TU_update(); //transit and update immediately
					return true;
				}
			break;

			case 'state_exit':
				//ice column broke
				if( $.match.broken_list[$.id])
					$.brokeneffect_create($.id);
			break;
		}},

		//	State 3001 - Ball Flying / Hitting is used in the hitting frames, but you can also use this state directly in the flying frames.  If the ball hits a character while it has state 3001, then it won't go to the hitting frame (20).  It's the same for states 3002 through 3004. 
		'3001':function(event,K)
		{	var $=this;
			switch (event) {
		}},

		'3006':function(event, ITR, att, attps, rect)
		{	var $=this;
			switch (event) {
			case 'hit_others':
				if( att.type==='specialattack' &&
					(att.state()===3005 || att.state()===3006)) //3006 can only be destroyed by 3005 or 3006
				{
					$.trans.frame(10);
					$.ps.vx = 0;
					$.ps.vz = 0;
					return true;
				}
			break;
			case 'hit': //hit by others
				if( ITR.kind===9) //3006 can only be reflected by shield
				{
					$.ps.vx *= -1;
					$.ps.z += 0.3;
					return true;
				}
				if( att.type==='specialattack' &&
					(att.state()===3005 || att.state()===3006)) //3006 can only be destroyed by 3005 or 3006
				{
					$.trans.frame(20);
					$.ps.vx = 0;
					$.ps.vz = 0;
					return true;
				}
				if( att.type==='specialattack' &&
					att.state()===3000)
				{
					$.ps.vx = ($.ps.vx>0?-1:1) * 7; //deflect
					return true;
				}
				if( ITR.kind===0)
				{
					$.ps.vx = ($.ps.vx>0?-1:1) * 1; //deflect a little bit
					if( ITR.bdefend && ITR.bdefend > GC.defend.break_limit)
						$.health.hp = 0;
					return true;
				}
			break;
		}},

		'15':function(event,K) //whirlwind
		{	var $=this;
			switch (event) {
			case 'TU':
				$.ps.vx = $.dirh() * $.frame.D.dvx;
			break;
		}},

		'x':function(event,K)
		{	var $=this;
			switch (event) {
		}}
	};

	//inherit livingobject
	function specialattack(config,data,thisID)
	{
		var $=this;
		// chain constructor
		livingobject.call($,config,data,thisID);
		// constructor
		$.team = config.team;
		$.match = config.match;
		$.health.hp = $.proper('hp') || GC.default.health.hp_full;
		$.mech.mass = 0;
		$.setup();
	}
	specialattack.prototype = new livingobject();
	specialattack.prototype.constructor = specialattack;
	specialattack.prototype.states = states;
	specialattack.prototype.type = 'specialattack';

	specialattack.prototype.init = function(config)
	{
		var pos = config.pos,
			z = config.z,
			parent_dir = config.dir,
			opoint = config.opoint,
			dvz = config.dvz;
		var $=this;
		$.parent = config.parent;
		$.mech.set_pos(0,0,z);
		$.mech.coincideXY(pos,$.mech.make_point($.frame.D,'center'));
		var dir;
		var face = opoint.facing;
		if( face>=20)
			face = face%10;
		if( face===0)
			dir=parent_dir;
		else if( face===1)
			dir=(parent_dir==='right'?'left':'right');
		else if( 2<=face && face<=10)
			dir='right';
		else if(11<=face && face<=19) //adapted standard
			dir='left';
		$.switch_dir(dir);

		$.trans.frame(opoint.action===0?999:opoint.action);
		$.trans.trans();

		$.ps.vx = $.dirh() * opoint.dvx;
		$.ps.vy = opoint.dvy;
		$.ps.vz = dvz;
	}

	specialattack.prototype.interaction=function()
	{
		var $=this;
		var ITR=Futil.make_array($.frame.D.itr);

		if( $.team!==0)
		for( var j in ITR)
		{	//for each itr tag
			var vol=$.mech.volume(ITR[j]);
			if( !vol.zwidth)
				vol.zwidth = 0;
			var hit= $.scene.query(vol, $, {tag:'body'});
			for( var k in hit)
			{	//for each being hit
				if( ITR[j].kind===0 ||
					ITR[j].kind===9 || //shield
					ITR[j].kind===15 || //whirlwind
					ITR[j].kind===16) //whirlwind
				{
					if( !(hit[k].type==='character' && hit[k].team===$.team)) //cannot attack characters of same team
					if( !(ITR[j].kind===0 && hit[k].type!=='character' && hit[k].team===$.team && hit[k].ps.dir===$.ps.dir)) //kind:0 can only attack objects of same team if head on collide
					if( !$.itr.arest)
					if( $.attacked(hit[k].hit(ITR[j],$,{x:$.ps.x,y:$.ps.y,z:$.ps.z},vol)))
					{	//hit you!
						$.itr_arest_update(ITR);
						$.state_update('hit_others', ITR[j], hit[k]);
						if( ITR[j].arest)
							break; //attack one enemy only
						if( hit[k].type==='character' && ITR[j].kind===9)
							//hitting a character will cause shield to disintegrate immediately
							$.health.hp = 0;
					}
				}
				else if( ITR[j].kind===8) //heal
				{
					if( hit[k].type==='character') //only affects character
					if( hit[k].heal(ITR[j].injury))
					{
						$.trans.frame(ITR[j].dvx);
					}
				}
			}
		}
	}

	specialattack.prototype.hit=function(ITR, att, attps, rect)
	{
		var $=this;
		if( $.itr.vrest[att.uid])
			return false;

		if( ITR && ITR.vrest)
			$.itr.vrest[att.uid] = ITR.vrest;
		return $.state_update('hit', ITR, att, attps, rect);
	}

	specialattack.prototype.attacked=function(inj)
	{
		return this.parent.attacked(inj);
	}
	specialattack.prototype.killed=function()
	{
		this.parent.killed();
	}

	specialattack.prototype.chase_target=function()
	{
		//selects a target to chase after
		var $ = this;
		if( $.chasing===undefined)
		{
			$.chasing =
			{
				target: null,
				chased: {},
				query:
				{
					type:'character',
					sort:function(obj)
					{
						var dx = obj.ps.x-$.ps.x;
						var dz = obj.ps.z-$.ps.z;
						var score = Math.sqrt(dx*dx+dz*dz);
						if( $.chasing.chased[obj.uid])
							score += 500 * $.chasing.chased[obj.uid]; //prefer targets that are chased less number of times
						return score;
					}
				}
			}
		}
		$.chasing.query.not_team = $.team;
		var targets = $.match.scene.query(null, $, $.chasing.query);
		var target = targets[0];
		$.chasing.target = target;

		if( $.chasing.chased[target.uid]===undefined)
			$.chasing.chased[target.uid] = 1;
		else
			$.chasing.chased[target.uid]++;
	}

	return specialattack;
});
