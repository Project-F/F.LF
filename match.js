/*\
 * match
 * a match hosts a game.
 * a match is a generalization above game modes (e.g. VSmode, stagemode, battlemode)
\*/

define(['F.core/util','F.core/controller',
'LF/factories','LF/scene','LF/third_party/random','LF/util'],
function(Futil,Fcontroller,
factory,Scene,Random,util)
{
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
	}

	match.prototype.create=function(setting)
	{
		/**
		setting =
		{
			player:
			[
				{controller, id, team},,,
			],
			background:
			{
			},
			control: 'debug'
		}
		 */
		var char_list=[];
		for( var i=0; i<setting.player.length; i++)
			char_list.push(setting.player[i].id);
		if( !setting.set) setting.set={};
		var $=this;

		this.data.object.load(char_list,function()
		{
			$.scene = new Scene();
			$.effects = $.create_effects($.config.effects);
			$.character = $.create_characters(setting.player);
			$.randomseed = $.new_randomseed();
			$.control = $.create_controller(setting.control);
			$.lightweapon=[];
			$.heavyweapon=[];
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

	//all methods below are considered private

	match.prototype.create_timer=function()
	{
		var $=this;
		$.time =
		{
			t:0,
			paused: false,
			timer: null,
			$fps: document.getElementById('fps')
		};
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
			$.calculate_fps(1);
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
	}

	match.prototype.emit_event=function(E)
	{
		var $=this;
		if( $.state && $.state.event) $.state.event.call(this, E);
	}

	match.prototype.for_all=function(oper)
	{
		var $=this;
		for( var i=0; i<$.character.length; i++)   $.character[i][oper]();
		for( var i=0; i<$.lightweapon.length; i++) $.lightweapon[i][oper]();
		for( var i=0; i<$.heavyweapon.length; i++) $.heavyweapon[i][oper]();
		$.effects[oper]();
	}

	match.prototype.calculate_fps=function(mul)
	{
		var $=this;
		if( $.time.$fps)
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
		var pos=[
			{x:400,y:0,z:200},
			{x:300,y:0,z:200},
			{x:200,y:0,z:200},
			{x:500,y:0,z:200}
		];
		var array=[];
		var char_config =
		{
			spec: $.spec,
			controller: null,
			match: $,
			stage: $.stage,
			scene: $.scene,
			effects: $.effects,
			team: 0
		};
		for( var i=0; i<players.length; i++)
		{
			var player = players[i];
			var pdata = util.select_from($.data.object,{id:player.id}).data;
			char_config.controller = player.controller;
			char_config.team = player.team;
			var len = array.push( new factory.character (char_config, pdata, player.id) );
			// TODO: player placements
			array[len-1].set_pos( pos[len-1].x, pos[len-1].y, pos[len-1].z);
		}
		return array;
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
		return new factory.effects ( effects_config, param.data, param.id);
	}

	match.prototype.create_random=function()
	{
	}

	match.prototype.drop_weapons=function(setup)
	{
		var $=this;
		if( setup)
		{
			$.create_weapon( 100, {x:100,y:-800,z:200});
			$.create_weapon( 101, {x:500,y:-800,z:200});
			$.create_weapon( 150, {x:400,y:-800,z:250});
		}
	}

	match.prototype.create_weapon=function(id,pos)
	{
		var $=this;
		var weapon= id<150 ? 'lightweapon':'heavyweapon';
		var wea_config=
		{
			spec: $.spec,
			match: $,
			stage: $.stage,
			scene: $.scene,
			effects: $.effects
		};
		var res=Futil.arr_search(
			$.grouped_object[weapon],
			function (X) { return X.id===id;}
		);
		var object = $.grouped_object[weapon][res];
		var wea = new factory[weapon]( wea_config, object.data, object.id);
		wea.set_pos(pos.x,pos.y,pos.z);

		$[weapon].push(wea);
	}

	match.prototype.periodic_event=function(event)
	{
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
			var config =
			{
				'0':'0','1':'1','2':'2','3':'3','4':'4','5':'5','6':'6','7':'7','8':'8','9':'9',
				ctrl:'ctrl'
			};
			var Fcon = new Fcontroller(config);
			Fcon.child.push ({
				key: function(I,down)
				{
					if( down)
					{
						switch (I)
						{
							case '1':
								if( !$.time.paused)
									$.time.paused=true;
								else
									$.time.paused=false;
							break;

							case '2':
								if( $.time.paused)
									$.TU_trans();
								else
									$.time.paused=true;
							break;
						}
					}
				}
			});
			Fcon.sync=true;
			return Fcon;
		}
	}

	return match;
});
