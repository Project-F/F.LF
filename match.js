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

		//UI
		if( util.div('pauseMessage'))
		{
			$.pause_mess = new Fsprite({
				inplace_div: util.div('pauseMessage'),
				img: $.data.UI.pause
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
				pane.set_x_y(GA.panel.pane.width*(i%4), GA.panel.pane.height*Math.floor(i/4));
				$.panel.push(pane);
			}
		}
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
		var char_list=[];
		for( var i=0; i<setting.player.length; i++)
			char_list.push(setting.player[i].id);
		if( !setting.set) setting.set={};
		var $=this;

		$.randomseed = $.new_randomseed();
		$.create_scenegraph();
		$.create_effects($.config.effects);
		$.control = $.create_controller(setting.control);
		$.create_background(setting.background);

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

	match.prototype.destroy_object=function(obj)
	{
		
	}

	//all methods below are considered private

	match.prototype.create_scenegraph=function()
	{
		var $=this;
		$.scene = new Scene();
		$.character = {};
		$.weapon = {};
		$.effect = {};
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
		$.time.timer = setInterval( function(){$.frame();}, 1000/30.5);
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
			$.emit_event('start');
		$.time.t++;
	}

	match.prototype.TU_trans=function()
	{
		var $=this;
		$.emit_event('transit');
		$.for_all('transit');
		$.emit_event('TU');
		$.for_all('TU');
		$.background.TU();
		if( $.panel)
			$.show_hp();
	}

	match.prototype.emit_event=function(E)
	{
		var $=this;
		if( $.state && $.state.event) $.state.event.call(this, E);
	}

	match.prototype.for_all=function(oper)
	{
		var $=this;
		for( var i in $.character)
			$.character[i][oper]();
		for( var i in $.weapon)
			$.weapon[i][oper]();
		for( var i in $.effect)
			$.effect[i][oper]();
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
		for( var i in $.character)
		{
			var ch = $.character[i];
			$.panel[i].hp.set_w(Math.floor(ch.health.hp/ch.health.hp_full*$.data.UI.panel.hpw));
			$.panel[i].hp_bound.set_w(Math.floor(ch.health.hp_bound/ch.health.hp_full*$.data.UI.panel.hpw));
			$.panel[i].mp.set_w(Math.floor(ch.health.mp/ch.health.mp_full*$.data.UI.panel.mpw));
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
		$.effect[0] = new factory.effects ( effects_config, param.data, param.id);
		$.visualeffect = $.effect[0];
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
		var res=Futil.arr_search(
			$.grouped_object[weapon],
			function (X) { return X.id===id;}
		);
		var object = $.grouped_object[weapon][res];
		var wea = new factory[weapon]( wea_config, object.data, object.id);
		wea.set_pos(pos.x,pos.y,pos.z);
		var uid = $.scene.add(wea);
		$.weapon[uid] = wea;
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
							$.pause_mess.show();
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
