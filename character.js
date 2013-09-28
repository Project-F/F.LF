/**	a LF2 character
 */

define(['LF/livingobject','LF/global','F.core/combodec','F.core/util','LF/util'],
function(livingobject, Global, Fcombodec, Futil, util)
{
	var GC=Global.gameplay;

	var states=
	{
		'generic':function(event,K)
		{	var $=this;
			switch (event) {
			case 'TU':
				if( $.state_update('post_interaction'))
					; //do nothing
				else
					$.post_interaction();

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
							util.lookup_abs(GC.friction.fell,ps.vx),
							util.lookup_abs(GC.friction.fell,ps.vz)
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

				//health reduce
				if( $.frame.D.mp)
				{
					if( $.data.frame[$.frame.PN].next===$.frame.N)
					{	//if this frame is transited by next of previous frame
						if( $.frame.D.mp<0)
						{
							$.health.mp += $.frame.D.mp;
							if( $.health.mp<0)
							{
								$.health.mp = 0;
								$.trans.frame($.frame.D.hit_d);
							}
						}
					}
					else
					{
						var dmp = $.frame.D.mp%1000,
							dhp = Math.floor($.frame.D.mp/1000)*10;
						$.health.mp -= dmp;
						$.health.hp -= dhp;
					}
				}
				//health recover
				//http://lf2.wikia.com/wiki/Health_and_mana
				if( $.match.time.t%12===0)
				if( $.health.hp < $.health.hp_bound)
				{
					$.health.hp++;
				}
				if( $.match.time.t%3===0)
				if( $.health.mp < $.health.mp_full)
				{
					$.health.mp+= 1+Math.floor((500-($.health.hp<500?$.health.hp:500))/100);
				}
				//recovery
				if( $.health.fall>0) $.health.fall += GC.recover.fall;
				if( $.health.bdefend>0) $.health.bdefend += GC.recover.bdefend;
			break;
			case 'transit':
				//dynamics: position, friction, gravity
				$.mech.dynamics(); //any further change in position will not be updated on screen until next TU
				$.wpoint.call($); //my holding weapon following my change
			break;
			case 'combo':
				switch(K)
				{
				case 'left': case 'right':
				case 'run':
				break;
				default:
					var tag = Global.combo_tag[K];
					if( tag && $.frame.D[tag])
					{
						if( !$.id_update('combo',K,tag))
						{
							$.trans.frame($.frame.D[tag], 11);
							return 1;
						}
					}
				}
			break;
			case 'post_combo': //after state specific processing
				$.pre_interaction();
			break;
			case 'state_exit':
				if( $.combo_buffer)
					switch ($.combo_buffer)
					{
						case 'def': case 'jump': case 'att': case 'run':
							//basic actions cannot transfer across states
							$.combo_buffer = null;
						break;
					}
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
				case 'jump': case null:
					var dx = $.con.state.left !== $.con.state.right,
						dz = $.con.state.up   !== $.con.state.down;
					if( dx || dz)
					{
						//apply movement
						if( $.hold.obj && $.hold.obj.type==='heavyweapon')
						{
							if( dx) $.ps.vx=$.dirh()*($.data.bmp.heavy_walking_speed);
							$.ps.vz=$.dirv()*($.data.bmp.heavy_walking_speedz);
						}
						else
						{
							if( K!=='jump') //walk
								$.trans.frame(5); //TODO: select randomly from 5,6,7,8
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

			var dx=0,dz=0;
			if($.con.state.left)  dx-=1;
			if($.con.state.right) dx+=1;
			if($.con.state.up)    dz-=1;
			if($.con.state.down)  dz+=1;
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
					if( !dx && !dz && !$.statemem.transed)
					{
						$.statemem.transed=true;
						$.trans.set_next(999); //go back to standing
						$.trans.set_wait(1,1,2);
					}
				}
			break;

			case 'state_entry':
				$.trans.set_wait(0);
			break;

			case 'combo':
				if( dx!==0 && dx!==$.dirh())
					$.switch_dir_fun($.ps.dir==='right'?'left':'right'); //toogle dir
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
						return 1;
					}
				break;

				case 'def':
					if( $.hold.obj && $.hold.obj.type==='heavyweapon')
						return 1;
					$.trans.frame(102, 10);
				return 1;

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
				return 1;

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

				if( !$.id_update('state3_frame'))
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
				if( $.frame.PN===80 || $.frame.PN===81) //after jump attack
					$.statemem.attlock=2;
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
				if( $.statemem.attlock)
					$.statemem.attlock--;
			break;

			case 'combo':
				if( (K==='att' || $.con.state.att) && !$.statemem.attlock)
				{
					/** a transition to jump_attack can only happen after entering frame 212.
					if an 'att' key event arrives while in frame 210 or 211,
					the jump attack event will be pended and be performed on 212
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
						if( K==='att')
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
				if( K==='att' || $.con.state.att)
				{
					if( $.proper('dash_backattack') || //back attack
						$.dirh()===($.ps.vx>0?1:-1)) //if not turning back
					{
						if( $.hold.obj && $.proper($.hold.id,'attackable')) //light weapon attack
							$.trans.frame(40, 10);
						else
							$.trans.frame(90, 10);
						$.switch_dir=false;
						if( K==='att')
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
				if( $.frame.N>=102 && $.frame.N<=105)
				{
					//rowing on ground; to maintain the velocity against friction
					$.ps.vx = $.dirh() * $.frame.D.dvx;
					$.ps.vz = $.dirv() * $.frame.D.dvz;
				}
				else if( $.frame.N===100 || $.frame.N===108)
				{
					$.ps.vy = 0;
				}
			break;
			
			case 'frame':
				if( $.frame.N===100 || $.frame.N===108)
				{
					$.trans.set_wait(1);
				}
			break;
			
			case 'fall_onto_ground':
				if( $.frame.N===101 || $.frame.N===109)
					return 215;
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
						$.trans.set_wait(util.lookup_abs(GC.fall.wait180,$.effect.dvy));
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
				if( $.caught_throwinjury>0)
				{
					$.injury(-$.caught_throwinjury);
					$.caught_throwinjury = null;
				}
				var ps=$.ps;
				//console.log('speed:'+$.mech.speed()+', vx:'+ps.vx+', vy:'+ps.vy);
				if( $.mech.speed() > GC.character.bounceup.limit.xy ||
					ps.vy > GC.character.bounceup.limit.y)
				{
					$.mech.linear_friction(
						util.lookup_abs(GC.character.bounceup.absorb,ps.vx),
						util.lookup_abs(GC.character.bounceup.absorb,ps.vz)
					);
					ps.vy = -GC.character.bounceup.y;
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
			break;
			
			case 'combo':
				if( $.frame.N===182 ||
					$.frame.N===188)
				{
					if( K==='jump')
					{
						if( $.frame.N===182)
							$.trans.frame(100);
						else
							$.trans.frame(108);
						$.ps.vx = 5;
						if( $.ps.vz) $.ps.vz = 2;
						return 1;
					}
				}
			return 1; //always return true so that `jump` is not re-fired next frame
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
				case 219: //crouch
					if( !$.id_update('state15_crouch'))
					switch( $.frame.PN) //previous frame number
					{
					case 105: //after rowing
						$.mech.unit_friction();
					break;
					case 216: //after dash
					case 90: case 91: case 92: //dash attack
						$.trans.inc_wait(-1);
					break;
					}
				break;
				}
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
						if( dx || $.ps.vx!==0)
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

		'301':function(event,K) //deep specific
		{	var $=this;
			switch (event) {
			case 'frame':
				$.statemem.curvx = $.ps.vx;
				if( $.statemem.lastvx)
					$.ps.vx = $.statemem.lastvx;
				else
					$.statemem.lastvx = $.ps.vx;
				switch ($.frame.N)
				{
					case 294: case 295: case 297: case 298: case 299: 
					case 301: case 302: case 303: 
						$.mech.linear_friction(1,0);
					break;
				}
			break;
			case 'TU':
				if( $.statemem.curvx)
				{
					$.ps.vx = $.statemem.curvx;
				}
				switch ($.frame.N)
				{
					case 294: case 297: case 301: 
						$.mech.linear_friction(1,0);
					break;
				}
				if( $.statemem.curvx)
				{
					$.statemem.lastvx = $.ps.vx;
					$.statemem.curvx = null;
				}
				$.ps.vz=$.dirv()*($.data.bmp.walking_speedz);
			break;
			case 'post_interaction':
				if( $.frame.N===291 ||
					$.frame.N===295 ||
					$.frame.N===299 )
					return 1;
			break;
			case 'hit_stall':
				$.effect_stuck(1,2);
				$.trans.inc_wait(1);
			return 1;
		}},

		'x':function(event,K)
		{	var $=this;
			switch (event) {
		}}
	};

	var idupdates =
	{
		'default':function()
		{
		},
		'1': function(event,K,tag) //deep
		{
			var $=this;
			switch (event)
			{
			case 'state3_frame':
				switch ($.frame.N)
				{
				case 266:
					$.ps.vy-=2;
				return 1;
				case 267:
					$.ps.vy-=3.7;
				return 1;
				case 268:
					$.ps.vy-=2;
				return 1;
				case 269:
					$.ps.vy-=2;
				return 1;
				}
			break;
			case 'state15_crouch':
				if( $.frame.PN>=267 && $.frame.PN<=272)
					$.trans.inc_wait(-1);
			break;
			case 'combo':
				if( tag==='hit_Fj')
				{
					if( K==='D>J' || K==='D>AJ')
						$.switch_dir_fun('right');
					else
						$.switch_dir_fun('left');
				}
			break;
			}
		}
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
		if( typeof idupdates[$.id]==='function')
			$.id_update=idupdates[$.id];
		else
			$.id_update=idupdates['default'];
		$.states_switch_dir = states_switch_dir;
		$.mech.floor_xbound = true;
		$.con = config.controller;
		if( $.con)
		{
			function combo_event(kobj)
			{
				var K=kobj.name;
				switch (K)
				{
					case 'left': case 'right':
						if( $.switch_dir)
							$.switch_dir_fun(K);
				}
				$.combo_buffer = K;
			}
			var dec_con = //combo detector
			{
				clear_on_combo: true,
				callback: combo_event //callback function when combo detected
			}
			var combo_list = [
				{ name:'left',	seq:['left'],	clear_on_combo:false},
				{ name:'right',	seq:['right'],	clear_on_combo:false},
				{ name:'up',	seq:['up'],		clear_on_combo:false},
				{ name:'down',	seq:['down'],	clear_on_combo:false},
				{ name:'def',	seq:['def'],	clear_on_combo:false},
				{ name:'jump',	seq:['jump'],	clear_on_combo:false},
				{ name:'att',	seq:['att'],	clear_on_combo:false},
				{ name:'run',	seq:['right','right'],	maxtime:9},
				{ name:'run',	seq:['left','left'],	maxtime:9}
				//plus those defined in Global.combo_list
			];
			$.combodec = new Fcombodec($.con, dec_con, combo_list.concat(Global.combo_list));
		}
		$.health.bdefend=0;
		$.health.fall=0;
		$.health.hp=$.health.hp_full=$.health.hp_bound= $.proper('hp') || GC.default.health.hp_full;
		$.health.mp_full= GC.default.health.mp_full;
		$.health.mp= GC.default.health.mp_start;
		$.trans.frame=function(next,au)
		{
			if( next===0 || next===999)
			{
				this.set_next(next,au);
				this.set_wait(0,au);
				return;
			}
			var nextF = $.data.frame[next];
			if( !nextF) return;
			var dmp=0;
			if( nextF.mp>0)
				dmp=nextF.mp%1000;
			if( $.health.mp-dmp>=0)
			{
				this.set_next(next,au);
				this.set_wait(0,au);
			}
		}
		$.setup();
	}
	character.prototype = new livingobject();
	character.prototype.constructor = character;

	//to emit a combo event
	character.prototype.combo_update = function()
	{		
		/**	different from `state_update`, current state receive the combo event first,
			and only if it returned falsy result, the combo event is passed to the generic state.
			if the combo event is not consumed, it is stored in state memory,
			resulting in 1 combo event being emited every frame until it is being handled or
			overridden by a new combo event.
			a combo event is emitted even when there is no combo, in such case `K=null`
		 */
		var $=this;
		var K = $.combo_buffer;
		if(!K) K=null;

		var tar1=$.states[$.frame.D.state];
		if( tar1) var res1=tar1.call($,'combo',K);
		var tar2=$.states['generic'];
		if(!res1)
		if( tar2) var res2=tar2.call($,'combo',K);
		if( tar1) tar1.call($,'post_combo');
		if( tar2) tar2.call($,'post_combo');
		if( res1 || res2 ||
			K==='left' || K==='right' || K==='up' || K==='down') //dir combos are not persistent
			$.combo_buffer = null;
	}

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

		var ef_dvx=0, ef_dvy=0, dhp=0;
		if( $.cur_state()===10) //being caught
		{
			if( $.catching.caught_cpointhurtable())
			{
				accepthit=true;
				fall();
			}
			if( $.catching.caught_cpointhurtable()===0 && $.catching!==att)
			{	//I am unhurtable as defined by catcher,
				//and I am hit by attacker other than catcher
			}
			else
			{
				accepthit=true;
				dhp -= Math.abs(ITR.injury);
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
			accepthit=true;
			var compen = $.ps.y===0? 1:0; //magic compensation
			ef_dvx = ITR.dvx ? att.dirh()*(ITR.dvx-compen):0;
			ef_dvy = ITR.dvy ? ITR.dvy:0;
			var effectnum = ITR.effect!==undefined?ITR.effect:GC.default.effect.num;

			if( $.cur_state()===7 &&
			    (attps.x > $.ps.x)===($.ps.dir==='right')) //attacked in front
			{
				if( ITR.injury)	dhp -= GC.defend.injury.factor * ITR.injury;
				if( ITR.bdefend) $.health.bdefend += ITR.bdefend;
				if( $.health.bdefend > GC.defend.break_limit)
				{	//broken defence
					$.trans.frame(112, 20);
				}
				else
				{	//an effective defence
					$.trans.frame(111, 20);
				}
				if( ef_dvx) ef_dvx += (ef_dvx>0?-1:1) * util.lookup_abs(GC.defend.absorb,ef_dvx);
				ef_dvy = 0;
			}
			else
			{
				if( $.hold.obj && $.hold.obj.type==='heavyweapon')
					$.drop_weapon(0,0);
				if( ITR.injury)	dhp -= ITR.injury; //injury
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
			$.effect_create( effectnum, vanish, ef_dvx, ef_dvy);
			$.visualeffect_create( effectnum, rect, (attps.x < $.ps.x), ($.health.fall>0?1:2));
		}
		function fall()
		{
			if( ITR.fall!==undefined)
				$.health.fall += ITR.fall;
			else
				$.health.fall += GC.default.fall.value;
			var fall=$.health.fall;
			if ( 0<fall && fall<=20)
				$.trans.frame(220, 20);
			else if (20<fall && fall<=40 && $.ps.y<0)
				falldown();
			else if (20<fall && fall<=30)
				$.trans.frame(222, 20);
			else if (30<fall && fall<=40)
				$.trans.frame(224, 20);
			else if (40<fall && fall<=60)
				$.trans.frame(226, 20);
			else if (GC.fall.KO<fall)
				falldown();
		}
		function falldown()
		{
			if( ITR.dvy===undefined) ef_dvy = GC.default.fall.dvy;
			$.health.fall=0;
			var front = (attps.x > $.ps.x)===($.ps.dir==='right'); //attacked in front
				 if( front && ITR.dvx < 0 && ITR.bdefend>=60)
				$.trans.frame(186, 20);
			else if( front)
				$.trans.frame(180, 20);
			else if(!front)
				$.trans.frame(186, 20);

			if( $.proper( $.effect_id(effectnum),'drop_weapon'))
				$.drop_weapon(ef_dvx, ef_dvy);
		}

		if( dhp<0)
			$.injury(dhp);
		//if( accepthit) $.log('hit: next='+$.trans.next());
		return accepthit;
	}
	character.prototype.injury=function(dhp)
	{
		this.health.hp+=dhp;
		this.health.hp_bound+=Math.ceil(dhp*1/3);
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
						if( $.state_update('hit_stall'))
							; //do nothing
						else
							switch ($.frame.N)
							{
								case 86: case 87:
									$.effect_stuck(0,2);
									$.trans.inc_wait(1);
									break;
								case 91:
									$.effect_stuck(0,2);
									$.trans.inc_wait(1);
									break;
								default:
									$.effect_stuck(0,GC.default.itr.hit_stall);
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
				$.trans.inc_wait(GC.default.itr.hit_stall, 10);
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
		if( $.caught_throwinjury===GC.unspecified)
			$.caught_throwinjury = GC.default.itr.throw_injury;
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
