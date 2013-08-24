/**	a LF2 character
 */

define(['LF/livingobject','LF/global','F.core/util','LF/util'],
function(livingobject, Global, Futil, util)
{
	var GC=Global.gameplay;

	var states=
	{
		'generic':function(event,K)
		{	var $=this;
			switch (event) {
			case 'TU':
				$.post_interaction();

				//dynamics: position, friction, gravity
				$.mech.dynamics(); //any further change in position will not be updated on screen until next TU
				$.wpoint.call($); //my holding weapon following my change

				var ps=$.ps;
				if( ps.y===0 && ps.vy>0) //fell onto ground
				{
					var result = $.state_update('fell_onto_ground');
					if( result)
						$.trans.frame(result, 15);
					else
					{
						ps.vy=0; //set to zero
						$.mech.linear_friction(
							util.lookup(GC.friction.fell,ps.vx),
							util.lookup(GC.friction.fell,ps.vz)
						);
					}
				}
				else if( ps.y+ps.vy>=0 && ps.vy>0) //predict falling onto the ground
				{
					var result = $.state_update('fall_onto_ground');
					if( result)
						$.trans.frame(result, 15);
					else
					{
						if( $.frame.N===212) //jumping
							$.trans.frame(215, 15); //crouch
						else
							$.trans.frame(219, 15); //crouch2
					}
				}
				else if( ps.y===0 && $.frame.N===212)
				{
					//$.trans.frame(999);
				}
			break;
			case 'combo':
				switch(K)
				{
				case 'left': case 'right':
				case 'run':
				break;
				default:
					if( K==='def')  K='hit_d';
					if( K==='jump') K='hit_j';
					if( K==='att')  K='hit_a';
					if( $.frame.D[K])
					{
						$.trans.frame($.frame.D[K], 11);
						return 1;
					}
				}
			break;
			case 'post_combo': //after state specific processing
				$.pre_interaction();
			break;
		}},

		//state specific processing to different events

		'0':function(event,K) //standing
		{	var $=this;
			switch (event) {

			case 'frame':
				if( $.hold.obj && $.hold.obj.type==='heavyweapon')
					$.trans.frame(12);
			break;

			case 'combo':
				switch(K)
				{
				case 'left': case 'right': case 'up': case 'down':
				case 'jump':
					var dx = $.con.state.left !== $.con.state.right,
						dz = $.con.state.up   !== $.con.state.down;
					if( dx || dz)
					{
						if( K!=='jump') //walk
							$.trans.frame(5); //TODO: select randomly from 5,6,7,8
						//apply movement
						if( $.hold.obj && $.hold.obj.type==='heavyweapon')
						{
							if( dx) $.ps.vx=$.dirh()*($.data.bmp.heavy_walking_speed);
							$.ps.vz=$.dirv()*($.data.bmp.heavy_walking_speedz);
						}
						else
						{
							if( dx) $.ps.vx=$.dirh()*($.data.bmp.walking_speed);
							$.ps.vz=$.dirv()*($.data.bmp.walking_speedz);
						}
					}
				break;
				}
				switch(K)
				{
				case 'run':
					if( $.hold.obj && $.hold.obj.type==='heavyweapon')
						$.trans.frame(16, 10);
					else
						$.trans.frame(9, 10);
				return 1;
				case 'def':
					if( $.hold.obj && $.hold.obj.type==='heavyweapon')
						return 1;
					$.trans.frame(110, 10);
				return 1;
				case 'jump':
					if( $.hold.obj && $.hold.obj.type==='heavyweapon')
					{
						if( !$.proper('heavy_weapon_jump'))
							return 1;
						else
						{
							$.trans.frame($.proper('heavy_weapon_jump'), 10);
							return 1;
						}
					}
					$.trans.frame(210, 10);
				return 1;
				case 'att':
					if( $.hold.obj)
					{
						var dx = $.con.state.left !== $.con.state.right;
						if( $.hold.obj.type==='heavyweapon')
						{
							$.trans.frame(50, 10); //throw heavy weapon
							return 1;
						}
						else if( $.proper($.hold.id,'just_throw'))
						{
							$.trans.frame(45, 10); //throw light weapon
							return 1;
						}
						else if ( dx && $.proper($.hold.id,'stand_throw'))
						{
							$.trans.frame(45, 10); //throw weapon
							return 1;
						}
						else if( $.proper($.hold.id,'attackable')) //light weapon attack
						{
							$.trans.frame($.match.random()<0.5? 20:25, 10);
							return 1;
						}
					}
					//
					var vol=$.mech.volume(Futil.make_array($.data.frame[72].itr)[0]); //super punch, frame 72
					var hit= $.scene.query(vol, $, {tag:'itr:6', not_team:$.team});
					for( var t in hit)
					{	//if someone is in my hitting scoope who has itr kind:6
						var hit_itr=(hit[t].vol_itr(6))[0].data;
						if( $.itr_rest_test( hit[t].uid, hit_itr))
						{
							$.trans.frame(70, 10); //I 'll use super punch!
							$.itr_rest_update( hit[t].uid, hit_itr);
							return 1;
						}
					}
					//
					$.trans.frame($.match.random()<0.5? 60:65, 10);
				return 1;
				}
			break;
		}},

		'1':function(event,K) //walking
		{	var $=this;

			var dx = $.con.state.left !== $.con.state.right,
				dz = $.con.state.up   !== $.con.state.down;
			switch (event) {

			case 'frame':
				if( $.hold.obj && $.hold.obj.type==='heavyweapon')
				{
					if( dx || dz)
						$.frame_ani_oscillate(12,15);
					else
						$.trans.set_next($.frame.N);
				}
				else
				{
					$.frame_ani_oscillate(5,8);
				}
				$.trans.set_wait($.data.bmp.walking_frame_rate-1);
			break;

			case 'TU':
				//apply movement
				if( $.hold.obj && $.hold.obj.type==='heavyweapon')
				{
					if( dx) $.ps.vx=$.dirh()*($.data.bmp.heavy_walking_speed);
					$.ps.vz=$.dirv()*($.data.bmp.heavy_walking_speedz);
				}
				else
				{
					if( dx) $.ps.vx=$.dirh()*($.data.bmp.walking_speed);
					$.ps.vz=$.dirv()*($.data.bmp.walking_speedz);
				}
				if( !dx && !dz && !$.statemem.transed)
				{
					$.statemem.transed=true;
					$.trans.set_next(999); //go back to standing
					$.trans.set_wait(1,1,2);
				}
			break;

			case 'state_entry':
				$.trans.set_wait(0);
			break;

			case 'combo':
				if( !dx && !dz && !$.statemem.released)
				{
					$.statemem.released=true;
					$.mech.unit_friction();
				}
				//walking same as standing, except null combo
				if( K) return $.states['0'].call($,event,K);
			break;
		}},

		'2':function(event,K) //running, heavy_obj_run
		{	var $=this;
			switch (event) {

			case 'frame':
				if( $.hold.obj && $.hold.obj.type==='heavyweapon')
					$.frame_ani_oscillate(16,18);
				else
					$.frame_ani_oscillate(9,11);
				$.trans.set_wait($.data.bmp.running_frame_rate);
			//no break here

			case 'TU':
				//to maintain the velocity against friction
				if( $.hold.obj && $.hold.obj.type==='heavyweapon')
				{
					$.ps.vx= $.dirh() * $.data.bmp.heavy_running_speed;
					$.ps.vz= $.dirv() * $.data.bmp.heavy_running_speedz;
				}
				else
				{
					$.ps.vx= $.dirh() * $.data.bmp.running_speed;
					$.ps.vz= $.dirv() * $.data.bmp.running_speedz;
				}
			break;

			case 'combo':
				switch(K)
				{
				case 'left': case 'right':
					if(K!=$.ps.dir)
					{
						if( $.hold.obj && $.hold.obj.type==='heavyweapon')
							$.trans.frame(19, 10);
						else
							$.trans.frame(218, 10);
						return true;
					}
				break;

				case 'def':
					if( $.hold.obj && $.hold.obj.type==='heavyweapon')
						return 1;
					$.trans.frame(102, 10);
				return true;

				case 'jump':
					if( $.hold.obj && $.hold.obj.type==='heavyweapon')
					{
						if( !$.proper('heavy_weapon_dash'))
							return 1;
						else
						{
							$.trans.frame($.proper('heavy_weapon_dash'), 10);
							return 1;
						}
					}
					$.trans.frame(213, 10);
				return true;

				case 'att':
					if( $.hold.obj)
					{
						if( $.hold.obj.type==='heavyweapon')
						{
							$.trans.frame(50, 10); //throw heavy weapon
							return 1;
						}
						else
						{
							var dx = $.con.state.left !== $.con.state.right;
							if( dx && $.proper($.hold.id,'run_throw'))
							{
								$.trans.frame(45, 10); //throw light weapon
								return 1;
							}
							else if( $.proper($.hold.id,'attackable'))
							{
								$.trans.frame(35, 10); //light weapon attack
								return 1;
							}
						}
					}
					$.trans.frame(85, 10);
				return 1;
				}
			break;
		}},

		'3':function(event,K) //punch, jump_attack, run_attack, ...
		{	var $=this;
			switch (event) {
			case 'frame':
				if( $.frame.D.next===999 && $.ps.y<0)
					$.trans.set_next(212); //back to jump
				switch ($.frame.N)
				{
					case 85: case 86: //run attack
						$.ps.fric=0.6;
					break;
					case 60: case 65:
						$.ps.fric=0;
					break;
					case 71:
						$.ps.fric=0.3;
					break;
				}
			break;
		}},

		'4':function(event,K) //jump
		{	var $=this;
			switch (event) {

			case 'frame':
				$.statemem.frameTU=true;
			break;

			case 'TU':
				if( $.statemem.frameTU)
				{	$.statemem.frameTU=false;
					if( $.frame.N===212 && $.frame.PN===211)
					{	//start jumping
						var dx=0;
						if($.con.state.left)  dx-=1;
						if($.con.state.right) dx+=1;
						$.ps.vx= dx * ($.data.bmp.jump_distance-1);
						$.ps.vz= $.dirv() * ($.data.bmp.jump_distancez-1);
						$.ps.vy= $.data.bmp.jump_height; //upward force
					}
				}
			break;

			case 'combo':
				if( K==='att')
				{
					/** a transition to jump_attack can only happen after entering frame 212.
					if an 'att' key event arrives while in frame 210 or 211,
					the jump attack event should be pended and be performed on 212
					 */
					if( $.frame.N===212)
					{
						if( $.hold.obj)
						{
							var dx = $.con.state.left !== $.con.state.right;
							if( dx && $.proper($.hold.id,'jump_throw'))
								$.trans.frame(52, 10); //sky light weapon throw
							else if( $.proper($.hold.id,'attackable'))
								$.trans.frame(30, 10); //light weapon attack
						}
						else
							$.trans.frame(80, 10); //jump attack
						return 1;
					}
				}
			break;
		}},

		'5':function(event,K) //dash
		{	var $=this;
			switch (event) {
			case 'state_entry':
				$.ps.vx= $.dirh() * ($.data.bmp.dash_distance-1);
				$.ps.vz= $.dirv() * ($.data.bmp.dash_distancez-1);
				$.ps.vy= $.data.bmp.dash_height;
			break;

			case 'combo':
				if( K==='att')
				{
					if( $.proper('dash_backattack') || //back attack
						$.dirh()===($.ps.vx>0?1:-1)) //if not turning back
					{
						if( $.hold.obj && $.proper($.hold.id,'attackable')) //light weapon attack
							$.trans.frame(40, 10);
						else
							$.trans.frame(90, 10);
						$.switch_dir=false;
						return 1;
					}
				}
				if( K==='left' || K==='right')
				{
					if( K!=$.ps.dir)
					{
						if( $.dirh()==($.ps.vx>0?1:-1))
						{//turn back
							if( $.frame.N===213) $.trans.frame(214, 0);
							if( $.frame.N===216) $.trans.frame(217, 0);
						}
						else
						{//turn to front
							if( $.frame.N===214) $.trans.frame(213, 0);
							if( $.frame.N===217) $.trans.frame(216, 0);
						}
						return 1;
					}
				}
			break;
		}},

		'6':function(event,K) //rowing
		{	var $=this;
			switch (event) {
			case 'TU':
				//to maintain the velocity against friction
				$.ps.vx = $.dirh() * $.frame.D.dvx;
				$.ps.vz = $.dirv() * $.frame.D.dvz;
			break;
		}},

		'7':function(event,K) //defending
		{	var $=this;
			switch (event) {
			case 'frame':
				if( $.frame.N===111)
					$.trans.inc_wait(4);
			break;
		}},

		'8':function(event,K) //broken defend
		{	var $=this;
			switch (event) {
			case 'frame':
				switch ($.frame.N)
				{
					case 114:
						$.ps.fric=0;
					break;
				}
			break;
		}},

		'9':function(event,K) //catching, throw lying man
		{	var $=this;
			switch (event) {
			case 'state_entry':
				$.statemem.stateTU=true;
				$.statemem.counter=43;
				$.statemem.attacks=0;
			break;

			case 'state_exit':
				$.catching=null;
				$.ps.zz=0;
			break;

			case 'frame':
				switch ($.frame.N)
				{
					case 123: //a successful attack
					$.statemem.attacks++;
					$.statemem.counter+=3;
					$.trans.inc_wait(1);
					break;
					case 233: case 234:
					$.trans.inc_wait(-1);
					break;
				}
				if( $.frame.N===234)
					return;
				$.catching.caught_b(
						$.mech.make_point($.frame.D.cpoint),
						$.frame.D.cpoint,
						$.ps.dir
					);
			break;

			case 'TU':
			if( $.caught_cpointkind()===1 &&
				$.catching.caught_cpointkind()===2 )
			{	//really catching you
				if( $.statemem.stateTU)
				{	$.statemem.stateTU=false;
					/**the immediate `TU` after `state`. the reason for this is a synchronization issue,
						i.e. it must be waited until both catcher and catchee transited to the second frame
						and it is not known at the point of `frame` event, due to different scheduling.
					 */

					//injury
					if( $.frame.D.cpoint.injury)
					{
						$.catching.hit( $.frame.D.cpoint, $, {x:$.ps.x,y:$.ps.y,z:$.ps.z}, null);
						$.trans.inc_wait(1, 10, 99); //lock until frame transition
					}
					//cover
					var cover = GC.default.cpoint.cover;
					if( $.frame.D.cpoint.cover!==undefined) cover=$.frame.D.cpoint.cover;
					if( cover===0 || cover===10 )
						$.ps.zz=1;
					else
						$.ps.zz=-1;

					if( $.frame.D.cpoint.dircontrol===1)
					{
						if($.con.state.left) $.switch_dir_fun('left');
						if($.con.state.right) $.switch_dir_fun('right');
					}
				}
			}
			break; //TU
			
			case 'post_combo':
				$.statemem.counter--;
				if( $.statemem.counter<=0)
				if( !($.frame.N===122 && $.statemem.attacks===4)) //let it finish the 5th punch
				if( $.frame.N===121 || $.frame.N===122)
				{
					$.catching.caught_release();
					$.trans.frame(999,15);
				}
			break;

			case 'combo':
			switch(K)
			{
				case 'att':
					if( $.frame.N===121)
					{
						var dx = $.con.state.left !== $.con.state.right;
						var dy = $.con.state.up   !== $.con.state.down;
						if( (dx || dy) && $.frame.D.cpoint.taction)
						{
							var tac = $.frame.D.cpoint.taction;
							if( tac<0)
							{	//turn myself around
								$.switch_dir_fun($.ps.dir==='right'?'left':'right'); //toogle dir
								$.trans.frame(-tac, 10);
							}
							else
							{
								$.trans.frame(tac, 10);
							}
							var nextframe=$.data.frame[$.trans.next()];
							$.catching.caught_throw( nextframe.cpoint, $.dirv());
							$.statemem.counter+=10;
						}
						else if($.frame.D.cpoint.aaction)
							$.trans.frame($.frame.D.cpoint.aaction, 10);
						else
							$.trans.frame(122, 10);
					}
				return 1; //always return true so that `att` is not re-fired next frame
				case 'jump':
					if( $.frame.N===121)
					if($.frame.D.cpoint.jaction)
					{
						$.trans.frame($.frame.D.cpoint.jaction, 10);
						return 1;
					}
				break;
			}
			break;
		}},

		'10':function(event,K) //being caught
		{	var $=this;
			switch (event) {

			case 'state_exit':
				$.catching=null;
				$.caught_b_holdpoint=null;
				$.caught_b_cpoint=null;
				$.caught_b_adir=null;
				$.caught_throwz=null;
			break;

			case 'frame':
				$.statemem.frameTU=true;
				$.trans.set_wait(99, 10, 99); //lock until frame transition
			break;

			case 'TU':
				if( $.frame.N===135) //to be lifted against gravity
				{
					$.ps.vy=0;
				}
				
				if( $.caught_cpointkind()===2 &&
				$.catching && $.catching.caught_cpointkind()===1 )
				{	//really being caught
					if( $.statemem.frameTU)
					{	$.statemem.frameTU=false; //the immediate `TU` after `frame`

						var holdpoint=$.caught_b_holdpoint;
						var cpoint=$.caught_b_cpoint;
						var adir=$.caught_b_adir;

						if( cpoint.vaction)
							$.trans.frame(cpoint.vaction, 20);

						if( cpoint.throwvz !== GC.unspecified)
						{	//I am being thrown!
							var dvx=cpoint.throwvx, dvy=cpoint.throwvy, dvz=cpoint.throwvz;
							if( dvx !==0) $.ps.vx = (adir==='right'?1:-1)* dvx;
							if( dvy !==0) $.ps.vy = dvy;
							if( dvz !==0) $.ps.vz = dvz * $.caught_throwz;

							//impulse
							$.mech.set_pos(
								$.ps.x + $.ps.vx*2.5,
								$.ps.y + $.ps.vy*2,
								$.ps.z + $.ps.vz );
						}
						else
						{
							if( cpoint.dircontrol===undefined)
							{
								if( cpoint.cover && cpoint.cover>=10)
									$.switch_dir_fun(adir); //follow dir of catcher
								else //default cpoint cover
									$.switch_dir_fun(adir==='left'?'right':'left'); //face the catcher

								$.mech.coincideXZ(holdpoint,$.mech.make_point($.frame.D.cpoint));
							}
							else
							{
								$.mech.coincideXY(holdpoint,$.mech.make_point($.frame.D.cpoint));
							}
						}
					}
				}
				else
				{
					if( $.catching)
						$.trans.frame(212, 10);
				}
			break;
		}},

		'11':function(event,K) //injured
		{	var $=this;
			switch (event) {
			case 'state_entry':
				$.trans.inc_wait(0, 20); //set lock only
			break;
			case 'frame':
				switch($.frame.N)
				{
					case 221: case 223: case 225:
						$.trans.set_next(999);
					break;
					case 220: case 222: case 224: case 226:
						//$.trans.inc_wait(0, 20, 99); //lock until frame transition
					break;
				}
			break;
		}},

		'12':function(event,K) //falling
		{	var $=this;
			switch (event) {
			case 'frame':
				if( $.effect.dvy <= 0)
				switch ($.frame.N)
				{
					case 180:
						$.trans.set_next(181);
						$.trans.set_wait(1);
						break;
					case 181:
						//console.log('y:'+$.ps.y+', vy:'+$.ps.vy+', vx:'+$.ps.vx);
						$.trans.set_next(182);
						var vy = $.ps.vy>0?$.ps.vy:-$.ps.vy;
							 if( 0<=vy && vy<=4)
							$.trans.set_wait(2);
						else if( 4<vy && vy<7)
							$.trans.set_wait(3);
						else if( 7<=vy)
							$.trans.set_wait(4);
						break;
					case 182:
						$.trans.set_next(183);
						break;
					//
					case 186:
						$.trans.set_next(187);
						break;
					case 187:
						$.trans.set_next(188);
						break;
					case 188:
						$.trans.set_next(189);
						break;
				}
				else
				switch ($.frame.N)
				{
					case 180:
						$.trans.set_next(185);
						$.trans.set_wait(1);
						break;
					case 186:
						$.trans.set_next(191);
						break;
				}
			break;

			case 'fell_onto_ground':
			case 'fall_onto_ground':
				var ps=$.ps;
				//console.log('speed:'+$.mech.speed()+', vy:'+ps.vy);
				if( $.mech.speed() > GC.character.bounceup.limit.xy ||
					ps.vy > GC.character.bounceup.limit.y)
				{
					ps.vy = -GC.character.bounceup.y;
					ps.vx *= GC.character.bounceup.factor.x;
					ps.vz *= GC.character.bounceup.factor.z;
					if( 180 <= $.frame.N && $.frame.N <= 185)
						return 185;
					if( 186 <= $.frame.N && $.frame.N <= 191)
						return 191;
				}
				else
				{
					if( 180 <= $.frame.N && $.frame.N <= 185)
						return 230; //next frame
					if( 186 <= $.frame.N && $.frame.N <= 191)
						return 231;
				}
				if( $.caught_throwinjury)
				{
					$.health.hp -= $.caught_throwinjury;
					$.caught_throwinjury = null;
				}
			break;
		}},

		'14':function(event,K) //lying
		{	var $=this;
			switch (event) {
			case 'state_entry':
				$.health.fall=0;
				$.health.bdefend=0;
			break;
		}},

		'15':function(event,K) //stop_running, crouch, crouch2, dash_attack, light_weapon_thw, heavy_weapon_thw, heavy_stop_run
		{	var $=this;
			switch (event) {

			case 'frame':
				switch( $.frame.N)
				{
				case 19: //heavy_stop_run
					if( $.hold.obj && $.hold.obj.type==='heavyweapon')
						$.trans.set_next(12);
				break;
				case 215:
					$.trans.inc_wait(-1);
				break;
				case 219: //crouch after rowing
					switch( $.frame.PN) //previous frame number
					{
					case 105: //after rowing
						$.mech.unit_friction();
					break;
					case 216: //after dash
					case 90: case 91: //dash attack
						$.trans.inc_wait(-1);
					break;
					}
				break;
				}
			break;

			case 'TU':
				if( $.frame.N===219 && $.frame.PN===216)
					$.mech.unit_friction();
			break;

			case 'fall_onto_ground':
				$.mech.linear_friction(
					util.lookup(GC.friction.fell,$.ps.vx),
					util.lookup(GC.friction.fell,$.ps.vz)
				);
			break;

			case 'combo':
				if( $.frame.N===215) //only after jumping
				{
					if( K==='def')
					{
						$.trans.frame(102, 10);
						return 1;
					}
					if( K==='jump')
					{
						var dx=0;
						if($.con.state.left)  dx-=1;
						if($.con.state.right) dx+=1;
						if( dx)
						{
							$.trans.frame(213, 10);
							$.switch_dir_fun(dx===1?'right':'left');
						}
						else
						{
							$.trans.inc_wait(2, 10, 99); //lock until frame transition
							$.trans.set_next(210, 10);
						}
						return 1;
					}
				}
			break;
		}},

		'16':function(event,K) //injured 2 (dance of pain)
		{	var $=this;
			switch (event) {
		}},

		'x':function(event,K)
		{	var $=this;
			switch (event) {
		}}
	};

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

	//inherit livingobject
	function character(config,data,thisID)
	{
		var $=this;
		// chain constructor
		livingobject.call(this,config,data,thisID);
		$.type = 'character';
		$.states = states;
		$.states_switch_dir = states_switch_dir;
		$.setup();
	}
	character.prototype = new livingobject();
	character.prototype.constructor = character;

	/** @protocol caller hits callee
		@param ITR the itr object in data
		@param att reference of attacker
		@param attps position of attacker
		@param rect the hit rectangle where visual effects should appear
	 */
	character.prototype.hit=function(ITR, att, attps, rect)
	{
		var $=this;
		var accepthit=false;

		if( $.cur_state()===10) //being caught
		{
			if( $.catching.caught_cpointhurtable())
			{
				$.itr.lasthit=0; accepthit=true;
				fall();
			}
			if( $.catching.caught_cpointhurtable()===0 && $.catching!==att)
			{	//I am unhurtable as defined by catcher,
				//and I am hit by attacker other than catcher
			}
			else
			{
				$.itr.lasthit=0; accepthit=true;
				$.health.hp -= Math.abs(ITR.injury);
				if( ITR.injury>0)
				{
					$.effect_create(0, GC.effect.duration);
					var tar;
					if( ITR.vaction)
						tar=ITR.vaction;
					else
						tar=(attps.x > $.ps.x)===($.ps.dir==='right') ? $.frame.D.cpoint.fronthurtact : $.frame.D.cpoint.backhurtact;
					$.trans.frame(tar, 20);
				}
			}
		}
		else if( $.cur_state()===14)
		{
			//lying
		}
		else
		{
			//kind 0 ITR
			$.itr.lasthit=0; accepthit=true;
			$.effect.dvx = ITR.dvx ? att.dirh()*(ITR.dvx-1):0; //magic compensation
			$.effect.dvy = ITR.dvy ? ITR.dvy:0;
			var effectnum = ITR.effect!==undefined?ITR.effect:GC.default.effect.num;

			if( $.cur_state()===7 &&
			    (attps.x > $.ps.x)===($.ps.dir==='right')) //attacked in front
			{
				if( ITR.injury)	$.health.hp -= GC.defend.injury.factor * ITR.injury;
				if( ITR.bdefend) $.health.bdefend += ITR.bdefend;
				if( $.health.bdefend > GC.defend.break_limit)
				{	//broken defence
					$.trans.frame(112, 20);
					if( $.effect.dvx)
						$.effect.dvx -= util.lookup(GC.defend.break_absorb,$.effect.dvx);
				}
				else
				{	//an effective defence
					$.trans.frame(111, 20);
				}
			}
			else
			{
				if( $.hold.obj && $.hold.obj.type==='heavyweapon')
					$.drop_weapon(0,0);
				if( ITR.injury)	$.health.hp -= ITR.injury; //injury
				$.health.bdefend = 45; //lose defend ability immediately
				fall();
			}

			//effect
			var vanish = GC.effect.duration-1;
			switch( $.trans.next())
			{
				case 111: vanish=3; break;
				case 112: vanish=4; break;
			}
			$.effect_create( effectnum, vanish);
			$.visualeffect_create( effectnum, rect, (attps.x < $.ps.x), ($.health.fall>0?1:2));
		}

		function fall()
		{
			if( ITR.fall!==undefined)	$.health.fall += ITR.fall;
				else	$.health.fall += GC.default.fall.value;
			var fall=$.health.fall;
			if ( 0<fall && fall<=20)
				$.trans.frame(220, 20);
			else if (20<fall && fall<=40 && $.ps.y<0)
				falldown();
			else if (20<fall && fall<=40)
				$.trans.frame($.match.random()<0.5? 222:224, 20);
			else if (40<fall && fall<=60)
				$.trans.frame(226, 20);
			else if (GC.fall.KO<fall)
				falldown();
		}
		function falldown()
		{
			if( ITR.dvy===undefined) $.effect.dvy = GC.default.fall.dvy;
			$.health.fall=0;
			var front = (attps.x > $.ps.x)===($.ps.dir==='right'); //attacked in front
				 if( front && ITR.dvx < 0 && ITR.bdefend>=60)
				$.trans.frame(186, 20);
			else if( front)
				$.trans.frame(180, 20);
			else if(!front)
				$.trans.frame(186, 20);

			if( $.proper( $.effect_id(effectnum),'drop_weapon'))
				$.drop_weapon($.effect.dvx, $.effect.dvy);
		}
		return accepthit;
	}

	//pre interaction is based on `itr` of next frame
	character.prototype.pre_interaction=function()
	{
		var $=this;
		var ITR_LIST=Futil.make_array($.trans.next_frame_D().itr);

		for( var i in ITR_LIST)
		{
			var ITR=ITR_LIST[i]; //the itr tag in data
			//first check for what I have got into intersect with
			var vol=$.mech.volume(ITR);
			var hit= $.scene.query(vol, $, {tag:'body'});

			switch (ITR.kind)
			{
			case 1: //catch
			case 3: //super catch
				for( var t in hit)
				{
					if( hit[t].team !== $.team) //only catch other teams
					if( hit[t].type==='character') //only catch characters
					if( (ITR.kind===1 && hit[t].cur_state()===16) //you are in dance of pain
					 || (ITR.kind===3)) //super catch
					if( $.itr_rest_test( hit[t].uid, ITR))
					{
						var dir = hit[t].caught_a(ITR,$,{x:$.ps.x,y:$.ps.y,z:$.ps.z});
						if( dir)
						{
							$.itr_rest_update( hit[t].uid, ITR);
							if( dir==='front')
								$.trans.frame(ITR.catchingact[0], 10);
							else
								$.trans.frame(ITR.catchingact[1], 10);
							$.catching=hit[t];
							break;
						}
					}
				}
			break;

			case 7: //pick weapon easy
				if( !$.con.state.att)
					break; //only if att key is down
			case 2: //pick weapon
				for( var t in hit)
				{
					if( hit[t].type==='lightweapon' || hit[t].type==='heavyweapon')
					if( hit[t].pick($))
					{
						$.itr_rest_update( hit[t].uid, ITR);
						if( ITR.kind===2)
						{
							if( hit[t].type==='lightweapon')
								$.trans.frame(115, 10);
							else if( hit[t].type==='heavyweapon')
								$.trans.frame(116, 10);
						}
						$.hold.obj = hit[t];
						$.hold.id= $.hold.obj.id;
						break;
					}
				}
			break;
			}
		}
	}

	//post interaction is based on `itr` of current frame
	character.prototype.post_interaction=function()
	{
		var $=this;
		var ITR_LIST=Futil.make_array($.frame.D.itr);

		//TODO
		/*某葉: 基本上會以先填入的itr為優先， 但在範圍重複、同effect的情況下的2組itr，
			攻擊時，會隨機指定其中一個itr的效果。
			（在範圍有部份重複或是完全重複的部份才有隨機效果。）*/

		for( var i in ITR_LIST)
		{
			var ITR=ITR_LIST[i]; //the itr tag in data
			//first check for what I have got into intersect with
			var vol=$.mech.volume(ITR);
			var hit= $.scene.query(vol, $, {tag:'body'});

			switch (ITR.kind)
			{
			case 0: //normal attack
				for( var t in hit)
				{
					var team_allow=true;
					if( hit[t].type==='character' && hit[t].team===$.team)
						team_allow=false; //only attack characters of other teams

					if( team_allow)
					if( $.itr_rest_test( hit[t].uid, ITR))
					if( hit[t].hit(ITR,$,{x:$.ps.x,y:$.ps.y,z:$.ps.z},vol))
					{	//hit you!
						$.itr_rest_update( hit[t].uid, ITR);
						//stalls
						switch ($.frame.N)
						{
							case 86: case 87:
								$.effect_stuck(2);
								$.trans.inc_wait(1);
								break;
							case 91:
								$.effect_stuck(2);
								break;
							default:
								$.effect_stuck(GC.itr.hit_stall);
						}

						//attack one enemy only
						if( ITR.arest) break;
					}
				}
			break;
			}
		}
	}

	character.prototype.wpoint=function()
	{
		var $=this;
		if( $.hold.obj)
		if( $.frame.D.wpoint)
		{
			var act = $.hold.obj.act($, $.frame.D.wpoint, $.mech.make_point($.frame.D.wpoint));
			if( act.thrown)
			{
				$.hold.obj=null;
				$.hold.id=0;
			}
			if( act.hit!==null && act.hit!==undefined)
			{
				$.itr_rest_update( act.hit, act);
				//stalls
				$.trans.inc_wait(GC.itr.hit_stall, 10);
			}
		}
	}

	character.prototype.drop_weapon=function(dvx,dvy)
	{
		var $=this;
		if( $.hold.obj)
		{
			$.hold.obj.drop(dvx,dvy);
			$.hold.obj=null;
			$.hold.id=0;
		}
	}

	character.prototype.vol_itr=function(kind)
	{
		var $=this;
		if( $.frame.D.itr)
			return $.mech.body(
				$.frame.D.itr, //make volume from itr
				function (obj) //filter
				{
					return obj.kind==kind; //use type conversion comparison
				}
			);
		else
			return [];
	}

	/** inter-living objects protocol: catch & throw
		for details see http://f-lf2.blogspot.hk/2013/01/inter-living-object-interactions.html
	 */
	character.prototype.caught_a=function(ITR, att, attps)
	{	//this is called when the catcher has an ITR with kind: 1
		var $=this;
		if( $.cur_state()===16) //I am in dance of pain
		{
			if( (attps.x > $.ps.x)===($.ps.dir==='right'))
				$.trans.frame(ITR.caughtact[0], 20);
			else
				$.trans.frame(ITR.caughtact[1], 20);
			$.health.fall=0;
			$.catching=att;
			$.drop_weapon();
			return (attps.x > $.ps.x)===($.ps.dir==='right') ? 'front':'back';
		}
	}
	character.prototype.caught_b=function(holdpoint,cpoint,adir)
	{	//this is called when the catcher has a cpoint with kind: 1
		var $=this;
		$.caught_b_holdpoint=holdpoint;
		$.caught_b_cpoint=cpoint;
		$.caught_b_adir=adir;
		//store this info and process it at TU
	}
	character.prototype.caught_cpointkind=function()
	{
		var $=this;
		return $.frame.D.cpoint ? $.frame.D.cpoint.kind:0;
	}
	character.prototype.caught_cpointhurtable=function()
	{
		var $=this;
		if( $.frame.D.cpoint && $.frame.D.cpoint.hurtable!==undefined)
			return $.frame.D.cpoint.hurtable;
		else
			return GC.default.cpoint.hurtable;
	}
	character.prototype.caught_throw=function(cpoint,throwz)
	{	//I am being thrown
		var $=this;
		if( cpoint.vaction!==undefined)
			$.trans.frame(cpoint.vaction, 20);
		else
			$.trans.frame(GC.default.cpoint.vaction, 20);
		$.caught_throwinjury=cpoint.throwinjury;
		$.caught_throwz=throwz;
	}
	character.prototype.caught_release=function()
	{
		var $=this;
		$.catching=0;
		$.trans.frame(181,20);
		$.effect.dvx=3; //magic number
		$.effect.dvy=-3;
		$.effect.timein=-1;
		$.effect.timeout=0;
	}

	return character;
});
