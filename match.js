/*\
 * match
 * a match hosts a game.
 * a match is a generalization above game modes (e.g. VSmode, stagemode, battlemode)
\*/

define(['F.core/util','F.core/controller','F.core/sprite',
'LF/factories','LF/scene','LF/background','LF/third_party/random','LF/util',
'LF/global'],
function(Futil,Fcontroller,Fsprite,
factory,Scene,Background,Random,util,
Global)
{
	var GA=Global.application;
	/*\
	 * match
	 [ class ]
	 |	config =
	 |	{
	 |	stage,  //the XZ plane to place all living objects
	 |	state,  //the state machine handling various events in a match
	 |	config, //default config for each object type
	 |	package	//the content package
	 |	}
	\*/
	function match(config)
	{
		var $=this;
		$.stage = config.stage;
		$.state = config.state;
		$.data = config.package.data;
		$.spec = config.package.properties;
		$.grouped_object = Futil.group_elements($.data.object,'type');
		$.config = config.config;
		if( !$.config)
			$.config = {};
		$.time;
		$.setup_UI();
	}

	match.prototype.create=function(setting)
	{
		/** setting={
			player:
			[
				{
					controller: control1,
					id: 30,
					team: 1
				},
				{
					controller: control2,
					id: 1,
					team: 2
				}
			],
			control: 'debug',
			set:
			{
				weapon: true
			},
			background: {id:1}
		} */
		var $=this;
		var char_list=[];
		for( var i=0; i<setting.player.length; i++)
		{
			var name = util.filename(util.select_from($.grouped_object.character,{id:setting.player[i].id}).file);
			var objects = util.select_from($.data.object,function(O){
					if( !O.file) return;
					var file = util.filename(O.file);
					if( file.lastIndexOf('_')!==-1)
						file = file.slice(0,file.lastIndexOf('_'));
					return file===name;
				});

			/** if `deep.js` is of type character, any files matching `deep_*` will also be lazy loaded
				here we have to load all characters and associated data files
			 */
			char_list = char_list.concat(Futil.extract_array(Futil.make_array(objects),'id').id);
		}
		if( !setting.set) setting.set={};

		$.randomseed = $.new_randomseed();
		$.create_scenegraph();
		$.create_effects($.config.effects);
		$.control = $.create_controller(setting.control);
		$.create_background(setting.background);
		$.tasks = []; //pending tasks

		this.data.object.load(char_list,function()
		{
			if( setting.player)
				$.create_characters(setting.player);
			if( setting.set.weapon)
				$.drop_weapons(setting.set.weapon);
			$.create_timer();
		});
	}

	match.prototype.destroy=function()
	{
		var $=this;
		$.time.paused=true; //pause execution
		clearInterval($.time.timer);

		$.for_all('destroy'); //destroy all objects
		var e=$.stage; //clear the stage DOM node
		while (e.lastChild)
			e.removeChild(e.lastChild);
	}

	match.prototype.log=function(mes)
	{
		console.log(this.time.t+': '+mes);
	}

	match.prototype.setup_UI=function()
	{
		var $=this;
		if( util.div('pauseMessage'))
		{
			$.pause_mess = new Fsprite({
				div: util.div('pauseMessage'),
				img: $.data.UI.pause,
				wh: 'fit'
			});
			$.pause_mess.hide();
		}
		if( util.div('panel'))
		{
			$.panel=[];
			for( var i=0; i<8; i++)
			{
				var pane = new Fsprite({
					canvas: util.div('panel'),
					img: $.data.UI.panel.pic,
					wh: 'fit'
				});
				pane.set_x_y($.data.UI.panel.pane_width*(i%4), $.data.UI.panel.pane_height*Math.floor(i/4));
				$.panel.push(pane);
			}
		}
	}

	match.prototype.create_object=function(opoint, parent)
	{
		var $=this;
		$.tasks.push({
			task: 'create_object',
			opoint: opoint,
			team: parent.team,
			pos: parent.mech.make_point(opoint),
			z: parent.ps.z,
			dir: parent.ps.dir
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
		$.time.timer = setInterval( function(){$.frame();}, 1000/30);
	}

	match.prototype.frame=function()
	{
		var $=this;
		if( $.control)
			$.control.fetch();

		if( !$.time.paused)
		{
			$.TU_trans();
			if( $.time.t%30===0)
				$.calculate_fps(30);
		}
		else
		{
			if( $.time.$fps)
				$.time.$fps.value='paused';
		}
		if( $.time.t===0)
			$.match_event('start');
		$.time.t++;
	}

	match.prototype.TU_trans=function()
	{
		var $=this;
		$.emit_event('transit');
		$.process_tasks();
		$.emit_event('TU');
		$.background.TU();
		if( $.panel)
			$.show_hp();
	}

	match.prototype.match_event=function(E)
	{
		var $=this;
		if( $.state && $.state.event) $.state.event.call(this, E);
	}

	match.prototype.emit_event=function(E)
	{
		var $=this;
		if( $.state && $.state.event) $.state.event.call(this, E);
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
			if( T.opoint.kind===1)
			{
				if( T.opoint.oid)
				{
					var OBJ = util.select_from($.data.object,{id:T.opoint.oid});
					var config =
					{
						match: $,
						team: T.team
					};
					var obj = new factory[OBJ.type](config, OBJ.data, T.opoint.oid);
					obj.init(T.pos, T.z, T.dir, T.opoint);
					var uid = $.scene.add(obj);
					$[obj.type][uid] = obj;
				}
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

	match.prototype.calculate_fps=function(mul)
	{
		var $=this;
		var ot=$.time.time;
		$.time.time = new Date().getTime();
		var diff = $.time.time-ot;
		$.time.$fps.value = Math.round(1000/diff*mul)+'fps';
	}

	match.prototype.create_characters=function(players)
	{
		var $=this;
		var pos=[
			$.background.get_pos(0.55,0.5),
			$.background.get_pos(0.45,0.5),
			$.background.get_pos(0.40,0.5),
			$.background.get_pos(0.60,0.5)
		];
		var char_config =
		{
			match: $,
			controller: null,
			team: 0
		};
		for( var i=0; i<players.length; i++)
		{
			var player = players[i];
			var pdata = util.select_from($.data.object,{id:player.id}).data;
			char_config.controller = player.controller;
			char_config.team = player.team;
			var char = new factory.character(char_config, pdata, player.id);
			char.set_pos( pos[i].x, pos[i].y, pos[i].z); //TODO: proper player placements
			var uid = $.scene.add(char);
			$.character[uid] = char;
			//pane
			if( $.panel)
			{
				var spic = new Fsprite({
					canvas: $.panel[i].el,
					img: pdata.bmp.small,
					wh: 'fit'
				});
				spic.set_x_y($.data.UI.panel.x,$.data.UI.panel.y);
				$.panel[i].uid = uid;
				$.panel[i].hp_bound = new Fsprite({canvas: $.panel[i].el});
				$.panel[i].hp_bound.set_x_y( $.data.UI.panel.hpx, $.data.UI.panel.hpy);
				$.panel[i].hp_bound.set_w_h( $.data.UI.panel.hpw, $.data.UI.panel.hph);
				$.panel[i].hp_bound.el.style.background = $.data.UI.panel.hp_dark;
				$.panel[i].hp = new Fsprite({canvas: $.panel[i].el});
				$.panel[i].hp.set_x_y( $.data.UI.panel.hpx, $.data.UI.panel.hpy);
				$.panel[i].hp.set_w_h( $.data.UI.panel.hpw, $.data.UI.panel.hph);
				$.panel[i].hp.el.style.background = $.data.UI.panel.hp_bright;
				$.panel[i].mp_bound = new Fsprite({canvas: $.panel[i].el});
				$.panel[i].mp_bound.set_x_y( $.data.UI.panel.mpx, $.data.UI.panel.mpy);
				$.panel[i].mp_bound.set_w_h( $.data.UI.panel.mpw, $.data.UI.panel.mph);
				$.panel[i].mp_bound.el.style.background = $.data.UI.panel.mp_dark;
				$.panel[i].mp = new Fsprite({canvas: $.panel[i].el});
				$.panel[i].mp.set_x_y( $.data.UI.panel.mpx, $.data.UI.panel.mpy);
				$.panel[i].mp.set_w_h( $.data.UI.panel.mpw, $.data.UI.panel.mph);
				$.panel[i].mp.el.style.background = $.data.UI.panel.mp_bright;
			}
		}
	}

	match.prototype.show_hp=function()
	{
		var $=this;
		for( var i=0; i<$.panel.length; i++)
		{
			if( $.panel[i].uid!==undefined)
			{
				var ch = $.character[$.panel[i].uid],
					hp = Math.floor(ch.health.hp/ch.health.hp_full*$.data.UI.panel.hpw);
					hp_bound = Math.floor(ch.health.hp_bound/ch.health.hp_full*$.data.UI.panel.hpw);
				if( hp<0) hp=0;
				if( hp_bound<0) hp_bound=0;
				$.panel[i].hp.set_w(hp);
				$.panel[i].hp_bound.set_w(hp_bound);
				$.panel[i].mp.set_w(Math.floor(ch.health.mp/ch.health.mp_full*$.data.UI.panel.mpw));
			}
		}
	}

	match.prototype.create_effects=function(config)
	{
		var $=this;
		var effects_config = config ? config :
		{	//default effects config
			init_size: 20
		};
		effects_config.match = $;
		effects_config.stage = $.stage;

		var param = Futil.extract_array( $.grouped_object.effects, ['data','id']);
		$.effects[0] = new factory.effects ( effects_config, param.data, param.id);
		$.visualeffect = $.effects[0];
	}

	match.prototype.drop_weapons=function(setup)
	{
		var $=this;
		var A=$.background.get_pos(0.35,0.5),
			B=$.background.get_pos(0.70,0.5),
			C=$.background.get_pos(0.50,0.8);
		A.y=B.y=C.y=-800;
		$.create_weapon( 100, A);
		$.create_weapon( 101, B);
		$.create_weapon( 150, C);
	}

	match.prototype.create_weapon=function(id,pos)
	{
		var $=this;
		var weapon= id<150 ? 'lightweapon':'heavyweapon';
		var wea_config=
		{
			match: $
		};
		var object = util.select_from($.grouped_object[weapon],{id:id});
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
				layers:util.div('background'),
				floor:util.div('floor'),
				scrollbar:true,
				camerachase:{character:$.character}
			},bgdata,bg.id);
		}
		else
			$.background = new Background(null); //create an empty background
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
		rand.seed_bytime();
		return rand;
	}

	match.prototype.random=function()
	{
		return this.randomseed.next();
	}

	match.prototype.create_controller=function(allow)
	{
		var $=this;
		function show_pause()
		{
			if( $.time.paused)
				$.pause_mess.show();
		}
		if( allow==='debug')
		{
			var funkey_config =
			{
				'F1':'F1','F2':'F2','F3':'F3','F4':'F4','F5':'F5','F6':'F6','F7':'F7','F8':'F8','F9':'F9','F10':'F10'
			};
			var Fcon = new Fcontroller(funkey_config);
			Fcon.child.push ({
				key: function(I,down)
				{
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
								if( $.time.paused)
									$.TU_trans();
								else
									$.time.paused=true;
							break;
							case 'F7':
								$.F7();
							break;
						}
						if( $.time.paused)
						{
							$.pause_mess.hide();
							setTimeout(show_pause,2); //so that the 'pause' message blinks
						}
						else
							$.pause_mess.hide();
					}
				}
			});
			Fcon.sync=true;
			return Fcon;
		}
	}

	return match;
});
