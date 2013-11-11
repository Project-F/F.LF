/*\
 * special attack
\*/

define(['LF/livingobject','LF/global','F.core/util'],
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
				/*	<YinYin> hit_a is the amount of hp that will be taken from a type 3 object they start with 500hp like characters it can only be reset with F7 or negative hits - once the hp reaches 0 the type 3 object will go to frame noted in hit_d - also kind 9 itrs (john shield) deplete hp instantly.
				*/
				if( $.frame.D.hit_a)
				{
					$.health.hp -= $.frame.D.hit_a;
					if( $.health.hp<=0)
						$.trans.frame($.frame.D.hit_d);
				}
			break;

			case 'frame':
			break;
		}},

		// State 300X - Ball States
		// descriptions taken from
		// http://lf-empire.de/lf2-empire/data-changing/reference-pages/182-states?showall=&start=29

		/*	State 3000 - Ball Flying
			State 3000 is the standard state for attacks.  If the ball hits other attacks with this state, it'll go to the hitting frame (10).  If it is hit by another ball or a character, it'll go to the the hit frame (20) or rebounding frame (30).
		*/
		'3000':function(event,K)
		{	var $=this;
			switch (event) {
			case 'hit_others':
				$.trans.frame(10);
			break;
			case 'hit_by_others':
				$.trans.frame(20);
			break;
		}},

		/*	State 3001 - Ball Flying / Hitting
			State 3001 is used in the hitting frames, but you can also use this state directly in the flying frames.  If the ball hits a character while it has state 3001, then it won't go to the hitting frame (20).  It's the same for states 3002 through 3004. 
		*/
		'3001':function(event,K)
		{	var $=this;
			switch (event) {
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
		$.health.hp = $.proper('hp') || GC.default.health.hp_full;
		$.setup();
	}
	specialattack.prototype = new livingobject();
	specialattack.prototype.constructor = specialattack;
	specialattack.prototype.states = states;
	specialattack.prototype.type = 'specialattack';

	specialattack.prototype.init = function(pos,z,parent_dir,opoint)
	{
		var $=this;
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

		$.frame.PN = 0;
		$.frame.N = opoint.action;
		$.frame.D = $.data.frame[$.frame.N];
		$.sp.show_pic($.frame.D.pic);

		$.ps.vx = $.dirh() * opoint.dvx;
		$.ps.vy = opoint.dvy;
	}

	specialattack.prototype.interaction=function()
	{
		var $=this;
		var ITR=Futil.make_array($.frame.D.itr);

		if( $.team!==0)
		for( var j in ITR)
		{	//for each itr tag
			if( ITR[j].kind===0) //kind 0
			{
				var vol=$.mech.volume(ITR[j]);
				var hit= $.scene.query(vol, $, {tag:'body', not_team:$.team});
				for( var k in hit)
				{	//for each being hit
					if( $.itr_rest_test( hit[k].uid, ITR[j]))
					if( hit[k].hit(ITR[j],$,{x:$.ps.x,y:$.ps.y,z:$.ps.z},vol))
					{	//hit you!
						$.itr_rest_update( hit[k].uid, ITR[j]);
						$.state_update('hit_others');
						$.ps.vx = 0;
						if( ITR[j].arest) break; //attack one enemy only
					}
				}
			}
		}
	}

	specialattack.prototype.hit=function(ITR, att, attps, rect)
	{
		var $=this;
		var accept=false;
		return accept;
	}

	return specialattack;
});
