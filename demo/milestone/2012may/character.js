//character in F.LF
/*	A character config defines the
		-look (sprite config)
		-act (animator config)
		-behave (state config)
		-special moves (combo config)
	of a character.
	With this character config, you can generate many characters (which are instances of a character).
	A character contains
		-a sprite object
		-an animator set
		-2 states objects
		-a reference to controller
		-a combo detector
	. However a player will not live without someone to control,
	that is why character keeps a reference to controller which is used to
		-provide state of each key to states
		-provide key events to combo detector
 */
/*	require: F.js, math.js, sprite.js, states.js, combodec.js
 */
/*	character_config=
	{
		sp: sprite_config,
		ani: animator_config,
		state: state_config,
		con: reference_to_controller,
		combo: combo_list
	}
 */

define( ['core/util','core/sprite','core/animator','core/states','core/combodec'],function(F,Fsprite,Fanimator,Fstates,Fcombodec)
{

function character(config)
{
	this.name='I am a LF2 character';

	//sprite
	var sp = this.sp = new Fsprite(config.sp);
	sp.x=100; sp.y=0; sp.z=100;
	sp.set_xy({x:sp.x, y:sp.y+sp.z});

	//animator
	config.ani.base.tar=sp; //specify the target Fsprite
	var ani = this.ani = Fanimator.set(config.ani,'base');

	//states
	if( config.state.event && config.state.event.entry)
	{
		var init_event=config.state.event; //store the original
		config.state.event = null;
	}
	var state = this.state = new Fstates(config.state);
	state.C = this;
	/*state.log_enable=true;
	state.log_size=1000;
	state.log_filter=function(I)
	{
		if( I.event && I.event.match(/fps/))
			return true;
	}
	document.getElementById('log').onclick=function()
	{
		alert(state.show_log());
	};*/

	//controller
	var con = this.con = config.con;

	//combo detector
	var basic_combo = [
		{ name:'def', seq:['def']},
		{ name:'jump', seq:['jump']},
		{ name:'att', seq:['att']}
		//combo detector can eliminate repeated key strokes
	];
	var dec_con = //combo detector config
	{
		rp: {up:99,down:99,left:99,right:99,def:99,jump:99,att:99}, //the same key must repeat no more than X times
		timeout:30, //time to clear buffer (approx. 1s in 30fps)
		comboout:8, //the max time interval(in frames) between keys to make a combo
		callback: function(K) //callback function when combo detected
		{
			state.event(K.name);
		},
		no_repeat_key: true //eliminate repeated key strokes by browser
	}
	var dec = this.dec = new Fcombodec(con, dec_con, basic_combo.concat(config.combo));

	//the left-right switch
	this.lrswitch =
	{
		frame: function()
		{
			if( con.state.left||con.state.right)
			{
				var event=con.state.left?'left_pressed':'right_pressed';
				if( this.enable_dir)
					dir.event(event);
				state.event(event);
			}
		},
		enable_dir: true
	}

	//direction switcher
	var dir_con =
	{
		event:
		{
			entry: 'right'
		},
		left:
		{
			event:
			{
				'right_pressed':'right',
				entry: function()
				{
					sp.switch_img('l');
				}
			}
		},
		right:
		{
			event:
			{
				'left_pressed':'left',
				entry: function()
				{
					sp.switch_img('r');
				}
			}
		}
	}
	var dir = this.dir = new Fstates(dir_con);

	//initiate `states` after everything have been set up
	if( init_event)
	{
		config.state.event = init_event; //restore the original config
		state.state.event = F.extend_object({},init_event);
		state.chain_event(true,state.cur,1,'entry'); //make an entry event
	}
}

character.prototype.switch_dir=function(bool)
{
	this.lrswitch.enable_dir=bool;
}

character.prototype.set_frame=function(f, animator_name)
{
	var tar=animator_name;
	if( !tar) tar = this.state.cur_name;
	this.ani[tar].set_frame(f);
}

character.prototype.next_frame=function(animator_name)
{
	var tar=animator_name;
	if( !tar) tar = this.state.cur_name;
	this.ani[tar].next_frame();
}

character.prototype.move=function(state)
{	//perform dvx, dvy, dvz
	if( state.data.dvx) this.sp.x += (this.dir.cur_name=='left'?-1:1)* state.data.dvx;
	if( state.data.dvy) this.sp.y += state.data.dvy;
	if( state.data.dvz) this.sp.z += state.data.dvz;
	this.sp.set_xy({x:this.sp.x, y:this.sp.y+this.sp.z});
}

character.prototype.next=function(event,wait)
{
	this.state.event_delay(event,wait,'30fps');
}

character.prototype.frame=function(f)
{
	switch (f)
	{
		case '4fps': case '8fps': case '10fps':
			this.state.event(f);
		break;
		case '30fps':
			this.lrswitch.frame();
			this.state.event(f);
			this.dec.frame(); //combo detector
		break;
	}
}

return character;
});
