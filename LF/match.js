/*\
 * match
 * a match hosts a game.
 * a match is a generalization above game modes (e.g. VSmode, stagemode, battlemode)
\*/

define(['core/util','core/controller','LF/sprite-select',
'LF/network','LF/factories','LF/scene','LF/background','LF/AI','third_party/random','LF/util',
'LF/global'],
function(Futil,Fcontroller,Fsprite,
network,factory,Scene,Background,AI,Random,util,
Global)
{
	var GA=Global.application;
	/*\
	 * match
	 [ class ]
	 |	config =
	 |	{
	 |  manager,//the game manager
	 |	state,  //the state machine handling various events in a match
	 |	package	//the content package
	 |	}
	\*/
	function match(config)
	{
		var $=this;
		$.manager = config.manager;
		$.state = config.state;
		$.data = config.package.data;
		$.sound = config.manager.sound;
		$.spec = $.data.properties.data;
		$.time;
	}

	match.prototype.create=function(setting)
	{
		var $=this;
		var object_ids=[],
			AI_ids=[];
		for( var i=0; i<setting.player.length; i++)
		{
			//(lazy) now load all characters and associated data files
			object_ids.push(setting.player[i].id);
			object_ids = object_ids.concat(Futil.extract_array(util.select_from($.data.object,{id:setting.player[i].id}).pack,'id').id);
			if( setting.player[i].controller.type==='AIscript')
				AI_ids.push(setting.player[i].controller.id);
		}
		if( !setting.set) setting.set={};

		$.gameover_state = false;
		$.randomseed = $.new_randomseed();
		$.create_scenegraph();
		$.control = $.create_controller(setting.control);
		$.functionkey_control = setting.control;
		if( $.functionkey_control &&
			$.functionkey_control.restart)
			$.functionkey_control.restart();
		if( $.manager.panel_layer)
		{
			$.panel=[];
			for( var i=0; i<8; i++) $.panel[i]={};
		}
		$.overlay_message('loading');
		$.tasks = []; //pending tasks
		$.AIscript = [];
		if( $.manager.summary)
			$.manager.summary.hide();
		$.manager.canvas.render();

		var already = false;
		this.data.load({
			'object':object_ids,
			'background':setting.background?[setting.background.id]:[],
			'AI':AI_ids
		},function()
		{	//when all necessary data files are loaded
			$.create_background(setting.background);
			$.create_effects();
			if( setting.player)
				$.create_characters(setting.player);
			if( setting.set.weapon)
				$.drop_weapons(setting.set.weapon);

			Fsprite.masterconfig_set('onready',onready);
			setTimeout(function(){onready()},8000); //assume it is ready after 8 seconds
		});
		function onready()
		{
			if( !already)
			{	//all loading finished
				already = true;
				if( $.manager.overlay_mess)
					$.manager.overlay_mess.hide();
				if( setting.set.demo_mode)
				{
					$.demo_mode=true;
					$.overlay_message('demo');
				}
				$.create_timer();
			}
		}
	}

	match.prototype.destroy=function()
	{
		var $=this;
		$.time.paused=true;
		$.destroyed=true;
		network.clearInterval($.time.timer);

		//destroy all objects
		$.for_all('destroy');
		$.background.destroy();
		if( $.panel)
		for( var i=0; i<$.panel.length; i++)
		{
			if( $.panel[i].hp)
			{
				$.panel[i].hp.remove();
				$.panel[i].hp_bound.remove();
				$.panel[i].mp.remove();
				$.panel[i].mp_bound.remove();
				$.panel[i].spic.remove();
			}
		}
	}

	match.prototype.log=function(mes)
	{
		console.log(this.time.t+': '+mes);
	}

	match.prototype.create_object=function(opoint, parent)
	{
		var $=this;
		$.tasks.push({
			task: 'create_object',
			parent: parent,
			opoint: opoint,
			team: parent.team,
			pos: parent.mech.make_point(opoint),
			z: parent.ps.z,
			dir: parent.ps.dir,
			dvz: parent.dirv()*2
		});
	}

	match.prototype.destroy_object=function(obj)
	{
		var $=this;
		$.tasks.push({
			task: 'destroy_object',
			obj: obj
		});
	}

	//all methods below are considered private

	match.prototype.create_scenegraph=function()
	{
		var $=this;
		$.scene = new Scene();
		for( var objecttype in factory)
			$[objecttype] = {};
	}

	match.prototype.create_timer=function()
	{
		var $=this;
		$.time =
		{
			t:0,
			paused: false,
			timer: null,
			$fps: util.div('fps')
		};
		if( !$.time.$fps) $.calculate_fps = function(){};
		$.time.timer = network.setInterval( function(){return $.frame();}, 1000/Global.gameplay.framerate);
	}

	match.prototype.frame=function()
	{
		var $=this;
		if( $.control)
			$.control.fetch();
		if( !$.time.paused || $.time.paused==='F2')
		{
			for( var i in $.character)
			{
				$.character[i].con.fetch();
				$.character[i].combodec.frame();
			}
			if( $.destroyed)
				return;
			$.TU_trans();
			if( $.time.t===0)
				$.match_event('start');
			$.time.t++;
			$.manager.canvas.render();
			$.calculate_fps();
			
			if( $.time.paused==='F2')
				$.time.paused=true;
		}
		else
		{
			if( $.time.$fps)
				$.time.$fps.value='paused';
		}
		return $.game_state();
	}
	
	match.prototype.game_state=function()
	{
		var $=this;
		var d={};
		d.time = $.time.t;
		for( var i in $.character)
		{
			var c = $.character[i];
			d[i] = [c.ps.x,c.ps.y,c.ps.z,c.health.hp,c.health.mp];
		}
		return d;
	}
	
	match.prototype.TU_trans=function()
	{
		var $=this;
		$.emit_event('transit');
		$.process_tasks();
		$.emit_event('TU');
		$.background.TU();
		$.sound.TU();
		$.show_hp();
		$.check_gameover();
		var AI_frameskip = 3; //AI script runs at a lower framerate, and is still very reactive
		if( $.time.t%AI_frameskip===0)
			for( var i=0; i<$.AIscript.length; i++)
				$.AIscript[i].TU();
	}

	match.prototype.match_event=function(E)
	{
		var $=this;
		if( $.state && $.state.event) $.state.event.call(this, E);
	}

	match.prototype.emit_event=function(E)
	{
		var $=this;
		$.match_event(E);
		$.for_all(E);
	}

	match.prototype.for_all=function(oper)
	{
		var $=this;
		for( var objecttype in factory)
			for( var i in $[objecttype])
				$[objecttype][i][oper]();
	}

	match.prototype.process_tasks=function()
	{
		var $=this;
		for( var i=0; i<$.tasks.length; i++)
			$.process_task($.tasks[i]);
		$.tasks.length=0;
	}
	match.prototype.process_task=function(T)
	{
		var $=this;
		switch (T.task)
		{
		case 'create_object':
			if( T.opoint.oid)
			{
				var OBJ = util.select_from($.data.object,{id:T.opoint.oid});
				if(!OBJ)
				{
					console.error('Object', T.opoint.oid, 'not exists');
					break;
				}
				var config =
				{
					match: $,
					team: T.team
				};
				var obj = new factory[OBJ.type](config, OBJ.data, T.opoint.oid);
				obj.init(T);
				var uid = $.scene.add(obj);
				$[obj.type][uid] = obj;
			}
		break;
		case 'destroy_object':
			var obj = T.obj;
			obj.destroy();
			var uid = $.scene.remove(obj);
			delete $[obj.type][uid];
		break;
		}
	}

	match.prototype.calculate_fps=function()
	{
		var $=this;
		var mul = 10;
		if( $.time.t%mul===0)
		{
			var ot=$.time.time;
			$.time.time = new Date().getTime();
			var diff = $.time.time-ot;
			$.time.$fps.value = Math.round(1000/diff*mul)+'fps';
		}
	}

	match.prototype.create_characters=function(players)
	{
		var $=this;
		var char_config =
		{
			match: $,
			controller: null,
			team: 0
		};
		for( var i=0; i<players.length; i++)
		{
			var player = players[i];
			var player_obj = util.select_from($.data.object,{id:player.id});
			var pdata = player_obj.data;
			preload_pack_images(player_obj);
			var controller = setup_controller(player);
			//create character
			var char = new factory.character(char_config, pdata, player.id);
			if( controller.type==='AIcontroller')
			{
				var AIcontroller = util.select_from($.data.AI,{id:player.controller.id}).data;
				$.AIscript.push(new AIcontroller(char,$,controller));
			}
			//positioning
			var pos=$.background.get_pos($.random(),$.random());
			char.set_pos( pos.x, pos.y, pos.z);
			var uid = $.scene.add(char);
			$.character[uid] = char;
			//pane
			if( $.panel)
				create_pane(i);
		}
		function preload_pack_images(char)
		{
			for( var j=0; j<char.pack.length; j++)
			{
				var obj = char.pack[j].data;
				if( obj.bmp && obj.bmp.file)
				{
					for( var k=0; k<obj.bmp.file.length; k++)
					{
						var file = obj.bmp.file[k];
						for( var m in file)
						{
							if( typeof file[m]==='string' && m.indexOf('file')===0)
							{
								Fsprite.preload_image(file[m]);
							}
						}
					}
				}
			}
		}
		function setup_controller(player)
		{
			var controller;
			switch (player.controller.type)
			{
				case 'AIscript':
					controller = new AI.controller();
				break;
				default:
					controller = player.controller;
					controller.child.push($);
			}
			char_config.controller = controller;
			char_config.team = player.team;
			controller.sync = true;
			return controller;
		}
		function create_pane(i)
		{
			var X = $.data.UI.data.panel.pane_width*(i%4),
				Y = $.data.UI.data.panel.pane_height*Math.floor(i/4);
			var spic = new Fsprite({
				canvas: $.manager.panel_layer,
				img: pdata.bmp.small,
				xy: {x:X+$.data.UI.data.panel.x, y:Y+$.data.UI.data.panel.y},
				wh: 'fit'
			});
			$.panel[i].uid = uid;
			$.panel[i].name = player.name;
			$.panel[i].spic = spic;
			$.panel[i].hp_bound = new Fsprite({canvas: $.manager.panel_layer});
			$.panel[i].hp_bound.set_x_y( X+$.data.UI.data.panel.hpx, Y+$.data.UI.data.panel.hpy);
			$.panel[i].hp_bound.set_w_h( $.data.UI.data.panel.hpw, $.data.UI.data.panel.hph);
			$.panel[i].hp_bound.set_bgcolor( $.data.UI.data.panel.hp_dark);
			$.panel[i].hp = new Fsprite({canvas: $.manager.panel_layer});
			$.panel[i].hp.set_x_y( X+$.data.UI.data.panel.hpx, Y+$.data.UI.data.panel.hpy);
			$.panel[i].hp.set_w_h( $.data.UI.data.panel.hpw, $.data.UI.data.panel.hph);
			$.panel[i].hp.set_bgcolor( $.data.UI.data.panel.hp_bright);
			$.panel[i].mp_bound = new Fsprite({canvas: $.manager.panel_layer});
			$.panel[i].mp_bound.set_x_y( X+$.data.UI.data.panel.mpx, Y+$.data.UI.data.panel.mpy);
			$.panel[i].mp_bound.set_w_h( $.data.UI.data.panel.mpw, $.data.UI.data.panel.mph);
			$.panel[i].mp_bound.set_bgcolor( $.data.UI.data.panel.mp_dark);
			$.panel[i].mp = new Fsprite({canvas: $.manager.panel_layer});
			$.panel[i].mp.set_x_y( X+$.data.UI.data.panel.mpx, Y+$.data.UI.data.panel.mpy);
			$.panel[i].mp.set_w_h( $.data.UI.data.panel.mpw, $.data.UI.data.panel.mph);
			$.panel[i].mp.set_bgcolor( $.data.UI.data.panel.mp_bright);
		}
	}

	match.prototype.show_hp=function()
	{
		var $=this;
		if( $.panel)
		for( var i=0; i<$.panel.length; i++)
		{
			if( $.panel[i].uid!==undefined)
			{
				var ch = $.character[$.panel[i].uid],
					hp = Math.floor(ch.health.hp/ch.health.hp_full*$.data.UI.data.panel.hpw);
					hp_bound = Math.floor(ch.health.hp_bound/ch.health.hp_full*$.data.UI.data.panel.hpw);
				if( hp<0) hp=0;
				if( hp_bound<0) hp_bound=0;
				$.panel[i].hp.set_w(hp);
				$.panel[i].hp_bound.set_w(hp_bound);
				$.panel[i].mp.set_w(Math.floor(ch.health.mp/ch.health.mp_full*$.data.UI.data.panel.mpw));
				if( ch.effect.heal && ch.effect.heal>0 && $.time.t%3==0)
					$.panel[i].hp.set_bgcolor( $.data.UI.data.panel.hp_light);
				else
					$.panel[i].hp.set_bgcolor( $.data.UI.data.panel.hp_bright);
			}
		}
	}

	match.prototype.check_gameover=function()
	{
		var $=this;
		var teams={};
		if( !$.panel)
			return;
		for( var i=0; i<$.panel.length; i++)
		{
			if( $.panel[i].uid!==undefined)
			{
				var ch = $.character[$.panel[i].uid];
				if( ch.health.hp>0)
					teams[ch.team] = true;
			}
		}
		if( Object.keys(teams).length<2)
		{
			if( !$.gameover_state)
				$.gameover_state = $.time.t;
			else
				if( $.time.t == $.gameover_state + 30)
					$.gameover();
		}
		else
		{
			if( $.gameover_state)
			{
				$.gameover_state = false;
				$.gameover();
			}
		}
	}

	match.prototype.gameover=function()
	{
		var $=this;
		if( $.gameover_state)
		{
			var info = [];
			var teams = {};
			for( var i=0; i<$.panel.length; i++)
			{
				if( $.panel[i].uid!==undefined)
				{
					var ch = $.character[$.panel[i].uid];
					if( ch.health.hp>0)
						teams[ch.team] = true;
				}
			}
			for( var i=0; i<$.panel.length; i++)
			{
				if( $.panel[i].uid!==undefined)
				{
					var ch = $.character[$.panel[i].uid];
					var alive = ch.health.hp>0;
					var win = teams[ch.team];
					//[ Icon, Name, Kill, Attack, HP Lost, MP Usage, Picking, Status ]
					info.push([ch.data.bmp.small, $.panel[i].name, ch.stat.kill, ch.stat.attack, ch.health.hp_lost, ch.health.mp_usage, ch.stat.picking, (win?'Win':'Lose')+' ('+(alive?'Alive':'Dead')+')']);
				}
			}
			$.manager.summary.set_info(info);
			var dur = $.time.t/Global.gameplay.framerate;
			$.manager.summary.set_time(new Date(dur*1000).toISOString().substr(14,5));
			$.manager.summary.show();
			$.manager.sound.play('1/m_end');
		}
		else
		{
			$.manager.summary.hide();
		}
	}

	match.prototype.key=function(K,down)
	{
		var $=this;
		if( $.gameover_state)
		{
			if( down)
			if( $.time.t > $.gameover_state + 60)
			if( K==='att' || K==='jump')
				$.F4();
		}
	}

	match.prototype.create_effects=function(config)
	{
		var $=this;
		var effects = Futil.extract_array( util.selectA_from($.data.object,{type:'effect'}), ['data','id']);
		var broken  = util.select_from($.data.object,{type:'broken'});
		$.broken_list = Futil.group_elements( broken.data.broken_list, 'id');
		$.visualeffect = $.effect[0] = new factory.effect( {match:$, stage:$.stage}, effects.data, effects.id);
		$.brokeneffect = $.effect[1] = new factory.effect( {match:$, stage:$.stage, broken_list:$.broken_list}, broken.data,  broken.id);
	}

	match.prototype.drop_weapons=function(setup)
	{
		var $=this;
		var num=5;
		var weapon_list=
		util.selectA_from($.data.object,function(o)
		{
			return 100 <= o.id && o.id < 200;
		});
		for( var i=0; i<num; i++)
		{
			var O=$.background.get_pos($.random(),$.random());
			O.y=-800;
			$.create_weapon(weapon_list[Math.floor(weapon_list.length*$.random())].id, O);
		}
	}

	match.prototype.destroy_weapons=function()
	{
		var $=this;
		for( var i in $.lightweapon)
			$.lightweapon[i].health.hp = 0;
		for( var i in $.heavyweapon)
			$.heavyweapon[i].health.hp = 0;
	}

	match.prototype.create_weapon=function(id,pos)
	{
		var $=this;
		var weapon= id<150 ? 'lightweapon':'heavyweapon';
		var wea_config=
		{
			match: $
		};
		var object = util.select_from($.data.object,{id:id});
		var wea = new factory[weapon]( wea_config, object.data, object.id);
		wea.set_pos(pos.x,pos.y,pos.z);
		var uid = $.scene.add(wea);
		$[weapon][uid] = wea;
	}

	match.prototype.create_background=function(bg)
	{
		var $=this;
		if( bg)
		{
			var bgdata = util.select_from($.data.background,{id:bg.id}).data;
			$.background = new Background({
				layers: $.manager.background_layer,
				scrollbar: $.manager.gameplay,
				camerachase: {character:$.character},
				onscroll: function(){ $.manager.canvas.render()}
			},bgdata,bg.id);
			$.stage = $.background.floor;
		}
		else
		{
			$.background = new Background(null); //create an empty background
			$.stage = $.manager.canvas;
		}
	}

	match.prototype.F4=function()
	{
		var $=this;
		$.destroy();
		$.manager.match_end();
	}

	match.prototype.F7=function()
	{
		var $=this;
		for( var i in $.character)
		{
			var ch = $.character[i];
			ch.health.hp=ch.health.hp_full=ch.health.hp_bound= ch.proper('hp') || Global.gameplay.default.health.hp_full;
			ch.health.mp=ch.health.mp_full;
		}
	}

	match.prototype.new_randomseed=function()
	{
		var rand = new Random();
		rand.seed(this.manager.random());
		return rand;
	}

	match.prototype.random=function()
	{
		return this.randomseed.next();
	}

	match.prototype.overlay_message=function(mess)
	{
		var $=this;
		if( $.manager.overlay_mess)
		{
			$.manager.overlay_mess.show();
			var item = $.data.UI.data.message_overlay[mess];
			$.manager.overlay_mess.set_img_x_y(-item[0],-item[1]);
			$.manager.overlay_mess.set_w_h(item[2],item[3]);
		}
	}

	match.prototype.create_controller=function(funcon)
	{
		var $=this;
		function show_pause()
		{
			if( !$) return;
			if( $.time.paused)
				$.overlay_message('pause');
		}
		if( funcon)
		{
			funcon.sync=true;
			funcon.child.push ({
				key: function(I,down)
				{
					var opaused = $.time.paused; //original pause state
					if( down)
					{
						switch (I)
						{
							case 'F1':
								if( !$.time.paused)
									$.time.paused=true;
								else
									$.time.paused=false;
							break;

							case 'F2':
								$.time.paused='F2';
							break;

							case 'esc':
							case 'F4':
								$.F4();
							break;

							case 'F6':
								if( !$.F6_mode)
									$.F6_mode=true;
								else
									$.F6_mode=false;
							break;

							case 'F7':
								$.F7();
							break;

							case 'F8':
								$.drop_weapons();
							break;

							case 'F9':
								$.destroy_weapons();
							break;
						}
						if( (I==='F1' || I==='F2') && $.time.paused)
						{
							$.manager.overlay_mess.hide();
							setTimeout(show_pause,4); //so that the 'pause' message blinks
						}
						else if( !$.time.paused)
						{
							$.manager.overlay_mess.hide();
						}
						if( opaused !== $.time.paused)
						{	//state change
							if( $.time.paused)
							{
								if( funcon.paused)
									funcon.paused(true);
							}
							else
							{
								if( funcon.paused)
									funcon.paused(false);
							}
						}
					}
				}
			});
			return funcon;
		}
	}

	return match;
});
