/*\
 * match
 * a match hosts a game.
 * a match is a generalization above game modes (e.g. VSmode, stagemode, battlemode)
\*/

define(['F.core/util','F.core/controller',
'LF/factories','LF/scene','LF/third_party/random'],
function(Futil,Fcontroller,
factory,Scene,Random)
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
		this.stage = config.stage;
		this.state = config.state;
		this.data = config.package.data;
		this.spec = config.package.properties;
		this.grouped_object = Futil.group_elements(this.data.object,'type');
		this.config = config.config;
		if( !this.config)
			this.config = {};
		this.time;
	}

	match.prototype.create=function(setting)
	{
		/**
		setting =
		{
			player:
			[
				{controller, data, id, team},,,
			],
			background:
			{
			},
			control: 'debug'
		}
		 */
		this.scene = new Scene();
		this.effects = this.create_effects(this.config.effects);
		this.character = this.create_characters(setting.player);
		this.randomseed = this.new_randomseed();
		this.control = this.create_controller(setting.control);
		this.lightweapon=[];
		this.heavyweapon=[];
		this.drop_weapons();
		this.create_timer();
	}

	match.prototype.create_timer=function()
	{
		this.time =
		{
			paused: false,
			timer: null,
			$fps: document.getElementById('fps')
		};
		var This=this;
		this.time.timer = setInterval( function(){This.frame();}, 1000/30.5);
	}

	match.prototype.frame=function()
	{
		if( this.control)
			this.control.fetch();

		if( !this.time.paused)
		{
			this.TU_trans();
			this.calculate_fps(1);
		}
		else
		{
			if( this.time.$fps)
				this.time.$fps.value='paused';
		}
	}

	match.prototype.TU_trans=function()
	{
		this.for_all('transit');
		this.for_all('TU');
	}

	match.prototype.for_all=function(oper)
	{
		for( var i in this.character) this.character[i][oper]();
		for( var i in this.lightweapon) this.lightweapon[i][oper]();
		for( var i in this.heavyweapon) this.heavyweapon[i][oper]();
		this.effects[oper]();
	}

	match.prototype.calculate_fps=function(mul)
	{
		if( this.time.$fps)
		{
			var ot=this.time.time;
			this.time.time = new Date().getTime();
			var diff = this.time.time-ot;
			this.time.$fps.value = Math.round(1000/diff*mul)+'fps';
		}
	}

	match.prototype.create_characters=function(players)
	{
		var pos=[
			{x:400,y:0,z:200},
			{x:300,y:0,z:200},
			{x:200,y:0,z:200},
			{x:500,y:0,z:200}
		];
		var array=[];
		var char_config =
		{
			spec: this.spec,
			controller: null,
			match: this,
			stage: this.stage,
			scene: this.scene,
			effects: this.effects,
			team: 0
		};
		for( var i=0; i<players.length; i++)
		{
			var player = players[i];
			char_config.controller = player.controller;
			char_config.team = player.team;
			var len = array.push( new factory.character (char_config,player.data,player.id) );
			// TODO: player placements
			array[len-1].set_pos( pos[len-1].x, pos[len-1].y, pos[len-1].z);
		}
		return array;
	}

	match.prototype.create_effects=function(config)
	{
		var effects_config = config ? config :
		{	//default effects config
			init_size: 20
		};
		effects_config.match = this;
		effects_config.stage = this.stage;

		var param = Futil.extract_array( this.grouped_object.effects, ['data','id']);
		return new factory.effects ( effects_config, param.data, param.id);
	}

	match.prototype.create_random=function()
	{
	}

	match.prototype.drop_weapons=function()
	{
		this.create_weapon( 100, {x:100,y:-800,z:200});
		this.create_weapon( 101, {x:500,y:-800,z:200});
		this.create_weapon( 150, {x:400,y:-800,z:250});
	}

	match.prototype.create_weapon=function(id,pos)
	{
		var weapon= id<150 ? 'lightweapon':'heavyweapon';
		var wea_config=
		{
			spec: this.spec,
			match: this,
			stage: this.stage,
			scene: this.scene,
			effects: this.effects
		};
		var res=Futil.arr_search(
			this.grouped_object[weapon],
			function (X) { return X.id===id;}
		);
		var object = this.grouped_object[weapon][res];
		var wea = new factory[weapon]( wea_config, object.data, object.id);
		wea.set_pos(pos.x,pos.y,pos.z);

		this[weapon].push(wea);
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
		if( allow==='debug')
		{
			var config =
			{
				'0':'0','1':'1','2':'2','3':'3','4':'4','5':'5','6':'6','7':'7','8':'8','9':'9',
				ctrl:'ctrl'
			};
			var Fcon = new Fcontroller(config);
			var This = this;
			Fcon.child.push ({
				key: function(I,down)
				{
					if( down)
					{
						switch (I)
						{
							case '1':
								if( !This.time.paused)
									This.time.paused=true;
								else
									This.time.paused=false;
							break;

							case '2':
								if( This.time.paused)
									This.TU_trans();
								else
									This.time.paused=true;
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
